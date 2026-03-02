-- Advanced Admin Panel Database Schema Upgrade (UUID Fixed)
-- This script adds comprehensive admin management capabilities

-- 1. Add audit log table for tracking all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL, -- 'user_suspend', 'artist_verify', 'booking_approve', etc.
    target_type VARCHAR(20) NOT NULL, -- 'user', 'artist', 'booking'
    target_id VARCHAR(50) NOT NULL, -- Can be UUID or integer depending on target
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
    user_type VARCHAR(10) NOT NULL, -- 'user' or 'artist'
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'profile_edit', 'booking_create', etc.
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
    flag_type VARCHAR(50) NOT NULL, -- 'multiple_accounts', 'suspicious_booking', 'fake_profile', etc.
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    auto_generated BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add performance metrics table for artists
CREATE TABLE IF NOT EXISTS artist_performance_metrics (
    id SERIAL PRIMARY KEY,
    artist_id UUID REFERENCES artists(id),
    metric_date DATE DEFAULT CURRENT_DATE,
    profile_views INTEGER DEFAULT 0,
    booking_requests INTEGER DEFAULT 0,
    booking_confirmations INTEGER DEFAULT 0,
    response_time_avg INTEGER, -- in minutes
    rating_avg DECIMAL(3,2),
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, metric_date)
);

-- 5. Add booking lifecycle tracking (check if bookings table exists first)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        -- Check if bookings.id is UUID or INTEGER
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id' AND data_type = 'uuid') THEN
            -- Bookings uses UUID
            CREATE TABLE IF NOT EXISTS booking_status_history (
                id SERIAL PRIMARY KEY,
                booking_id UUID REFERENCES bookings(id),
                old_status VARCHAR(20),
                new_status VARCHAR(20),
                changed_by_type VARCHAR(10), -- 'user', 'artist', 'admin'
                changed_by_id UUID,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ELSE
            -- Bookings uses INTEGER
            CREATE TABLE IF NOT EXISTS booking_status_history (
                id SERIAL PRIMARY KEY,
                booking_id INTEGER REFERENCES bookings(id),
                old_status VARCHAR(20),
                new_status VARCHAR(20),
                changed_by_type VARCHAR(10), -- 'user', 'artist', 'admin'
                changed_by_id UUID,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        END IF;
    END IF;
END $$;

-- 6. Enhance users table with admin management fields (skip if columns already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_status') THEN
        ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspension_reason') THEN
        ALTER TABLE users ADD COLUMN suspension_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspension_start') THEN
        ALTER TABLE users ADD COLUMN suspension_start TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspension_end') THEN
        ALTER TABLE users ADD COLUMN suspension_end TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspended_by') THEN
        ALTER TABLE users ADD COLUMN suspended_by UUID REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'risk_score') THEN
        ALTER TABLE users ADD COLUMN risk_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_count') THEN
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_completion_score') THEN
        ALTER TABLE users ADD COLUMN profile_completion_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- 7. Enhance artists table with admin management fields (skip if columns already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'account_status') THEN
        ALTER TABLE artists ADD COLUMN account_status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'suspension_reason') THEN
        ALTER TABLE artists ADD COLUMN suspension_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'suspension_start') THEN
        ALTER TABLE artists ADD COLUMN suspension_start TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'suspension_end') THEN
        ALTER TABLE artists ADD COLUMN suspension_end TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'suspended_by') THEN
        ALTER TABLE artists ADD COLUMN suspended_by UUID REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'risk_score') THEN
        ALTER TABLE artists ADD COLUMN risk_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'last_login') THEN
        ALTER TABLE artists ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'login_count') THEN
        ALTER TABLE artists ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'profile_completion_score') THEN
        ALTER TABLE artists ADD COLUMN profile_completion_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'featured') THEN
        ALTER TABLE artists ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'featured_until') THEN
        ALTER TABLE artists ADD COLUMN featured_until TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'admin_notes') THEN
        ALTER TABLE artists ADD COLUMN admin_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'verification_notes') THEN
        ALTER TABLE artists ADD COLUMN verification_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'override_availability') THEN
        ALTER TABLE artists ADD COLUMN override_availability BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'admin_override_price_min') THEN
        ALTER TABLE artists ADD COLUMN admin_override_price_min INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'admin_override_price_max') THEN
        ALTER TABLE artists ADD COLUMN admin_override_price_max INTEGER;
    END IF;
END $$;

-- 8. Enhance bookings table with admin management fields (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'admin_notes') THEN
            ALTER TABLE bookings ADD COLUMN admin_notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'escalated') THEN
            ALTER TABLE bookings ADD COLUMN escalated BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'escalated_by') THEN
            ALTER TABLE bookings ADD COLUMN escalated_by UUID REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'escalated_at') THEN
            ALTER TABLE bookings ADD COLUMN escalated_at TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'resolved_by') THEN
            ALTER TABLE bookings ADD COLUMN resolved_by UUID REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'resolved_at') THEN
            ALTER TABLE bookings ADD COLUMN resolved_at TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'priority') THEN
            ALTER TABLE bookings ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        END IF;
    END IF;
END $$;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_risk_flags_user ON risk_flags(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_resolved ON risk_flags(resolved);

CREATE INDEX IF NOT EXISTS idx_artist_performance_metrics_artist_id ON artist_performance_metrics(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_performance_metrics_date ON artist_performance_metrics(metric_date);

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'booking_status_history') THEN
        CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_risk_score ON users(risk_score);

CREATE INDEX IF NOT EXISTS idx_artists_account_status ON artists(account_status);
CREATE INDEX IF NOT EXISTS idx_artists_risk_score ON artists(risk_score);
CREATE INDEX IF NOT EXISTS idx_artists_featured ON artists(featured);

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_escalated ON bookings(escalated);
        CREATE INDEX IF NOT EXISTS idx_bookings_priority ON bookings(priority);
    END IF;
END $$;

-- 10. Create functions for automatic risk scoring (UUID compatible)
CREATE OR REPLACE FUNCTION update_user_risk_score(user_id_param UUID, user_type_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    flag_count INTEGER;
    recent_activity_count INTEGER;
BEGIN
    -- Count unresolved risk flags
    SELECT COUNT(*) INTO flag_count
    FROM risk_flags 
    WHERE user_id = user_id_param 
    AND user_type = user_type_param 
    AND resolved = false;
    
    -- Add risk based on flags
    risk_score := risk_score + (flag_count * 20);
    
    -- Check for suspicious recent activity
    SELECT COUNT(*) INTO recent_activity_count
    FROM activity_log 
    WHERE user_id = user_id_param 
    AND user_type = user_type_param 
    AND created_at > NOW() - INTERVAL '24 hours'
    AND activity_type IN ('login', 'profile_edit');
    
    -- Add risk for excessive activity
    IF recent_activity_count > 50 THEN
        risk_score := risk_score + 30;
    ELSIF recent_activity_count > 20 THEN
        risk_score := risk_score + 15;
    END IF;
    
    -- Cap risk score at 100
    IF risk_score > 100 THEN
        risk_score := 100;
    END IF;
    
    -- Update the risk score
    IF user_type_param = 'user' THEN
        UPDATE users SET risk_score = risk_score WHERE id = user_id_param;
    ELSE
        UPDATE artists SET risk_score = risk_score WHERE id = user_id_param;
    END IF;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for automatic activity logging (UUID compatible)
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log profile updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_log (user_type, user_id, activity_type, details)
        VALUES ('user', NEW.id, 'profile_edit', 
                jsonb_build_object('changed_fields', 
                    (SELECT jsonb_object_agg(key, value) 
                     FROM jsonb_each(to_jsonb(NEW)) 
                     WHERE value != (to_jsonb(OLD) -> key))));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create similar trigger for artists
CREATE OR REPLACE FUNCTION log_artist_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log profile updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_log (user_type, user_id, activity_type, details)
        VALUES ('artist', NEW.id, 'profile_edit', 
                jsonb_build_object('changed_fields', 
                    (SELECT jsonb_object_agg(key, value) 
                     FROM jsonb_each(to_jsonb(NEW)) 
                     WHERE value != (to_jsonb(OLD) -> key))));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop existing ones first)
DROP TRIGGER IF EXISTS user_activity_trigger ON users;
CREATE TRIGGER user_activity_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

DROP TRIGGER IF EXISTS artist_activity_trigger ON artists;
CREATE TRIGGER artist_activity_trigger
    AFTER UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION log_artist_activity();

-- Add comments
COMMENT ON TABLE admin_audit_log IS 'Tracks all admin actions for accountability';
COMMENT ON TABLE activity_log IS 'Tracks user and artist activities for monitoring';
COMMENT ON TABLE risk_flags IS 'Flags suspicious activities and users for admin review';
COMMENT ON TABLE artist_performance_metrics IS 'Stores daily performance metrics for artists';