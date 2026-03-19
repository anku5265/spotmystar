import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateArtistId } from '../utils/idGenerator.js';

const router = express.Router();

// Search artists with filters
router.get('/search', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, search } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true
    `;
    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(a.city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND a.category_id = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND a.price_min >= $${paramCount}`;
      params.push(parseInt(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND a.price_max <= $${paramCount}`;
      params.push(parseInt(maxPrice));
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.stage_name) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY a.rating DESC, a.total_bookings DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured artists
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true 
      ORDER BY a.rating DESC, a.total_bookings DESC 
      LIMIT 6
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist by stage name or ID (public - increments views)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { skipViewCount } = req.query; // Add query parameter to skip view increment
    
    const result = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.stage_name = $1 OR a.id::text = $1
    `, [identifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Increment views only if skipViewCount is not true
    if (skipViewCount !== 'true') {
      await pool.query('UPDATE artists SET views = views + 1 WHERE id = $1', [result.rows[0].id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Artist registration (supports both old and new multi-category format)
router.post('/register', async (req, res) => {
  try {
    const {
      fullName, stageName, category, bio, city, priceMin, priceMax,
      email, whatsapp, instagram, password,
      // New format fields
      phone, categories, primaryCategory, shortBio, primaryCity,
      pricingModel, youtube, facebook, twitter, linkedin, website,
    } = req.body;

    if (!fullName || !stageName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if artist exists
    const existing = await pool.query(
      'SELECT * FROM artists WHERE email = $1 OR stage_name = $2',
      [email, stageName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Artist already exists with this email or stage name' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine category_id - use first selected category or single category
    const categoryId = (categories && categories.length > 0) ? categories[0] : category || null;

    // Use schema-compatible columns only
    const contactPhone = phone || whatsapp || '';
    const artistBio = shortBio || bio || '';
    const artistCity = primaryCity || city || '';
    const artistPriceMin = parseInt(priceMin) || 0;
    const artistPriceMax = parseInt(priceMax) || 0;
    const artistInstagram = instagram || '';
    const artistWhatsapp = contactPhone;

    const result = await pool.query(`
      INSERT INTO artists (
        full_name, stage_name, category_id, bio, city,
        price_min, price_max, email, whatsapp, instagram,
        password, status, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', false)
      RETURNING id, full_name, stage_name, email, status, is_verified
    `, [
      fullName, stageName, categoryId, artistBio, artistCity,
      artistPriceMin, artistPriceMax, email, artistWhatsapp, artistInstagram,
      hashedPassword
    ]);

    const artist = result.rows[0];
    const token = jwt.sign({ id: artist.id, role: 'artist' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful! Your profile is under review.',
      token,
      artist: {
        id: artist.id,
        fullName: artist.full_name,
        stageName: artist.stage_name,
        email: artist.email,
        status: artist.status,
        isVerified: artist.is_verified
      }
    });
  } catch (error) {
    console.error('Artist registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update artist profile image
router.patch('/:id/profile-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const result = await pool.query(
      'UPDATE artists SET profile_image = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_image',
      [profileImage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json({ profileImage: result.rows[0].profile_image });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
