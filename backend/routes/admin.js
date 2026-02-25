import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'active'");
    const pendingApprovals = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'pending'");
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const todayBookings = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE"
    );

    res.json({
      totalArtists: parseInt(totalArtists.rows[0].count),
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
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

export default router;
