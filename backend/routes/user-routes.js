import express from 'express';
import pool from '../config/db.js';
import { requireUser, strictRoleGuard } from '../middleware/auth.js';

const router = express.Router();

// Apply strict user-only guard to all routes
router.use(requireUser);
router.use(strictRoleGuard('user'));

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, user_id, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone',
      [name, email, phone, req.user.id]
    );
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             a.stage_name, a.profile_image, a.whatsapp, a.instagram,
             c.name as category_name
      FROM bookings b
      LEFT JOIN artists a ON b.artist_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, a.stage_name, a.profile_image, a.city, a.price_min, a.price_max,
             c.name as category_name
      FROM wishlists w
      LEFT JOIN artists a ON w.artist_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/wishlist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    
    // Check if artist exists
    const artistCheck = await pool.query('SELECT id FROM artists WHERE id = $1', [artistId]);
    if (artistCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT id FROM wishlists WHERE user_id = $1 AND artist_id = $2',
      [req.user.id, artistId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Artist already in wishlist' });
    }
    
    await pool.query(
      'INSERT INTO wishlists (user_id, artist_id) VALUES ($1, $2)',
      [req.user.id, artistId]
    );
    
    res.json({ message: 'Added to wishlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/wishlist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND artist_id = $2',
      [req.user.id, artistId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Artist not found in wishlist' });
    }
    
    res.json({ message: 'Removed from wishlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [bookingsResult, wishlistResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM bookings WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT COUNT(*) as count FROM wishlists WHERE user_id = $1', [req.user.id])
    ]);
    
    res.json({
      totalBookings: parseInt(bookingsResult.rows[0].count),
      wishlistCount: parseInt(wishlistResult.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;