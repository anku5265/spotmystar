import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Middleware to log admin actions
const logAdminAction = async (adminId, actionType, targetType, targetId, oldValues, newValues, reason, req) => {
  try {
    await pool.query(
      `INSERT INTO admin_audit_log (admin_id, action_type, target_type, target_id, old_values, new_values, reason, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        adminId,
        actionType,
        targetType,
        targetId,
        JSON.stringify(oldValues),
        JSON.stringify(newValues),
        reason,
        req.ip,
        req.get('User-Agent')
      ]
    );
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// 1. ADVANCED USER MANAGEMENT

// Get all users with advanced filtering and search
router.get('/users/advanced', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      riskLevel, 
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT u.*, 
        COUNT(DISTINCT b.id) as total_bookings,
        0 as risk_flags_count,
        0 as login_frequency
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'user'
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (LOWER(u.name) LIKE LOWER($${paramCount}) OR LOWER(u.email) LIKE LOWER($${paramCount}) OR u.phone LIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND COALESCE(u.account_status, 'active') = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (riskLevel) {
      const riskRanges = {
        low: [0, 30],
        medium: [31, 60],
        high: [61, 80],
        critical: [81, 100]
      };
      const range = riskRanges[riskLevel];
      if (range) {
        query += ` AND COALESCE(u.risk_score, 0) BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(range[0], range[1]);
        paramCount += 2;
      }
    }

    query += ` GROUP BY u.id`;
    
    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['created_at', 'name', 'email', 'risk_score'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY u.${safeSortBy} ${safeSortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(DISTINCT u.id) FROM users u WHERE u.role = 'user'`;
    const countResult = await pool.query(countQuery);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching advanced users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user account status with comprehensive controls
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      reason, 
      suspensionDuration, 
      suspensionUnit = 'days',
      adminNotes 
    } = req.body;

    // Get current user data for audit log
    const currentUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldValues = currentUser.rows[0];
    let suspensionEnd = null;

    // Calculate suspension end time
    if (status === 'suspended' && suspensionDuration) {
      const duration = parseInt(suspensionDuration);
      const unit = suspensionUnit === 'hours' ? 'hours' : 'days';
      suspensionEnd = new Date();
      if (unit === 'hours') {
        suspensionEnd.setHours(suspensionEnd.getHours() + duration);
      } else {
        suspensionEnd.setDate(suspensionEnd.getDate() + duration);
      }
    }

    // Update user status
    const updateQuery = `
      UPDATE users 
      SET account_status = $1, 
          suspension_reason = $2, 
          suspension_start = $3,
          suspension_end = $4,
          suspended_by = $5
      WHERE id = $6 
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      status,
      reason,
      status === 'suspended' ? new Date() : null,
      suspensionEnd,
      req.user?.id || 1, // Admin ID from auth middleware
      id
    ]);

    // Log admin action
    await logAdminAction(
      req.user?.id || 1,
      'user_status_change',
      'user',
      id,
      { account_status: oldValues.account_status },
      { account_status: status, reason, suspensionEnd },
      reason,
      req
    );

    // Create notification for user
    if (status === 'suspended') {
      await pool.query(
        `INSERT INTO notifications (user_type, user_id, type, title, message)
         VALUES ('user', $1, 'account_status', 'Account Suspended', $2)`,
        [id, `Your account has been suspended. Reason: ${reason}. ${suspensionEnd ? `Suspension ends: ${suspensionEnd.toLocaleString()}` : ''}`]
      );
    } else if (status === 'active') {
      await pool.query(
        `INSERT INTO notifications (user_type, user_id, type, title, message)
         VALUES ('user', $1, 'account_status', 'Account Reactivated', 'Your account has been reactivated.')`,
        [id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: error.message });
  }
});

// 2. ADVANCED ARTIST MANAGEMENT

// Get all artists with advanced filtering
router.get('/artists/advanced', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      category,
      city,
      verified,
      featured,
      riskLevel,
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT DISTINCT a.*, 
        string_agg(DISTINCT c.name, ', ') as categories,
        COUNT(DISTINCT b.id) as total_bookings,
        0 as risk_flags_count,
        0 as recent_views,
        0 as recent_requests
      FROM artists a
      LEFT JOIN artist_categories ac ON a.id = ac.artist_id
      LEFT JOIN categories c ON ac.category_id = c.id
      LEFT JOIN bookings b ON a.id = b.artist_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.stage_name) LIKE LOWER($${paramCount}) OR LOWER(a.email) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (city) {
      query += ` AND LOWER(a.city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
      paramCount++;
    }

    if (verified !== undefined) {
      query += ` AND a.is_verified = $${paramCount}`;
      params.push(verified === 'true');
      paramCount++;
    }

    if (featured !== undefined) {
      query += ` AND COALESCE(a.featured, false) = $${paramCount}`;
      params.push(featured === 'true');
      paramCount++;
    }

    if (riskLevel) {
      const riskRanges = {
        low: [0, 30],
        medium: [31, 60],
        high: [61, 80],
        critical: [81, 100]
      };
      const range = riskRanges[riskLevel];
      if (range) {
        query += ` AND COALESCE(a.risk_score, 0) BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(range[0], range[1]);
        paramCount += 2;
      }
    }

    query += ` GROUP BY a.id`;
    
    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['created_at', 'full_name', 'stage_name', 'status', 'risk_score'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY a.${safeSortBy} ${safeSortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT a.id) FROM artists a WHERE 1=1`;
    const countResult = await pool.query(countQuery);

    res.json({
      artists: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching advanced artists:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update artist with admin overrides
router.patch('/artists/:id/admin-update', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status,
      verified,
      featured,
      featuredUntil,
      overrideAvailability,
      overridePriceMin,
      overridePriceMax,
      adminNotes,
      verificationNotes,
      reason
    } = req.body;

    // Get current artist data
    const currentArtist = await pool.query('SELECT * FROM artists WHERE id = $1', [id]);
    if (currentArtist.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const oldValues = currentArtist.rows[0];

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (verified !== undefined) {
      updates.push(`is_verified = $${paramCount}`);
      values.push(verified);
      paramCount++;
    }

    if (featured !== undefined) {
      updates.push(`featured = $${paramCount}`);
      values.push(featured);
      paramCount++;
    }

    if (featuredUntil) {
      updates.push(`featured_until = $${paramCount}`);
      values.push(new Date(featuredUntil));
      paramCount++;
    }

    if (overrideAvailability !== undefined) {
      updates.push(`override_availability = $${paramCount}`);
      values.push(overrideAvailability);
      paramCount++;
    }

    if (overridePriceMin) {
      updates.push(`admin_override_price_min = $${paramCount}`);
      values.push(overridePriceMin);
      paramCount++;
    }

    if (overridePriceMax) {
      updates.push(`admin_override_price_max = $${paramCount}`);
      values.push(overridePriceMax);
      paramCount++;
    }

    if (adminNotes) {
      updates.push(`admin_notes = $${paramCount}`);
      values.push(adminNotes);
      paramCount++;
    }

    if (verificationNotes) {
      updates.push(`verification_notes = $${paramCount}`);
      values.push(verificationNotes);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    values.push(id);
    const updateQuery = `UPDATE artists SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(updateQuery, values);

    // Log admin action
    await logAdminAction(
      req.user?.id || 1,
      'artist_admin_update',
      'artist',
      id,
      oldValues,
      req.body,
      reason,
      req
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ message: error.message });
  }
});

// 3. BOOKING MANAGEMENT

// Get bookings with advanced filtering
router.get('/bookings/advanced', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      priority,
      escalated,
      dateFrom,
      dateTo,
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT b.*, 
        a.full_name as artist_name, 
        a.stage_name as artist_stage_name,
        u.name as user_name,
        u.email as user_email,
        COUNT(bsh.id) as status_changes
      FROM bookings b
      LEFT JOIN artists a ON b.artist_id = a.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN booking_status_history bsh ON b.id = bsh.booking_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.stage_name) LIKE LOWER($${paramCount}) OR LOWER(u.name) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND b.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (escalated !== undefined) {
      query += ` AND b.escalated = $${paramCount}`;
      params.push(escalated === 'true');
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND b.event_date >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND b.event_date <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }

    query += ` GROUP BY b.id, a.full_name, a.stage_name, u.name, u.email`;
    query += ` ORDER BY b.${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching advanced bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update booking status with admin controls
router.patch('/bookings/:id/admin-action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, priority, adminNotes } = req.body;

    // Get current booking
    const currentBooking = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (currentBooking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = currentBooking.rows[0].status;
    let newStatus = oldStatus;
    let escalated = currentBooking.rows[0].escalated;

    // Determine new status based on action
    switch (action) {
      case 'approve':
        newStatus = 'confirmed';
        break;
      case 'reject':
        newStatus = 'cancelled';
        break;
      case 'escalate':
        escalated = true;
        break;
      case 'resolve':
        escalated = false;
        break;
    }

    // Update booking
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          escalated = $2, 
          priority = $3, 
          admin_notes = $4,
          ${action === 'escalate' ? 'escalated_by = $5, escalated_at = NOW(),' : ''}
          ${action === 'resolve' ? 'resolved_by = $5, resolved_at = NOW(),' : ''}
      WHERE id = $6 
      RETURNING *
    `;

    const values = [newStatus, escalated, priority || 'normal', adminNotes];
    if (action === 'escalate' || action === 'resolve') {
      values.push(req.user?.id || 1);
    }
    values.push(id);

    const result = await pool.query(updateQuery, values);

    // Log status change
    await pool.query(
      `INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by_type, changed_by_id, reason)
       VALUES ($1, $2, $3, 'admin', $4, $5)`,
      [id, oldStatus, newStatus, req.user?.id || 1, reason]
    );

    // Log admin action
    await logAdminAction(
      req.user?.id || 1,
      `booking_${action}`,
      'booking',
      id,
      { status: oldStatus, escalated: currentBooking.rows[0].escalated },
      { status: newStatus, escalated, action },
      reason,
      req
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// 4. RISK MANAGEMENT

// Get risk flags
router.get('/risk-flags', async (req, res) => {
  try {
    // Check if risk_flags table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'risk_flags'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // Return empty array if table doesn't exist
      return res.json([]);
    }

    const { resolved = 'false', severity, userType } = req.query;

    let query = `
      SELECT rf.*, 
        CASE 
          WHEN rf.user_type = 'user' THEN u.name
          WHEN rf.user_type = 'artist' THEN a.full_name
        END as user_name,
        CASE 
          WHEN rf.user_type = 'user' THEN u.email
          WHEN rf.user_type = 'artist' THEN a.email
        END as user_email
      FROM risk_flags rf
      LEFT JOIN users u ON rf.user_type = 'user' AND rf.user_id = u.id
      LEFT JOIN artists a ON rf.user_type = 'artist' AND rf.user_id = a.id
      WHERE rf.resolved = $1
    `;

    const params = [resolved === 'true'];
    let paramCount = 2;

    if (severity) {
      query += ` AND rf.severity = $${paramCount}`;
      params.push(severity);
      paramCount++;
    }

    if (userType) {
      query += ` AND rf.user_type = $${paramCount}`;
      params.push(userType);
      paramCount++;
    }

    query += ` ORDER BY rf.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching risk flags:', error);
    // Return empty array on error
    res.json([]);
  }
});

// Create risk flag
router.post('/risk-flags', async (req, res) => {
  try {
    const { userType, userId, flagType, severity, description } = req.body;

    const result = await pool.query(
      `INSERT INTO risk_flags (user_type, user_id, flag_type, severity, description, auto_generated)
       VALUES ($1, $2, $3, $4, $5, false) RETURNING *`,
      [userType, userId, flagType, severity, description]
    );

    // Update risk score
    await pool.query('SELECT update_user_risk_score($1, $2)', [userId, userType]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating risk flag:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resolve risk flag
router.patch('/risk-flags/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const result = await pool.query(
      `UPDATE risk_flags 
       SET resolved = true, resolved_by = $1, resolved_at = NOW()
       WHERE id = $2 RETURNING *`,
      [req.user?.id || 1, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error resolving risk flag:', error);
    res.status(500).json({ message: error.message });
  }
});

// 5. ANALYTICS AND REPORTING

// Get admin dashboard analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // User analytics - using existing tables
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN COALESCE(account_status, 'active') = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN COALESCE(account_status, 'active') = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN COALESCE(risk_score, 0) > 60 THEN 1 END) as high_risk_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '${period} days' THEN 1 END) as new_users
      FROM users WHERE role = 'user'
    `);

    // Artist analytics - using existing tables
    const artistStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN status IN ('approved', 'active') THEN 1 END) as active_artists,
        COUNT(CASE WHEN status IN ('pending', 'submitted') THEN 1 END) as pending_artists,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_artists,
        COUNT(CASE WHEN COALESCE(featured, false) = true THEN 1 END) as featured_artists,
        COUNT(CASE WHEN COALESCE(risk_score, 0) > 60 THEN 1 END) as high_risk_artists
      FROM artists
    `);

    // Booking analytics - using existing tables
    const bookingStats = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN COALESCE(escalated, false) = true THEN 1 END) as escalated_bookings,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '${period} days' THEN 1 END) as recent_bookings
      FROM bookings
    `);

    // Risk analytics - check if table exists first
    let riskStats;
    try {
      riskStats = await pool.query(`
        SELECT 
          COUNT(*) as total_flags,
          COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_flags,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_flags,
          COUNT(CASE WHEN auto_generated = true THEN 1 END) as auto_generated_flags
        FROM risk_flags
      `);
    } catch (error) {
      // If risk_flags table doesn't exist, return default values
      riskStats = { rows: [{ total_flags: 0, unresolved_flags: 0, critical_flags: 0, auto_generated_flags: 0 }] };
    }

    // Activity trends - check if table exists first
    let activityTrends;
    try {
      activityTrends = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as activity_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM activity_log 
        WHERE created_at > NOW() - INTERVAL '${period} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
    } catch (error) {
      // If activity_log table doesn't exist, return empty array
      activityTrends = { rows: [] };
    }

    res.json({
      users: userStats.rows[0],
      artists: artistStats.rows[0],
      bookings: bookingStats.rows[0],
      risks: riskStats.rows[0],
      activityTrends: activityTrends.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get audit log
router.get('/audit-log', async (req, res) => {
  try {
    // Check if admin_audit_log table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_audit_log'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // Return empty array if table doesn't exist
      return res.json([]);
    }

    const { 
      adminId, 
      actionType, 
      targetType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50
    } = req.query;

    let query = `
      SELECT aal.*, u.name as admin_name
      FROM admin_audit_log aal
      LEFT JOIN users u ON aal.admin_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (adminId) {
      query += ` AND aal.admin_id = $${paramCount}`;
      params.push(adminId);
      paramCount++;
    }

    if (actionType) {
      query += ` AND aal.action_type = $${paramCount}`;
      params.push(actionType);
      paramCount++;
    }

    if (targetType) {
      query += ` AND aal.target_type = $${paramCount}`;
      params.push(targetType);
      paramCount++;
    }

    if (dateFrom) {
      query += ` AND aal.created_at >= $${paramCount}`;
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      query += ` AND aal.created_at <= $${paramCount}`;
      params.push(dateTo);
      paramCount++;
    }

    query += ` ORDER BY aal.created_at DESC`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    // Return empty array on error
    res.json([]);
  }
});

export default router;