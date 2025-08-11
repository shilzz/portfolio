const express = require('express');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const router = express.Router();

// Middleware to check if admin is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// POST /admin/login - Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.adminId = admin._id;
        res.json({ success: true, message: 'Login successful' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// POST /admin/logout - Admin logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout successful' });
});

// GET /admin/bookings - Get all bookings (requires auth)
router.get('/bookings', requireAuth, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// PUT /admin/bookings/:id/paid - Mark booking as paid (requires auth)
router.put('/bookings/:id/paid', requireAuth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { paid: true },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Failed to update booking' });
    }
});

// DELETE /admin/bookings/:id - Delete booking (requires auth)
router.delete('/bookings/:id', requireAuth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Failed to delete booking' });
    }
});

module.exports = router;
