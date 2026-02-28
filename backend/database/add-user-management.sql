-- Add user management fields to users table

-- Add account status and suspension fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'terminated'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP;

-- Add same fields to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'terminated'));
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_start TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS suspended_by VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_type VARCHAR(20) CHECK (user_type IN ('user', 'artist')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('info', 'warning', 'success', 'error', 'account_status')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_artists_account_status ON artists(account_status);

-- Update existing users to have active status
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;
UPDATE artists SET account_status = 'active' WHERE account_status IS NULL;
