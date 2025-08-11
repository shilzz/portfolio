# Portfolio Booking System

A complete booking system with MongoDB storage, admin dashboard, and email notifications.

## Features

- ✅ **Portfolio Website** - Responsive portfolio with booking form
- ✅ **Booking System** - Form validation and MongoDB storage
- ✅ **Email Notifications** - Automatic email to clients with payment details
- ✅ **Admin Dashboard** - Secure admin panel to manage bookings
- ✅ **Payment Tracking** - Mark bookings as paid/unpaid
- ✅ **MongoDB Integration** - Persistent data storage

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/portfolio

# Session Secret
SESSION_SECRET=your-super-secret-session-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Domain (for production)
DOMAIN=http://localhost:3000
```

### 3. MongoDB Setup
Make sure MongoDB is running on your system. If using MongoDB Atlas, use the connection string provided.

### 4. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### 5. Create Admin User
```bash
node setup-admin.js
```
This creates an admin user with:
- Username: `admin`
- Password: `admin123`

**⚠️ Change the password after first login!**

### 6. Start the Server
```bash
npm run dev
```

## Usage

### Client Booking
1. Visit `http://localhost:3000`
2. Click "Book a Service" button
3. Fill out the booking form
4. Submit to receive email with payment instructions

### Admin Dashboard
1. Visit `http://localhost:3000/admin.html`
2. Login with admin credentials
3. View all bookings
4. Mark bookings as paid/unpaid
5. Delete bookings if needed

## API Endpoints

### Booking API
- `POST /api/book` - Create new booking
- `POST /api/webhook` - Stripe webhook (future use)

### Admin API
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/paid` - Mark booking as paid
- `DELETE /api/admin/bookings/:id` - Delete booking

## File Structure

```
Portfolio/
├── models/
│   ├── Booking.js      # Booking model
│   └── Admin.js        # Admin model
├── routes/
│   ├── booking.js      # Booking routes
│   └── admin.js        # Admin routes
├── public/
│   ├── index.html      # Portfolio homepage
│   ├── booking.html    # Booking form
│   ├── admin.html      # Admin dashboard
│   ├── styles.css      # All styles
│   ├── booking.js      # Booking form logic
│   └── admin.js        # Admin dashboard logic
├── server.js           # Main server file
├── setup-admin.js      # Admin setup script
└── package.json        # Dependencies
```

## Security Features

- ✅ **Password Hashing** - bcryptjs for secure password storage
- ✅ **Session Management** - Express sessions for admin authentication
- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **Email Verification** - Validates email format
- ✅ **Date Validation** - Prevents past date bookings

## Future Enhancements

- 🔄 **Stripe Integration** - Online payment processing
- 🔄 **Email Templates** - Customizable email templates
- 🔄 **Booking Calendar** - Visual calendar interface
- 🔄 **SMS Notifications** - Text message reminders
- 🔄 **Analytics Dashboard** - Booking statistics and reports

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Email Not Sending**
   - Verify Gmail credentials
   - Check if 2FA is enabled
   - Use App Password, not regular password

3. **Admin Login Fails**
   - Run `node setup-admin.js` to create admin user
   - Check if admin user exists in database

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process on port 3000

## Support

For issues or questions, check the console logs for detailed error messages.
