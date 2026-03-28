import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireArtist } from '../middleware/auth.js';

const router = express.Router();

// UUID-safe ownership check
const ownsResource = (req, artistId) => String(req.user.id) === String(artistId);

// Get artist analytics stats
router.get('/stats/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { filter = 'monthly' } = req.query;

    if (!ownsResource(req, artistId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let dateCondition = '';
    const now = new Date();
    if (filter === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateCondition = `AND created_at >= '${weekAgo.toISOString()}'`;
    } else if (filter === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateCondition = `AND created_at >= '${monthAgo.toISOString()}'`;
    } else if (filter === 'yearly') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateCondition = `AND created_at >= '${yearAgo.toISOString()}'`;
    }

    const [viewsRes, totalBookRes, pendingRes, upcomingRes, confirmedRes, completedRes] = await Promise.allSettled([
      pool.query('SELECT views FROM artists WHERE id = $1', [artistId]),
      pool.query('SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1', [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'pending'", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status IN ('accepted','confirmed') AND event_date >= NOW()", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status IN ('accepted','confirmed')", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'completed'", [artistId]),
    ]);

    const get = (r) => r.status === 'fulfilled' ? r.value.rows[0] : null;

    const totalBookings = parseInt(get(totalBookRes)?.total || 0);
    const confirmedBookings = parseInt(get(confirmedRes)?.total || 0);
    const acceptanceRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;

    res.json({
      profile_views: parseInt(get(viewsRes)?.views || 0),
      total_bookings: totalBookings,
      pending_requests: parseInt(get(pendingRes)?.total || 0),
      upcoming_events: parseInt(get(upcomingRes)?.total || 0),
      confirmed_bookings: confirmedBookings,
      completed_bookings: parseInt(get(completedRes)?.total || 0),
      acceptance_rate: acceptanceRate,
      filter
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending booking requests
router.get('/pending-requests/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const result = await pool.query(
      `SELECT id, user_name, phone, email, event_date, event_location,
              budget as offered_price, message, status, created_at
       FROM bookings WHERE artist_id = $1 AND status IN ('pending','negotiation')
       ORDER BY created_at DESC`,
      [artistId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent enquiries
router.get('/recent-enquiries/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 5 } = req.query;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const result = await pool.query(
      `SELECT id, user_name, event_date, event_location, budget as offered_price, status, created_at
       FROM bookings WHERE artist_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [artistId, parseInt(limit)]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming events
router.get('/upcoming-events/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const result = await pool.query(
      `SELECT id, user_name, event_date, event_location, budget, status
       FROM bookings WHERE artist_id = $1
       AND status IN ('accepted','confirmed') AND event_date >= NOW()
       ORDER BY event_date ASC`,
      [artistId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update availability
router.patch('/availability/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    const { isAvailable } = req.body;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const result = await pool.query(
      'UPDATE artists SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING is_available',
      [isAvailable, artistId]
    );
    res.json({ isAvailable: result.rows[0]?.is_available });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
