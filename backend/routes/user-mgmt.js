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
    
    let result;
    
    if (status === 'suspended' && duration) {
      const suspensionEnd = new Date(Date.now() + duration * 1000);
      result = await pool.query(
        `UPDATE users 
         SET account_status = $1, 
             suspension_reason = $2, 
             suspension_start = NOW(), 
             suspension_end = $3 
         WHERE id = $4 
         RETURNING id, name, email, account_status, suspension_reason, suspension_start, suspension_end`,
        ['suspended', reason || 'No reason provided', suspensionEnd, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'user', 'Account Suspended', reason || 'Your account has been suspended', 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else if (status === 'active') {
      // Get current status first
      const currentUser = await pool.query('SELECT account_status FROM users WHERE id = $1', [id]);
      const previousStatus = currentUser.rows[0]?.account_status;
      
      result = await pool.query(
        `UPDATE users 
         SET account_status = $1, 
             suspension_reason = NULL, 
             suspension_start = NULL, 
             suspension_end = NULL 
         WHERE id = $2 
         RETURNING id, name, email, account_status`,
        ['active', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create professional notification
      let notificationTitle = 'Account Reactivated';
      let notificationMessage = '';
      
      if (previousStatus === 'terminated') {
        notificationTitle = '🎉 Welcome Back!';
        notificationMessage = 'Great news! Your account has been fully restored and reactivated. After careful review, we are pleased to inform you that you now have complete access to all platform features. Thank you for your patience and understanding. We look forward to serving you again!';
      } else if (previousStatus === 'suspended') {
        notificationTitle = '✅ Account Restored';
        notificationMessage = 'Good news! Your account suspension has been lifted and your account is now fully active. You can now access all features and services without any restrictions. Thank you for your cooperation!';
      } else {
        notificationMessage = 'Your account has been successfully reactivated. You now have full access to all platform features and services. Welcome back!';
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'user', notificationTitle, notificationMessage, 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else if (status === 'terminated') {
      result = await pool.query(
        `UPDATE users 
         SET account_status = $1, 
             suspension_reason = $2 
         WHERE id = $3 
         RETURNING id, name, email, account_status, suspension_reason`,
        ['terminated', reason || 'No reason provided', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'user', 'Account Terminated', reason || 'Your account has been permanently terminated', 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else {
      result = await pool.query(
        `UPDATE users 
         SET account_status = $1, 
             suspension_reason = $2 
         WHERE id = $3 
         RETURNING id, name, email, account_status, suspension_reason`,
        [status, reason || 'No reason provided', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
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
    
    let result;
    
    if (status === 'suspended' && duration) {
      const suspensionEnd = new Date(Date.now() + duration * 1000);
      result = await pool.query(
        `UPDATE artists 
         SET account_status = $1, 
             suspension_reason = $2, 
             suspension_start = NOW(), 
             suspension_end = $3 
         WHERE id = $4 
         RETURNING id, full_name, stage_name, email, account_status, suspension_reason, suspension_start, suspension_end`,
        ['suspended', reason || 'No reason provided', suspensionEnd, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Artist not found' });
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'artist', 'Account Suspended', reason || 'Your account has been suspended', 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else if (status === 'active') {
      // Get current status first
      const currentArtist = await pool.query('SELECT account_status FROM artists WHERE id = $1', [id]);
      const previousStatus = currentArtist.rows[0]?.account_status;
      
      result = await pool.query(
        `UPDATE artists 
         SET account_status = $1, 
             suspension_reason = NULL, 
             suspension_start = NULL, 
             suspension_end = NULL 
         WHERE id = $2 
         RETURNING id, full_name, stage_name, email, account_status`,
        ['active', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Artist not found' });
      }
      
      // Create professional notification
      let notificationTitle = 'Account Reactivated';
      let notificationMessage = '';
      
      if (previousStatus === 'terminated') {
        notificationTitle = '🎉 Welcome Back!';
        notificationMessage = 'Excellent news! Your artist account has been fully restored and reactivated. After thorough review, we are delighted to inform you that you now have complete access to all platform features including bookings, profile management, and client interactions. Thank you for your patience. We are excited to have you back!';
      } else if (previousStatus === 'suspended') {
        notificationTitle = '✅ Account Restored';
        notificationMessage = 'Great news! Your account suspension has been lifted and your artist profile is now fully active. You can now receive bookings, manage your profile, and interact with clients without any restrictions. Thank you for your cooperation!';
      } else {
        notificationMessage = 'Your artist account has been successfully reactivated. You now have full access to all platform features including bookings and profile management. Welcome back!';
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'artist', notificationTitle, notificationMessage, 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else if (status === 'terminated') {
      result = await pool.query(
        `UPDATE artists 
         SET account_status = $1, 
             suspension_reason = $2 
         WHERE id = $3 
         RETURNING id, full_name, stage_name, email, account_status, suspension_reason`,
        ['terminated', reason || 'No reason provided', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Artist not found' });
      }
      
      // Try to create notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, user_type, title, message, type, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [id, 'artist', 'Account Terminated', reason || 'Your account has been permanently terminated', 'account_status']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError.message);
      }
      
    } else {
      result = await pool.query(
        `UPDATE artists 
         SET account_status = $1, 
             suspension_reason = $2 
         WHERE id = $3 
         RETURNING id, full_name, stage_name, email, account_status, suspension_reason`,
        [status, reason || 'No reason provided', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Artist not found' });
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Artist status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
