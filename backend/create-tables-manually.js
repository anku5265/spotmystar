import pool from './config/db.js';

async function createTables() {
  try {
    console.log('🚀 Creating admin panel tables manually...');

    // Create admin_audit_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id SERIAL PRIMARY KEY,
        admin_id UUID,
        action_type VARCHAR(50) NOT NULL,
        target_type VARCHAR(20) NOT NULL,
        target_id VARCHAR(50) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        reason TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ admin_audit_log table created');

    // Create activity_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_type VARCHAR(10) NOT NULL,
        user_id UUID NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ activity_log table created');

    // Create risk_flags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS risk_flags (
        id SERIAL PRIMARY KEY,
        user_type VARCHAR(10) NOT NULL,
        user_id UUID NOT NULL,
        flag_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        description TEXT,
        auto_generated BOOLEAN DEFAULT false,
        resolved BOOLEAN DEFAULT false,
        resolved_by UUID,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ risk_flags table created');

    // Create artist_performance_metrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artist_performance_metrics (
        id SERIAL PRIMARY KEY,
        artist_id UUID,
        metric_date DATE DEFAULT CURRENT_DATE,
        profile_views INTEGER DEFAULT 0,
        booking_requests INTEGER DEFAULT 0,
        booking_confirmations INTEGER DEFAULT 0,
        response_time_avg INTEGER,
        rating_avg DECIMAL(3,2),
        revenue_generated DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ artist_performance_metrics table created');

    // Create booking_status_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_status_history (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER,
        old_status VARCHAR(20),
        new_status VARCHAR(20),
        changed_by_type VARCHAR(10),
        changed_by_id UUID,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ booking_status_history table created');

    // Add missing bookings columns
    try {
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS escalated_by UUID');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS resolved_by UUID');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP');
      await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT \'normal\'');
      console.log('✅ bookings table columns added');
    } catch (error) {
      console.log('⚠️  Bookings table might not exist:', error.message);
    }

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_type, user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_risk_flags_user ON risk_flags(user_type, user_id)');
    console.log('✅ Indexes created');

    // Verify tables exist
    const tables = ['admin_audit_log', 'activity_log', 'risk_flags', 'artist_performance_metrics', 'booking_status_history'];
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [table]
      );
      console.log(`Table '${table}': ${result.rows[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    console.log('🎉 All tables created successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();