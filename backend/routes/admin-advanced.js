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

router.get('/users/advanced', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const params = [];
    let p = 1;
    let where = "WHERE u.role = 'user'";
    if (search) {
      where += ' AND (LOWER(u.name) LIKE LOWER($' + p + ') OR LOWER(u.email) LIKE LOWER($' + p + '))';
      params.push('%' + search + '%');
      p++;
    }
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const q = 'SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, COUNT(DISTINCT b.id) as total_bookings FROM users u LEFT JOIN bookings b ON u.id = b.user_id ' + where + ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT $' + p + ' OFFSET $' + (p + 1);
    const result = await pool.query(q, params);
    const count = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    res.json({ users: result.rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(count.rows[0].count) } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status, reason, suspensionEnd } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET account_status = $1, suspension_reason = $2, suspension_end = $3 WHERE id = $4 RETURNING id, name, email',
        [status, reason || null, suspensionEnd || null, req.params.id]
      );
      if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
      res.json(result.rows[0]);
    } catch (colError) {
      const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.params.id]);
      if (!user.rows.length) return res.status(404).json({ message: 'User not found' });
      res.json(user.rows[0]);
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/artists/advanced', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const params = [];
    let p = 1;
    let where = 'WHERE 1=1';
    if (search) {
      where += ' AND (LOWER(a.full_name) LIKE LOWER($' + p + ') OR LOWER(a.stage_name) LIKE LOWER($' + p + '))';
      params.push('%' + search + '%');
      p++;
    }
    if (status) { where += ' AND a.status = $' + p; params.push(mapStatus(status)); p++; }
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const q = 'SELECT a.*, c.name as category_name, COUNT(DISTINCT b.id) as total_bookings FROM artists a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN bookings b ON a.id = b.artist_id ' + where + ' GROUP BY a.id, c.name ORDER BY a.created_at DESC LIMIT $' + p + ' OFFSET $' + (p + 1);
    const result = await pool.query(q, params);
    const count = await pool.query('SELECT COUNT(*) FROM artists');
    res.json({ artists: result.rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(count.rows[0].count) } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch('/artists/:id/admin-update', async (req, res) => {
  try {
    const { status, verified, is_verified, featured, adminNotes, verificationNotes, overridePriceMin, overridePriceMax } = req.body;
    const verifiedVal = is_verified !== undefined ? is_verified : verified;
    const dbStatus = mapStatus(status);

    const updates = [];
    const values = [];
    let idx = 1;
    if (dbStatus !== undefined) { updates.push('status = $' + idx); values.push(dbStatus); idx++; }
    if (verifiedVal !== undefined) { updates.push('is_verified = $' + idx); values.push(verifiedVal); idx++; }
    if (featured !== undefined) { updates.push('featured = $' + idx); values.push(featured); idx++; }
    if (adminNotes !== undefined) { updates.push('admin_notes = $' + idx); values.push(adminNotes); idx++; }
    if (verificationNotes !== undefined) { updates.push('verification_notes = $' + idx); values.push(verificationNotes); idx++; }
    if (overridePriceMin !== undefined && overridePriceMin !== '') { updates.push('admin_override_price_min = $' + idx); values.push(overridePriceMin); idx++; }
    if (overridePriceMax !== undefined && overridePriceMax !== '') { updates.push('admin_override_price_max = $' + idx); values.push(overridePriceMax); idx++; }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    values.push(req.params.id);
    try {
      const result = await pool.query('UPDATE artists SET ' + updates.join(', ') + ', updated_at = NOW() WHERE id = $' + idx + ' RETURNING *', values);
      if (!result.rows.length) return res.status(404).json({ message: 'Artist not found' });
      res.json(result.rows[0]);
    } catch (colError) {
      const coreUpdates = [];
      const coreValues = [];
      let ci = 1;
      if (dbStatus !== undefined) { coreUpdates.push('status = $' + ci); coreValues.push(dbStatus); ci++; }
      if (verifiedVal !== undefined) { coreUpdates.push('is_verified = $' + ci); coreValues.push(verifiedVal); ci++; }
      if (coreUpdates.length === 0) return res.status(400).json({ message: 'No core fields to update' });
      coreValues.push(req.params.id);
      const result = await pool.query('UPDATE artists SET ' + coreUpdates.join(', ') + ', updated_at = NOW() WHERE id = $' + ci + ' RETURNING *', coreValues);
      if (!result.rows.length) return res.status(404).json({ message: 'Artist not found' });
      res.json(result.rows[0]);
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/bookings/advanced', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const params = [];
    let p = 1;
    let where = 'WHERE 1=1';
    if (status) { where += ' AND b.status = $' + p; params.push(status); p++; }
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const q = 'SELECT b.*, a.stage_name as artist_name FROM bookings b LEFT JOIN artists a ON b.artist_id = a.id ' + where + ' ORDER BY b.created_at DESC LIMIT $' + p + ' OFFSET $' + (p + 1);
    const result = await pool.query(q, params);
    res.json({ bookings: result.rows });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.patch('/bookings/:id/admin-action', async (req, res) => {
  try {
    const result = await pool.query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/risk-flags', (_req, res) => res.json([]));
router.post('/risk-flags', (_req, res) => res.json({ message: 'Not available' }));
router.patch('/risk-flags/:id/resolve', (_req, res) => res.json({ message: 'Not available' }));
router.get('/audit-log', (_req, res) => res.json([]));

router.get('/analytics/dashboard', async (req, res) => {
  try {
    const period = parseInt(req.query.period || '30');
    const [userStats, artistStats, bookingStats] = await Promise.all([
      pool.query("SELECT COUNT(*) as total_users, COUNT(*) as active_users, 0 as suspended_users, 0 as high_risk_users, COUNT(CASE WHEN created_at > NOW() - ($1::text || ' days')::INTERVAL THEN 1 END) as new_users FROM users WHERE role = 'user'", [period]),
      pool.query("SELECT COUNT(*) as total_artists, COUNT(CASE WHEN status = 'active' THEN 1 END) as active_artists, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_artists, COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_artists, 0 as featured_artists, 0 as high_risk_artists FROM artists"),
      pool.query("SELECT COUNT(*) as total_bookings, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings, COUNT(CASE WHEN status = 'accepted' THEN 1 END) as confirmed_bookings, 0 as escalated_bookings, COUNT(CASE WHEN created_at > NOW() - ($1::text || ' days')::INTERVAL THEN 1 END) as recent_bookings FROM bookings", [period])
    ]);
    res.json({ users: userStats.rows[0], artists: artistStats.rows[0], bookings: bookingStats.rows[0], risks: { total_flags: 0, unresolved_flags: 0, critical_flags: 0, auto_generated_flags: 0 }, activityTrends: [] });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

export default router;
