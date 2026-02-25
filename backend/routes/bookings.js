import express from 'express';
import pool from '../config/db.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create booking request
router.post('/', async (req, res) => {
  try {
    const { artistId, userName, phone, email, eventDate, eventLocation, budget, message } = req.body;

    const artistResult = await pool.query('SELECT * FROM artists WHERE id = $1', [artistId]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artist = artistResult.rows[0];

    const result = await pool.query(`
      INSERT INTO bookings (artist_id, user_name, phone, email, event_date, event_location, budget, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [artistId, userName, phone, email, eventDate, eventLocation, budget, message]);

    // Send email to artist
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: artist.email,
        subject: `New Booking Request from ${userName}`,
        html: `
          <h2>New Booking Request</h2>
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
      bookingId: result.rows[0].id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for artist
router.get('/artist/:artistId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.params.artistId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
