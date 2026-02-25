import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, icon, description) VALUES ($1, $2, $3) RETURNING *',
      [name, icon, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
