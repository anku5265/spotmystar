import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireArtist } from '../middleware/auth.js';

const router = express.Router();

// Get artist analytics
router.get('/stats/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { filter = 'daily' } = req.query; // daily, weekly, monthly
    
    // Verify artist owns this data
    if (req.user.id !== parseInt(artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Calculate date range based on filter
    let dateCondition = '';
    const now = new Date();
    
    if (filter === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateCondition = `AND created_at >= '${today.toISOString()}'`;
    } else if (filter === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateCondition = `AND created_at >= '${weekAgo.toISOString()}'`;
    } else if (filter === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateCondition = `AND created_at >= '${monthAgo.toISOString()}'`;
    }
    
    // Get profile visits (views) - total views
    const viewsResult = await pool.query(
      `SELECT views FROM artists WHERE id = $1`,
      [artistId]
    );
    
    // Get bookings count for the filter period
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 ${dateCondition}`,
      [artistId]
    );
    
    // Get pending requests count (always current, not filtered)
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'pending'`,
      [artistId]
    );
    
    // Get wishlist count (always current, not filtered)
    const wishlistResult = await pool.query(
      `SELECT COUNT(*) as total FROM wishlist WHERE artist_id = $1`,
      [artistId]
    );
    
    // Get upcoming events (accepted bookings in future)
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) as total FROM bookings 
       WHERE artist_id = $1 AND status = 'accepted' AND event_date >= NOW()`,
      [artistId]
    );
    
    res.json({
      views: viewsResult.rows[0]?.views || 0,
      bookings: parseInt(bookingsResult.rows[0]?.total || 0),
      pendingRequests: parseInt(pendingResult.rows[0]?.total || 0),
      wishlistCount: parseInt(wishlistResult.rows[0]?.total || 0),
      upcomingEvents: parseInt(upcomingResult.rows[0]?.total || 0),
      filter
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending booking requests with details
router.get('/pending-requests/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    
    // Verify artist owns this data
    if (req.user.id !== parseInt(artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await pool.query(
      `SELECT id, user_name, phone, email, event_date, event_location, 
              event_type, budget, message, created_at 
       FROM bookings 
       WHERE artist_id = $1 AND status = 'pending' 
       ORDER BY created_at DESC`,
      [artistId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Pending requests error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent enquiries
router.get('/recent-enquiries/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 5 } = req.query;
    
    // Verify artist owns this data
    if (req.user.id !== parseInt(artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await pool.query(
      `SELECT id, user_name, event_date, event_location, status, created_at 
       FROM bookings 
       WHERE artist_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [artistId, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Recent enquiries error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/upcoming-events/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    
    // Verify artist owns this data
    if (req.user.id !== parseInt(artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await pool.query(
      `SELECT id, user_name, event_date, event_location, event_type, status 
       FROM bookings 
       WHERE artist_id = $1 AND status = 'accepted' AND event_date >= NOW() 
       ORDER BY event_date ASC`,
      [artistId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Upcoming events error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update availability status
router.patch('/availability/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { isAvailable } = req.body;
    
    // Verify artist owns this data
    if (req.user.id !== parseInt(artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await pool.query(
      `UPDATE artists SET is_available = $1 WHERE id = $2 RETURNING is_available`,
      [isAvailable, artistId]
    );
    
    res.json({ isAvailable: result.rows[0].is_available });
  } catch (error) {
    console.error('Availability update error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
