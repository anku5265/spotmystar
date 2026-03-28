import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireUser, requireArtist } from '../middleware/auth.js';
import { generateBookingId } from '../utils/idGenerator.js';

const router = express.Router();

// Create booking request - USER ONLY
router.post('/', verifyToken, requireUser, async (req, res) => {
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

// Get bookings for logged-in user - USER ONLY
router.get('/my-bookings', verifyToken, requireUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             a.stage_name, a.profile_image, a.whatsapp, a.instagram,
             c.name as category_name
      FROM bookings b
      LEFT JOIN artists a ON b.artist_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for artist - ARTIST ONLY, must own the data
router.get('/artist/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    if (String(req.user.id) !== String(req.params.artistId)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own bookings.' });
    }
    const result = await pool.query(
      'SELECT * FROM bookings WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.params.artistId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status - ARTIST ONLY (accept/reject their own bookings)
router.patch('/:id/status', verifyToken, requireArtist, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Verify this booking belongs to this artist
    const booking = await pool.query('SELECT artist_id FROM bookings WHERE id = $1', [req.params.id]);
    if (booking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (String(booking.rows[0].artist_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. This booking does not belong to you.' });
    }

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