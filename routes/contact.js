const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

function buildTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER/EMAIL_PASS not set. Contact emails will be skipped.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    const transporter = buildTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          replyTo: email,
          subject: `New contact message from ${name}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (err) {
        console.error('Failed to send contact email:', err);
        // Do not fail the request if email sending fails
      }
    }

    return res.json({ success: true, message: 'Thanks! Your message has been received.' });
  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ message: 'Failed to submit message.' });
  }
});

module.exports = router;
