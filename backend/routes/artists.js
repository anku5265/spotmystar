import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken, requireArtist } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { generateArtistCode, formatArtistCode } from '../utils/idGenerator.js';

const router = express.Router();

// Search artists — public
router.get('/search', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, search } = req.query;
    let query = `SELECT a.*, c.name as category_name FROM artists a LEFT JOIN categories c ON a.category_id = c.id WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true`;
    const params = [];
    let p = 1;
    if (city) { query += ' AND LOWER(a.city) LIKE LOWER($' + p + ')'; params.push('%' + city + '%'); p++; }
    if (category) { query += ' AND a.category_id = $' + p; params.push(category); p++; }
    if (minPrice) { query += ' AND a.price_min >= $' + p; params.push(parseInt(minPrice)); p++; }
    if (maxPrice) { query += ' AND a.price_max <= $' + p; params.push(parseInt(maxPrice)); p++; }
    if (search) { query += ' AND (LOWER(a.full_name) LIKE LOWER($' + p + ') OR LOWER(a.stage_name) LIKE LOWER($' + p + '))'; params.push('%' + search + '%'); p++; }
    query += ' ORDER BY a.rating DESC, a.total_bookings DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Featured artists — public
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(`SELECT a.*, c.name as category_name FROM artists a LEFT JOIN categories c ON a.category_id = c.id WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true ORDER BY a.rating DESC, a.total_bookings DESC LIMIT 6`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist by ID, artist_code, or stage name — public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { skipViewCount } = req.query;
    const decoded = decodeURIComponent(identifier).trim();

    // Match priority: artist_code (A1234) → UUID → stage_name
    const result = await pool.query(
      `SELECT a.*, c.name as category_name
       FROM artists a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.artist_code::text = $1
          OR a.id::text = $1
          OR LOWER(a.stage_name) = LOWER($1)`,
      [decoded]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Artist not found' });

    if (skipViewCount !== 'true') {
      await pool.query('UPDATE artists SET views = views + 1 WHERE id = $1', [result.rows[0].id]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Artist registration — public
router.post('/register', async (req, res) => {
  try {
    const { fullName, stageName, category, bio, city, priceMin, priceMax, email, whatsapp, instagram, password, phone, categories, shortBio, primaryCity } = req.body;
    if (!fullName || !stageName || !email || !password) return res.status(400).json({ message: 'Please provide all required fields' });
    const existing = await pool.query('SELECT * FROM artists WHERE email = $1 OR stage_name = $2', [email, stageName]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Artist already exists with this email or stage name' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const categoryId = (categories && categories.length > 0) ? categories[0] : category || null;

    // Generate unique artist code
    let artistCode = null;
    try { artistCode = await generateArtistCode(); } catch { /* non-blocking */ }

    const result = await pool.query(
      `INSERT INTO artists (full_name, stage_name, category_id, bio, city, price_min, price_max, email, whatsapp, instagram, password, status, is_verified, artist_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',false,$12)
       RETURNING id, full_name, stage_name, email, status, is_verified, artist_code`,
      [fullName, stageName, categoryId, shortBio || bio || '', primaryCity || city || '', parseInt(priceMin) || 0, parseInt(priceMax) || 0, email, phone || whatsapp || '', instagram || '', hashedPassword, artistCode]
    );
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
        isVerified: artist.is_verified,
        artistCode: formatArtistCode(artist.artist_code),
      }
    });
  } catch (error) {
    console.error('Artist registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update artist profile — requires manage_profile permission
router.patch('/:id', verifyToken, requireArtist, requirePermission('manage_profile'), async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }
    const allowed = ['bio', 'short_bio', 'city', 'price_min', 'price_max', 'whatsapp', 'instagram', 'availability', 'is_available', 'full_name', 'stage_name', 'phone'];
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        setClauses.push(key + ' = $' + idx);
        values.push(req.body[key]);
        idx++;
      }
    }
    if (setClauses.length === 0) return res.status(400).json({ message: 'No valid fields to update' });
    values.push(id);
    const sql = 'UPDATE artists SET ' + setClauses.join(', ') + ', updated_at = NOW() WHERE id = $' + idx + ' RETURNING id, full_name, stage_name, email, city, price_min, price_max, bio, short_bio, phone, whatsapp, is_available';
    const result = await pool.query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Artist not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating artist profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile image — requires manage_profile permission
router.patch('/:id/profile-image', verifyToken, requireArtist, requirePermission('manage_profile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body;
    if (!profileImage) return res.status(400).json({ message: 'Profile image is required' });
    const result = await pool.query('UPDATE artists SET profile_image = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_image', [profileImage, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Artist not found' });
    res.json({ profileImage: result.rows[0].profile_image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
