import express from 'express';
import pool from '../config/db.js';
import nodemailer from 'nodemailer';
import { requireUser, strictRoleGuard } from '../middleware/auth.js';
import { generateBookingId } from '../utils/idGenerator.js';

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create booking request - STRICT USER ONLY
router.post('/', requireUser, strictRoleGuard('user'), async (req, res) => {
  try {
    const { artistId, userName, phone, email, eventDate, eventLocation, budget, message } = req.body;

    // Verify artist exists and is active
    const artistResult = await pool.query(
      'SELECT * FROM artists WHERE id = $1 AND (status = $2 OR status = $3) AND is_verified = true',
      [artistId, 'active', 'approved']
    );
    
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found or not available for booking' });
    }

    const artist = artistResult.rows[0];

    // Generate unique Booking ID
    const bookingId = await generateBookingId();

    const result = await pool.query(`
      INSERT INTO bookings (artist_id, user_id, user_name, phone, email, event_date, event_location, budget, message, booking_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, booking_id
    `, [artistId, req.user.id, userName, phone, email, eventDate, eventLocation, budget, message, bookingId]);

    // Send email to artist (optional)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: artist.email,
        subject: `New Booking Request from ${userName}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>From:</strong> ${userName}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Budget:</strong> ₹${budget}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
          <p>Login to your dashboard to respond.</p>
        `
      });
    } catch (emailError) {
      console.log('Email sending failed (optional):', emailError.message);
    }

    res.status(201).json({ 
      message: 'Booking request sent successfully!', 
      bookingId: result.rows[0].booking_id,
      id: result.rows[0].id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;