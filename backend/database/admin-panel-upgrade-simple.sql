-- Advanced Admin Panel Database Schema Upgrade (Simple Version)
-- This script adds comprehensive admin management capabilities

-- 1. Add audit log table for tracking all admin actions
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
);

-- 2. Add activity tracking table for user/artist actions
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(10) NOT NULL,
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add risk flags table for suspicious activity tracking
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
);

-- 4. Add performance metrics table for artists
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
);

-- 5. Add booking lifecycle tracking
CREATE TABLE IF NOT EXISTS booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by_type VARCHAR(10),
    changed_by_id UUID,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add users table columns (will skip if already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;

-- 7. Add artists table columns (will skip if already exist)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_start TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspended_by UUID;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS override_availability BOOLEAN DEFAULT false;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS admin_override_price_min INTEGER;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS admin_override_price_max INTEGER;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_risk_flags_user ON risk_flags(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_resolved ON risk_flags(resolved);

CREATE INDEX IF NOT EXISTS idx_artist_performance_metrics_artist_id ON artist_performance_metrics(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_performance_metrics_date ON artist_performance_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_risk_score ON users(risk_score);

CREATE INDEX IF NOT EXISTS idx_artists_account_status ON artists(account_status);
CREATE INDEX IF NOT EXISTS idx_artists_risk_score ON artists(risk_score);
CREATE INDEX IF NOT EXISTS idx_artists_featured ON artists(featured);

-- 9. Create risk scoring function
CREATE OR REPLACE FUNCTION update_user_risk_score(user_id_param UUID, user_type_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    flag_count INTEGER;
    recent_activity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO flag_count
    FROM risk_flags 
    WHERE user_id = user_id_param 
    AND user_type = user_type_param 
    AND resolved = false;
    
    risk_score := risk_score + (flag_count * 20);
    
    SELECT COUNT(*) INTO recent_activity_count
    FROM activity_log 
    WHERE user_id = user_id_param 
    AND user_type = user_type_param 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND activity_type IN ('login', 'profile_edit');
    
    IF recent_activity_count > 50 THEN
        risk_score := risk_score + 30;
    ELSIF recent_activity_count > 20 THEN
        risk_score := risk_score + 15;
    END IF;
    
    IF risk_score > 100 THEN
        risk_score := 100;
    END IF;
    
    IF user_type_param = 'user' THEN
        UPDATE users SET risk_score = risk_score WHERE id = user_id_param;
    ELSE
        UPDATE artists SET risk_score = risk_score WHERE id = user_id_param;
    END IF;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- 10. Add comments
COMMENT ON TABLE admin_audit_log IS 'Tracks all admin actions for accountability';
COMMENT ON TABLE activity_log IS 'Tracks user and artist activities for monitoring';
COMMENT ON TABLE risk_flags IS 'Flags suspicious activities and users for admin review';
COMMENT ON TABLE artist_performance_metrics IS 'Stores daily performance metrics for artists';