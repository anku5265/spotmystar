import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

function mapStatus(status) {
  if (!status) return status;
  const map = { approved: 'active', suspended: 'inactive' };
  return map[status] || status;
}

router.get('/stats', async (req, res) => {
  try {
    const totalArtists = await pool.query("SELECT COUNT(*) FROM artists");
    const activeArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'active'");
    const pendingArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE status = 'pending'");
    const verifiedArtists = await pool.query("SELECT COUNT(*) FROM artists WHERE is_verified = true");
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const todayBookings = await pool.query("SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE");
    const pendingBookings = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const completedBookings = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
    const artistsByCategory = await pool.query("SELECT c.name, COUNT(a.id) as count FROM categories c LEFT JOIN artists a ON a.category_id = c.id AND a.status = 'active' GROUP BY c.id, c.name ORDER BY count DESC");
    res.json({
      artists: { total: parseInt(totalArtists.rows[0].count), active: parseInt(activeArtists.rows[0].count), pending: parseInt(pendingArtists.rows[0].count), verified: parseInt(verifiedArtists.rows[0].count) },
      users: { total: parseInt(totalUsers.rows[0].count) },
      bookings: { total: parseInt(totalBookings.rows[0].count), today: parseInt(todayBookings.rows[0].count), pending: parseInt(pendingBookings.rows[0].count), completed: parseInt(completedBookings.rows[0].count) },
      categoryBreakdown: artistsByCategory.rows,
      totalArtists: parseInt(activeArtists.rows[0].count),
      pendingApprovals: parseInt(pendingArtists.rows[0].count),
      totalBookings: parseInt(totalBookings.rows[0].count),
      todayBookings: parseInt(todayBookings.rows[0].count)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/artists', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT a.*, c.name as category_name FROM artists a LEFT JOIN categories c ON a.category_id = c.id WHERE 1=1';
    const params = [];
    let p = 1;
    if (status) { query += ' AND a.status = $' + p++; params.push(mapStatus(status)); }
    if (search) {
      query += ' AND (LOWER(a.full_name) LIKE LOWER($' + p + ') OR LOWER(a.stage_name) LIKE LOWER($' + p + ') OR LOWER(a.email) LIKE LOWER($' + p + '))';
      params.push('%' + search + '%');
      p++;
    }
    query += ' ORDER BY a.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch('/artists/:id/verify', async (req, res) => {
  try {
    const { isVerified, status } = req.body;
    const dbStatus = mapStatus(status);
    const result = await pool.query(
      'UPDATE artists SET is_verified = $1, status = $2 WHERE id = $3 RETURNING *',
      [isVerified, dbStatus, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Artist not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/bookings', async (_req, res) => {
  try {
    const result = await pool.query("SELECT b.*, a.full_name, a.stage_name FROM bookings b LEFT JOIN artists a ON b.artist_id = a.id ORDER BY b.created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/users', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', ['user']);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
