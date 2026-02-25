import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Artist stats
    const totalArtists = await pool.query("SELECT COUNT(*) FROM artists");
    const activeArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'active'");
    const pendingArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'pending'");
    const verifiedArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE is_verified = true");
    
    // User stats
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    
    // Booking stats
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const todayBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE"
    );
    const pendingBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'pending'"
    );
    const completedBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'completed'"
    );

    // Category-wise artist count
    const artistsByCategory = await pool.query(`
      SELECT c.name, COUNT(a.id) as count 
      FROM categories c 
      LEFT JOIN artists a ON c.id = a.category_id AND a.status = 'active'
      GROUP BY c.name 
      ORDER BY count DESC
    `);

    res.json({
      artists: {
        total: parseInt(totalArtists.rows[0].count),
        active: parseInt(activeArtists.rows[0].count),
        pending: parseInt(pendingArtists.rows[0].count),
        verified: parseInt(verifiedArtists.rows[0].count)
      },
      users: {
        total: parseInt(totalUsers.rows[0].count)
      },
      bookings: {
        total: parseInt(totalBookings.rows[0].count),
        today: parseInt(todayBookings.rows[0].count),
        pending: parseInt(pendingBookings.rows[0].count),
        completed: parseInt(completedBookings.rows[0].count)
      },
      categoryBreakdown: artistsByCategory.rows,
      // Legacy fields for backward compatibility
      totalArtists: parseInt(activeArtists.rows[0].count),
      pendingApprovals: parseInt(pendingArtists.rows[0].count),
      totalBookings: parseInt(totalBookings.rows[0].count),
      todayBookings: parseInt(todayBookings.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all artists
router.get('/artists', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.stage_name) LIKE LOWER($${paramCount}) OR LOWER(a.email) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject artist
router.patch('/artists/:id/verify', async (req, res) => {
  try {
    const { isVerified, status } = req.body;
    const result = await pool.query(
      'UPDATE artists SET is_verified = $1, status = $2 WHERE id = $3 RETURNING *',
      [isVerified, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, a.full_name, a.stage_name 
      FROM bookings b 
      LEFT JOIN artists a ON b.artist_id = a.id 
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, created_at 
      FROM users 
      WHERE role = 'user' 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
