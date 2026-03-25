import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── PUBLIC STATUS CHECK (user/artist checks their own status) ──
// Called by frontend AccountStatusChecker - no admin role needed, just valid token
router.get('/check-status/user/:id', verifyToken, async (req, res) => {
  try {
    // Users can only check their own status
    if (req.user.role === 'user' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const result = await pool.query(
      `SELECT account_status, suspension_reason, suspension_end 
       FROM users WHERE id = $1 AND role = 'user'`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    // If column doesn't exist yet, return active (graceful degradation)
    res.json({ account_status: 'active' });
  }
});

router.get('/check-status/artist/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'artist' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const result = await pool.query(
      `SELECT account_status, suspension_reason, suspension_end 
       FROM artists WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Artist not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.json({ account_status: 'active' });
  }
});

// ── ADMIN-ONLY ROUTES ──
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artists', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, stage_name, email, whatsapp, status, is_verified, created_at FROM artists ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, suspensionEnd } = req.body;
    const result = await pool.query(
      `UPDATE users SET account_status = $1, suspension_reason = $2, suspension_end = $3 
       WHERE id = $4 RETURNING id, name, email`,
      [status, reason || null, suspensionEnd || null, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/artists/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE artists SET status = $1 WHERE id = $2 RETURNING id, full_name, stage_name, email, status',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
