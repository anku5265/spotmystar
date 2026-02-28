import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const query = "SELECT id, name, email, phone, created_at, account_status FROM users WHERE role = 'user' ORDER BY created_at DESC";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artists', async (req, res) => {
  try {
    const query = 'SELECT id, full_name, stage_name, email, phone, created_at, account_status FROM artists ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;