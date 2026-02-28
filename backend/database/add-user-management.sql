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

-- Create or update notifications table
DO $$
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE TABLE notifications (
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
  ELSE
    -- Add user_type column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_type') THEN
      ALTER TABLE notifications ADD COLUMN user_type VARCHAR(20) CHECK (user_type IN ('user', 'artist'));
    END IF;
  END IF;
END $$;

-- Create indexes
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_type') THEN
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
    END IF;
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_status') THEN
      CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'artists') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'account_status') THEN
      CREATE INDEX IF NOT EXISTS idx_artists_account_status ON artists(account_status);
    END IF;
  END IF;
END $$;

-- Update existing users to have active status
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;
UPDATE artists SET account_status = 'active' WHERE account_status IS NULL;
