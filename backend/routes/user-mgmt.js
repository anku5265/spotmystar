import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, created_at, account_status FROM users WHERE role = 'user' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artists', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, stage_name, email, phone, created_at, account_status FROM artists ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query('UPDATE users SET account_status = $1 WHERE id = $2 RETURNING id, name, email, account_status', [status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/artists/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query('UPDATE artists SET account_status = $1 WHERE id = $2 RETURNING id, full_name, stage_name, email, account_status', [status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
