const mongoose = require('mongoose');

// Define the booking schema
const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    service: {
        type: String,
        required: true,
        enum: ['website-design', 'web-development', 'consultation', 'maintenance']
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    paid: {
        type: Boolean,
        default: false
    },
    stripeSessionId: {
        type: String,
        trim: true
    }
}, {
    // Add timestamps for created and updated dates
    timestamps: true
});

// Create and export the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
