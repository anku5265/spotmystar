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

    // Check account status
    if (artist.account_status === 'suspended') {
      if (artist.suspension_end && new Date(artist.suspension_end) > new Date()) {
        return res.status(403).json({ 
          message: 'Your account has been suspended',
          reason: artist.suspension_reason || 'No reason provided',
          suspendedUntil: artist.suspension_end
        });
      } else {
        // Suspension expired, reactivate account
        await pool.query('UPDATE artists SET account_status = $1, suspension_reason = NULL, suspension_start = NULL, suspension_end = NULL WHERE id = $2', ['active', artist.id]);
      }
    } else if (artist.account_status === 'inactive') {
      return res.status(403).json({ 
        message: 'Your account has been deactivated',
        reason: artist.suspension_reason || 'No reason provided'
      });
    } else if (artist.account_status === 'terminated') {
      return res.status(403).json({ 
        message: 'Your account has been permanently terminated',
        reason: artist.suspension_reason || 'No reason provided'
      });
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

    // Check account status
    if (user.account_status === 'suspended') {
      if (user.suspension_end && new Date(user.suspension_end) > new Date()) {
        return res.status(403).json({ 
          message: 'Your account has been suspended',
          reason: user.suspension_reason || 'No reason provided',
          suspendedUntil: user.suspension_end
        });
      } else {
        // Suspension expired, reactivate account
        await pool.query('UPDATE users SET account_status = $1, suspension_reason = NULL, suspension_start = NULL, suspension_end = NULL WHERE id = $2', ['active', user.id]);
      }
    } else if (user.account_status === 'inactive') {
      return res.status(403).json({ 
        message: 'Your account has been deactivated',
        reason: user.suspension_reason || 'No reason provided'
      });
    } else if (user.account_status === 'terminated') {
      return res.status(403).json({ 
        message: 'Your account has been permanently terminated',
        reason: user.suspension_reason || 'No reason provided'
      });
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

// Update user profile
router.patch('/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email, phone, currentPassword, newPassword } = req.body;

    // Get current user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, decoded.id]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Update user
    let query, params;
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      query = 'UPDATE users SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5 RETURNING id, name, email, phone';
      params = [name, email, phone, hashedPassword, decoded.id];
    } else {
      query = 'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone';
      params = [name, email, phone, decoded.id];
    }

    const result = await pool.query(query, params);
    const updatedUser = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
