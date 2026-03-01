import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, created_at, account_status, suspension_reason, suspension_start, suspension_end FROM users WHERE role = 'user' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/artists', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, full_name, stage_name, email, phone, created_at, account_status, suspension_reason, suspension_start, suspension_end FROM artists ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, duration } = req.body;
    
    let query, params;
    
    if (status === 'suspended' && duration) {
      const suspensionEnd = new Date(Date.now() + duration * 1000);
      query = `UPDATE users 
               SET account_status = $1, 
                   suspension_reason = $2, 
                   suspension_start = NOW(), 
                   suspension_end = $3 
               WHERE id = $4 
               RETURNING id, name, email, account_status, suspension_reason, suspension_start, suspension_end`;
      params = ['suspended', reason || 'No reason provided', suspensionEnd, id];
      
      // Create notification for suspended user
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'user', 'Account Suspended', reason || 'Your account has been suspended', 'account_status']
      );
    } else if (status === 'active') {
      query = `UPDATE users 
               SET account_status = $1, 
                   suspension_reason = NULL, 
                   suspension_start = NULL, 
                   suspension_end = NULL 
               WHERE id = $2 
               RETURNING id, name, email, account_status`;
      params = ['active', id];
      
      // Create notification for reactivated user
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'user', 'Account Reactivated', 'Your account has been reactivated. You can now access all features.', 'account_status']
      );
    } else if (status === 'terminated') {
      query = `UPDATE users 
               SET account_status = $1, 
                   suspension_reason = $2 
               WHERE id = $3 
               RETURNING id, name, email, account_status, suspension_reason`;
      params = ['terminated', reason || 'No reason provided', id];
      
      // Create notification for terminated user
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'user', 'Account Terminated', reason || 'Your account has been permanently terminated', 'account_status']
      );
    } else {
      query = `UPDATE users 
               SET account_status = $1, 
                   suspension_reason = $2 
               WHERE id = $3 
               RETURNING id, name, email, account_status, suspension_reason`;
      params = [status, reason || 'No reason provided', id];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/artists/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, duration } = req.body;
    
    let query, params;
    
    if (status === 'suspended' && duration) {
      const suspensionEnd = new Date(Date.now() + duration * 1000);
      query = `UPDATE artists 
               SET account_status = $1, 
                   suspension_reason = $2, 
                   suspension_start = NOW(), 
                   suspension_end = $3 
               WHERE id = $4 
               RETURNING id, full_name, stage_name, email, account_status, suspension_reason, suspension_start, suspension_end`;
      params = ['suspended', reason || 'No reason provided', suspensionEnd, id];
      
      // Create notification for suspended artist
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'artist', 'Account Suspended', reason || 'Your account has been suspended', 'account_status']
      );
    } else if (status === 'active') {
      query = `UPDATE artists 
               SET account_status = $1, 
                   suspension_reason = NULL, 
                   suspension_start = NULL, 
                   suspension_end = NULL 
               WHERE id = $2 
               RETURNING id, full_name, stage_name, email, account_status`;
      params = ['active', id];
      
      // Create notification for reactivated artist
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'artist', 'Account Reactivated', 'Your account has been reactivated. You can now access all features.', 'account_status']
      );
    } else if (status === 'terminated') {
      query = `UPDATE artists 
               SET account_status = $1, 
                   suspension_reason = $2 
               WHERE id = $3 
               RETURNING id, full_name, stage_name, email, account_status, suspension_reason`;
      params = ['terminated', reason || 'No reason provided', id];
      
      // Create notification for terminated artist
      await pool.query(
        `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, 'artist', 'Account Terminated', reason || 'Your account has been permanently terminated', 'account_status']
      );
    } else {
      query = `UPDATE artists 
               SET account_status = $1, 
                   suspension_reason = $2 
               WHERE id = $3 
               RETURNING id, full_name, stage_name, email, account_status, suspension_reason`;
      params = [status, reason || 'No reason provided', id];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Artist status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
