// SQLite-based server (no MongoDB needed)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Basic HTML escaping to prevent injection in email templates
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Create SQLite database
const db = new sqlite3.Database('./portfolio.db', (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Create bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    paid BOOLEAN DEFAULT 0,
    stripeSessionId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating bookings table:', err);
    } else {
      console.log('✅ Bookings table ready');
    }
  });

  // Create admins table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating admins table:', err);
    } else {
      console.log('✅ Admins table ready');
    }
  });

  // Check if admin exists, if not create default admin
  db.get("SELECT * FROM admins WHERE username = 'admin'", (err, row) => {
    if (err) {
      console.error('❌ Error checking admin:', err);
      return;
    }
    if (!row) {
      bcrypt.hash('admin123', 10).then(hash => {
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash], (err) => {
          if (err) {
            console.error('❌ Error creating admin:', err);
          } else {
            console.log('✅ Default admin created (username: admin, password: admin123)');
          }
        });
      }).catch(err => {
        console.error('❌ Error hashing password:', err);
      });
    } else {
      console.log('✅ Admin user already exists');
    }
  });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Email transporter setup function
function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not configured. Emails will not be sent.');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({ message: 'Email service not configured on server.' });
    }

    const toAddress = process.env.CONTACT_TO || process.env.EMAIL_USER;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toAddress,
      replyTo: email,
      subject: `New Portfolio Contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Sent from Portfolio website contact form.</p>
      `
    });

    res.json({ success: true, message: 'Message sent successfully. Thank you for reaching out!' });
  } catch (err) {
    console.error('Contact form email error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

// Booking routes
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, service, date, time, notes } = req.body;

    // Basic validation
    if (!name || !email || !service || !date || !time) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Validate date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Booking date must be in the future.' });
    }

    // Save booking to SQLite
    db.run(
      "INSERT INTO bookings (name, email, service, date, time, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, service, date, time, notes || ''],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to save booking.' });
        }

        console.log('New booking saved with ID:', this.lastID);

        // Send email (if configured)
        const transporter = createTransporter();
        if (transporter) {
          const safeService = escapeHtml(service.replace(/-/g, ' ').toUpperCase());
          const safeName = escapeHtml(name);
          const safeDate = escapeHtml(date);
          const safeTime = escapeHtml(time);
          const safeNotes = escapeHtml(notes || 'None');

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Booking Confirmation - Payment Required',
            html: `
              <h2>Booking Confirmation</h2>
              <p>Dear ${safeName},</p>
              <p>Your booking has been confirmed with the following details:</p>
              <ul>
                <li><strong>Service:</strong> ${safeService}</li>
                <li><strong>Date:</strong> ${safeDate}</li>
                <li><strong>Time:</strong> ${safeTime}</li>
                <li><strong>Notes:</strong> ${safeNotes}</li>
              </ul>
              <p><strong>Payment Required:</strong> 6 BHD</p>
              <p>Please complete your payment to secure your booking. We will contact you with payment instructions.</p>
              <p>Thank you for choosing our services!</p>
              <p>Best regards,<br>Your Portfolio Team</p>
            `
          };

          transporter.sendMail(mailOptions).then(() => {
            console.log('Email sent to:', email);
          }).catch(emailError => {
            console.error('Email sending failed:', emailError);
          });
        }

        res.json({ 
          success: true, 
          message: 'Booking submitted successfully! Check your email for payment instructions.' 
        });
      }
    );

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create booking. Please try again.' 
    });
  }
});

// Admin routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    db.get("SELECT * FROM admins WHERE username = ?", [username], async (err, admin) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.adminId = admin.id;
      res.json({ success: true, message: 'Login successful' });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/admin/bookings', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  db.all("SELECT * FROM bookings ORDER BY createdAt DESC", (err, bookings) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch bookings' });
    }
    res.json(bookings);
  });
});

app.put('/api/admin/bookings/:id/paid', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  db.run("UPDATE bookings SET paid = 1 WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to update booking' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/bookings/:id', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  db.run("DELETE FROM bookings WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete booking' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📁 Static files served from /public`);
  console.log(`🔗 Booking API available at http://localhost:${PORT}/api/book`);
  console.log(`🔐 Admin dashboard available at http://localhost:${PORT}/admin.html`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = app;
