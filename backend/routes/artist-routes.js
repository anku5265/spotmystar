import express from 'express';
import pool from '../config/db.js';
import { requireArtist, strictRoleGuard } from '../middleware/auth.js';

const router = express.Router();

// Apply strict artist-only guard to all routes
router.use(requireArtist);
router.use(strictRoleGuard('artist'));

// Get artist profile
router.get('/profile', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update artist profile
router.patch('/profile', async (req, res) => {
  try {
    const {
      full_name, stage_name, email, phone, city, category_id,
      price_min, price_max, description, whatsapp, instagram,
      profile_image, portfolio_images
    } = req.body;
    
    // Check if email is already taken by another artist
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM artists WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }
    
    const result = await pool.query(`
      UPDATE artists SET 
        full_name = $1, stage_name = $2, email = $3, phone = $4, city = $5,
        category_id = $6, price_min = $7, price_max = $8, description = $9,
        whatsapp = $10, instagram = $11, profile_image = $12, portfolio_images = $13
      WHERE id = $14 
      RETURNING *
    `, [
      full_name, stage_name, email, phone, city, category_id,
      price_min, price_max, description, whatsapp, instagram,
      profile_image, portfolio_images, req.user.id
    ]);
    
    res.json({
      message: 'Profile updated successfully',
      artist: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist's bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name as user_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.artist_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status
router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    // Verify booking belongs to this artist
    const bookingCheck = await pool.query(
      'SELECT id FROM bookings WHERE id = $1 AND artist_id = $2',
      [bookingId, req.user.id]
    );
    
    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found or access denied' });
    }
    
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );
    
    res.json({
      message: 'Booking status updated successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [bookingsResult, viewsResult, ratingsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM bookings WHERE artist_id = $1', [req.user.id]),
      pool.query('SELECT views FROM artists WHERE id = $1', [req.user.id]),
      pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM reviews WHERE artist_id = $1', [req.user.id])
    ]);
    
    res.json({
      totalBookings: parseInt(bookingsResult.rows[0].count),
      totalViews: parseInt(viewsResult.rows[0]?.views || 0),
      averageRating: parseFloat(ratingsResult.rows[0]?.avg_rating || 0),
      totalRatings: parseInt(ratingsResult.rows[0]?.total_ratings || 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    // Get booking trends
    const bookingTrends = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as bookings
      FROM bookings 
      WHERE artist_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [req.user.id]);
    
    // Get booking status distribution
    const statusDistribution = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM bookings 
      WHERE artist_id = $1
      GROUP BY status
    `, [req.user.id]);
    
    res.json({
      bookingTrends: bookingTrends.rows,
      statusDistribution: statusDistribution.rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update artist availability
router.patch('/availability', async (req, res) => {
  try {
    const { available_dates, unavailable_dates } = req.body;
    
    const result = await pool.query(
      'UPDATE artists SET available_dates = $1, unavailable_dates = $2 WHERE id = $3 RETURNING available_dates, unavailable_dates',
      [available_dates, unavailable_dates, req.user.id]
    );
    
    res.json({
      message: 'Availability updated successfully',
      availability: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;