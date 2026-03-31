import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken, requireBrand, requireAdmin, requireArtist } from '../middleware/auth.js';

const router = express.Router();

// ── BRAND AUTH ──────────────────────────────────────────────────────────────

// Brand Register
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, mobile, website, instagram, password } = req.body;
    if (!companyName || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Company name, email, mobile and password are required' });
    }
    const existing = await pool.query('SELECT id FROM brand_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO brand_users (company_name, email, mobile, website, instagram, password)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, company_name, email, mobile, is_verified`,
      [companyName, email, mobile, website || null, instagram || null, hashed]
    );
    res.status(201).json({ message: 'Registration successful! Awaiting admin approval.', brand: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Brand Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM brand_users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Brand not found' });

    const brand = result.rows[0];
    const isMatch = await bcrypt.compare(password, brand.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!brand.is_verified) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const token = jwt.sign({ id: brand.id, role: 'brand' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      brand: { id: brand.id, companyName: brand.company_name, email: brand.email, mobile: brand.mobile }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Brand profile
router.get('/me', verifyToken, requireBrand, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, company_name, email, mobile, website, instagram, is_verified, created_at FROM brand_users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Brand not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── REQUIREMENTS (BRAND) ────────────────────────────────────────────────────

// Post requirement
router.post('/requirements', verifyToken, requireBrand, async (req, res) => {
  try {
    const { title, description, category, eventDate, eventTime, location, budgetRange, bannerImageUrl } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description and category are required' });
    }

    // Max 3 posts per day
    const todayCount = await pool.query(
      `SELECT COUNT(*) FROM requirements WHERE brand_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [req.user.id]
    );
    if (parseInt(todayCount.rows[0].count) >= 3) {
      return res.status(429).json({ message: 'Maximum 3 posts per day allowed' });
    }

    const result = await pool.query(
      `INSERT INTO requirements (brand_id, title, description, category, event_date, event_time, location, budget_range, banner_image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, title, description, category, eventDate || null, eventTime || null, location || null, budgetRange || null, bannerImageUrl || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get brand's own requirements
router.get('/requirements/mine', verifyToken, requireBrand, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, COUNT(ar.id) as response_count
       FROM requirements r
       LEFT JOIN artist_responses ar ON ar.requirement_id = r.id
       WHERE r.brand_id = $1
       GROUP BY r.id ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit requirement (only if pending)
router.patch('/requirements/:id', verifyToken, requireBrand, async (req, res) => {
  try {
    const req_check = await pool.query('SELECT * FROM requirements WHERE id = $1 AND brand_id = $2', [req.params.id, req.user.id]);
    if (req_check.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    if (req_check.rows[0].status !== 'pending') return res.status(400).json({ message: 'Can only edit pending requirements' });

    const { title, description, category, eventDate, eventTime, location, budgetRange, bannerImageUrl } = req.body;
    const result = await pool.query(
      `UPDATE requirements SET title=$1, description=$2, category=$3, event_date=$4, event_time=$5, location=$6, budget_range=$7, banner_image_url=$8
       WHERE id=$9 AND brand_id=$10 RETURNING *`,
      [title, description, category, eventDate || null, eventTime || null, location || null, budgetRange || null, bannerImageUrl || null, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete requirement (only if pending)
router.delete('/requirements/:id', verifyToken, requireBrand, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM requirements WHERE id=$1 AND brand_id=$2 AND status='pending' RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found or already approved' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get responses for a requirement
router.get('/requirements/:id/responses', verifyToken, requireBrand, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, a.stage_name, a.full_name, a.profile_image, a.city, a.category_id, a.rating, a.artist_code,
              c.name as category_name
       FROM artist_responses ar
       JOIN artists a ON ar.artist_id = a.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE ar.requirement_id = $1
       ORDER BY ar.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── REQUIREMENTS (ARTIST VIEW) ──────────────────────────────────────────────

// Get approved requirements — artists only
router.get('/opportunities', verifyToken, requireArtist, async (req, res) => {
  try {
    const { category, location, sort = 'latest' } = req.query;
    let query = `
      SELECT r.*, b.company_name, b.instagram as brand_instagram,
             COUNT(ar.id) as response_count,
             EXISTS(SELECT 1 FROM artist_responses ar2 WHERE ar2.requirement_id = r.id AND ar2.artist_id = $1) as already_responded
      FROM requirements r
      JOIN brand_users b ON r.brand_id = b.id
      LEFT JOIN artist_responses ar ON ar.requirement_id = r.id
      WHERE r.status = 'approved'
    `;
    const params = [req.user.id];
    let p = 2;

    if (category) { query += ` AND LOWER(r.category) = LOWER($${p})`; params.push(category); p++; }
    if (location) { query += ` AND LOWER(r.location) LIKE LOWER($${p})`; params.push(`%${location}%`); p++; }

    query += ` GROUP BY r.id, b.company_name, b.instagram`;
    query += sort === 'latest' ? ' ORDER BY r.created_at DESC' : ' ORDER BY r.event_date ASC NULLS LAST';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Artist respond to requirement
router.post('/opportunities/:id/respond', verifyToken, requireArtist, async (req, res) => {
  try {
    const { status, message } = req.body; // status: 'interested' | 'not_interested'
    if (!['interested', 'not_interested'].includes(status)) {
      return res.status(400).json({ message: 'Status must be interested or not_interested' });
    }

    // Check requirement exists and is approved
    const req_check = await pool.query(`SELECT id FROM requirements WHERE id = $1 AND status = 'approved'`, [req.params.id]);
    if (req_check.rows.length === 0) return res.status(404).json({ message: 'Requirement not found' });

    // Upsert response
    const result = await pool.query(
      `INSERT INTO artist_responses (requirement_id, artist_id, status, message)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (requirement_id, artist_id) DO UPDATE SET status = $3, message = $4, created_at = NOW()
       RETURNING *`,
      [req.params.id, req.user.id, status, message || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ADMIN CONTROLS ──────────────────────────────────────────────────────────

// Get all brands
router.get('/admin/brands', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, COUNT(r.id) as total_posts
       FROM brand_users b LEFT JOIN requirements r ON r.brand_id = b.id
       GROUP BY b.id ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject brand
router.patch('/admin/brands/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { is_verified } = req.body;
    const result = await pool.query(
      'UPDATE brand_users SET is_verified = $1 WHERE id = $2 RETURNING id, company_name, email, is_verified',
      [is_verified, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Brand not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all requirements (admin)
router.get('/admin/requirements', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT r.*, b.company_name, COUNT(ar.id) as response_count
                 FROM requirements r JOIN brand_users b ON r.brand_id = b.id
                 LEFT JOIN artist_responses ar ON ar.requirement_id = r.id`;
    const params = [];
    if (status) { query += ` WHERE r.status = $1`; params.push(status); }
    query += ` GROUP BY r.id, b.company_name ORDER BY r.created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject requirement
router.patch('/admin/requirements/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Inval
id status' });
    const result = await pool.query(
      `UPDATE requirements SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete requirement (admin)
router.delete('/admin/requirements/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM requirements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
