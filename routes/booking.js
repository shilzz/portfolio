const express = require('express');
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const router = express.Router();

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

// POST / - Create a new booking
router.post('/', async (req, res) => {
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

    // Create new booking in MongoDB
    const newBooking = new Booking({
      name,
      email,
      service,
      date: bookingDate,
      time,
      notes: notes || '',
      paid: false
    });

    await newBooking.save();
    console.log('New booking saved:', newBooking);

    // Send email to client (if email is configured)
    const transporter = createTransporter();
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Booking Confirmation - Payment Required',
          html: `
            <h2>Booking Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Your booking has been confirmed with the following details:</p>
            <ul>
              <li><strong>Service:</strong> ${service.replace('-', ' ').toUpperCase()}</li>
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time:</strong> ${time}</li>
              <li><strong>Notes:</strong> ${notes || 'None'}</li>
            </ul>
            <p><strong>Payment Required:</strong> 6 BHD</p>
            <p>Please complete your payment to secure your booking. We will contact you with payment instructions.</p>
            <p>Thank you for choosing our services!</p>
            <p>Best regards,<br>Your Portfolio Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the booking if email fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Booking submitted successfully! Check your email for payment instructions.' 
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create booking. Please try again.' 
    });
  }
});

module.exports = router;
