import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Artist login
router.post('/artist/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM artists WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artist = result.rows[0];
    const isMatch = await bcrypt.compare(password, artist.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: artist.id, role: 'artist' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      artist: {
        id: artist.id,
        fullName: artist.full_name,
        stageName: artist.stage_name,
        email: artist.email,
        isVerified: artist.is_verified,
        status: artist.status,
        views: artist.views
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User registration
router.post('/user/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone',
      [name, email, phone, hashedPassword, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'user']);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
