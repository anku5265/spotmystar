import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireArtist } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = express.Router();

// UUID-safe ownership check
const ownsResource = (req, artistId) => String(req.user.id) === String(artistId);

// Get artist analytics stats
router.get('/stats/:artistId', verifyToken, requireArtist, requirePermission('view_analytics'), async (req, res) => {
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
router.get('/pending-requests/:artistId', verifyToken, requireArtist, requirePermission('manage_bookings'), async (req, res) => {
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
router.get('/recent-enquiries/:artistId', verifyToken, requireArtist, requirePermission('manage_bookings'), async (req, res) => {
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
router.get('/upcoming-events/:artistId', verifyToken, requireArtist, requirePermission('manage_schedule'), async (req, res) => {
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
router.patch('/availability/:artistId', verifyToken, requireArtist, requirePermission('manage_profile'), async (req, res) => {
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

// ── Unified Dashboard API ──────────────────────────────────────────────────
router.get('/dashboard/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const [
      artistRes, totalBookRes, pendingRes, confirmedRes, completedRes,
      upcomingRes, unreadMsgRes, recentBookRes
    ] = await Promise.allSettled([
      pool.query('SELECT views, stage_name, full_name, profile_image FROM artists WHERE id = $1', [artistId]),
      pool.query('SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1', [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'pending'", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status IN ('accepted','confirmed')", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'completed'", [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status IN ('accepted','confirmed') AND event_date >= NOW()", [artistId]),
      pool.query('SELECT COUNT(*) as total FROM messages WHERE receiver_id = $1 AND is_read = false', [artistId]),
      pool.query(`SELECT id, user_name, event_type, budget, status, created_at FROM bookings WHERE artist_id = $1 ORDER BY created_at DESC LIMIT 5`, [artistId]),
    ]);

    const get = (r) => r.status === 'fulfilled' ? r.value.rows[0] : null;
    const getRows = (r) => r.status === 'fulfilled' ? r.value.rows : [];

    const totalBookings = parseInt(get(totalBookRes)?.total || 0);
    const confirmedBookings = parseInt(get(confirmedRes)?.total || 0);
    const acceptanceRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;

    // Build recent activities from bookings
    const recentActivities = getRows(recentBookRes).map(b => ({
      type: 'booking',
      message: `${b.status === 'pending' ? 'New booking request' : `Booking ${b.status}`} from ${b.user_name || 'Client'}`,
      time: b.created_at,
      status: b.status,
    }));

    res.json({
      profileViews: parseInt(get(artistRes)?.views || 0),
      unreadMessages: parseInt(get(unreadMsgRes)?.total || 0),
      totalBookings,
      pendingBookings: parseInt(get(pendingRes)?.total || 0),
      confirmedBookings,
      completedBookings: parseInt(get(completedRes)?.total || 0),
      upcomingEvents: parseInt(get(upcomingRes)?.total || 0),
      acceptanceRate,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ── AI Suggestions (dynamic based on real data) ────────────────────────────
router.get('/ai-suggestions/:artistId', verifyToken, requireArtist, async (req, res) => {
  try {
    const { artistId } = req.params;
    if (!ownsResource(req, artistId)) return res.status(403).json({ message: 'Access denied' });

    const [bookRes, pendingRes, viewsRes, msgRes] = await Promise.allSettled([
      pool.query('SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1', [artistId]),
      pool.query("SELECT COUNT(*) as total FROM bookings WHERE artist_id = $1 AND status = 'pending'", [artistId]),
      pool.query('SELECT views FROM artists WHERE id = $1', [artistId]),
      pool.query('SELECT COUNT(*) as total FROM messages WHERE receiver_id = $1 AND is_read = false', [artistId]),
    ]);

    const get = (r) => r.status === 'fulfilled' ? r.value.rows[0] : null;
    const totalBookings = parseInt(get(bookRes)?.total || 0);
    const pendingCount = parseInt(get(pendingRes)?.total || 0);
    const views = parseInt(get(viewsRes)?.views || 0);
    const unreadMsgs = parseInt(get(msgRes)?.total || 0);

    const suggestions = [];

    // Response time suggestion
    suggestions.push({ icon: '💡', tip: 'Best time to respond to requests: 9 AM - 11 AM', color: 'border-yellow-500/30 bg-yellow-500/5' });

    // Booking-based suggestion
    if (pendingCount > 3) {
      suggestions.push({ icon: '🔥', tip: `You have ${pendingCount} pending requests! Respond quickly to boost your acceptance rate.`, color: 'border-red-500/30 bg-red-500/5' });
    } else if (totalBookings === 0) {
      suggestions.push({ icon: '📈', tip: 'No bookings yet. Complete your profile and add portfolio to attract clients.', color: 'border-blue-500/30 bg-blue-500/5' });
    } else {
      suggestions.push({ icon: '📈', tip: 'Your response rate is great! Keep it up.', color: 'border-blue-500/30 bg-blue-500/5' });
    }

    // Content suggestion
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek >= 4) {
      suggestions.push({ icon: '🎥', tip: 'Post a new reel this weekend — engagement is 40% higher on weekends!', color: 'border-purple-500/30 bg-purple-500/5' });
    } else {
      suggestions.push({ icon: '🎥', tip: 'Upload a performance video to showcase your talent to potential clients.', color: 'border-purple-500/30 bg-purple-500/5' });
    }

    // Profile/views suggestion
    if (views < 100) {
      suggestions.push({ icon: '⭐', tip: 'Complete your profile with photos and bio to get 3x more booking requests.', color: 'border-green-500/30 bg-green-500/5' });
    } else if (views >= 1000) {
      suggestions.push({ icon: '🏆', tip: `Amazing! Your profile has ${views} views. You're trending on SpotMyStar!`, color: 'border-yellow-500/30 bg-yellow-500/5' });
    } else {
      suggestions.push({ icon: '⭐', tip: `Your profile has ${views} views. Share your profile link to get more visibility.`, color: 'border-green-500/30 bg-green-500/5' });
    }

    // Unread messages
    if (unreadMsgs > 0) {
      suggestions.push({ icon: '💬', tip: `You have ${unreadMsgs} unread message${unreadMsgs > 1 ? 's' : ''}. Reply quickly to build client trust.`, color: 'border-blue-500/30 bg-blue-500/5' });
    }

    res.json({ suggestions: suggestions.slice(0, 4) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
