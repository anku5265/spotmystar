import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireUser, requireArtist } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// Create booking request - USER ONLY
router.post('/', verifyToken, requireUser, requirePermission('book_artist'), async (req, res) => {
  try {
    const { artistId, userName, phone, email, eventDate, eventLocation, budget, message } = req.body;

    // Validate required fields
    if (!artistId || !userName || !phone || !email || !eventDate || !eventLocation || !budget) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Verify artist exists and is active
    const artistResult = await pool.query(
      "SELECT id, email, full_name, stage_name FROM artists WHERE id = $1 AND (status = 'active' OR status = 'approved') AND is_verified = true",
      [artistId]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found or not available for booking' });
    }

    // Insert booking — no booking_id column needed, id (UUID) is the primary key
    const result = await pool.query(`
      INSERT INTO bookings (artist_id, user_id, user_name, phone, email, event_date, event_location, budget, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING id, status, created_at
    `, [artistId, req.user.id, userName, phone, email, eventDate, eventLocation, parseInt(budget), message || '']);

    const booking = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully!',
      booking: {
        id: booking.id,
        status: booking.status,
        createdAt: booking.created_at
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for logged-in user - USER ONLY
router.get('/my-bookings', verifyToken, requireUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*,
             a.stage_name, a.full_name, a.profile_image, a.whatsapp, a.instagram,
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

// Get bookings for artist - ARTIST ONLY
router.get('/artist/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    if (String(req.user.id) !== String(req.params.artistId)) {
      return res.status(403).json({ message: 'Access denied.' });
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

// Update booking status - ARTIST ONLY
router.patch('/:id/status', verifyToken, requireArtist, requirePermission('manage_bookings'), async (req, res) => {
  try {
    let { status, counterOffer } = req.body;

    // Normalize: map old/alternate values to DB-allowed values
    const statusMap = {
      'negotiation': 'countered',
      'confirmed':   'accepted',
      'approve':     'accepted',
      'decline':     'rejected',
    };
    if (statusMap[status]) status = statusMap[status];

    const validStatuses = ['pending', 'accepted', 'rejected', 'countered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    const booking = await pool.query('SELECT artist_id, user_id FROM bookings WHERE id = $1', [req.params.id]);
    if (booking.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.rows[0].artist_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. This booking does not belong to you.' });
    }

    let result;
    if (counterOffer && status === 'countered') {
      result = await pool.query(
        'UPDATE bookings SET status = $1, counter_price = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [status, parseInt(counterOffer), req.params.id]
      );
    } else {
      result = await pool.query(
        'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, req.params.id]
      );
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Booking status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single booking details - ARTIST ONLY
router.get('/:id', verifyToken, requireArtist, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             u.name as user_full_name, u.phone as user_phone_detail
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    if (String(result.rows[0].artist_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
