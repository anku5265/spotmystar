import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist — get user's wishlist
router.get('/', verifyToken, requireUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.id, w.artist_id, w.created_at,
             a.stage_name, a.full_name, a.profile_image, a.city,
             a.price_min, a.price_max, a.rating, a.views,
             c.name as category_name
      FROM wishlist w
      JOIN artists a ON w.artist_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist — add to wishlist
router.post('/', verifyToken, requireUser, async (req, res) => {
  try {
    const { artistId } = req.body;
    if (!artistId) return res.status(400).json({ message: 'artistId is required' });

    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND artist_id = $2',
      [req.user.id, artistId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Already in wishlist', id: existing.rows[0].id });
    }

    const result = await pool.query(
      'INSERT INTO wishlist (user_id, artist_id) VALUES ($1, $2) RETURNING id',
      [req.user.id, artistId]
    );
    res.status(201).json({ message: 'Added to wishlist', id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/wishlist/:artistId — remove from wishlist
router.delete('/:artistId', verifyToken, requireUser, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND artist_id = $2',
      [req.user.id, req.params.artistId]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/wishlist/check/:artistId — check if artist is in wishlist
router.get('/check/:artistId', verifyToken, requireUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND artist_id = $2',
      [req.user.id, req.params.artistId]
    );
    res.json({ inWishlist: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
