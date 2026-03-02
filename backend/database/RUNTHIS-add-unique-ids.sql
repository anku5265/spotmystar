-- ============================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- This will add unique ID columns for Users, Artists, and Bookings
-- ============================================

-- Step 1: Add user_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(4) UNIQUE;

-- Step 2: Add artist_id column to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS artist_id VARCHAR(5) UNIQUE;

-- Step 3: Add booking_id column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_id VARCHAR(7) UNIQUE;

-- Step 4: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_artist_id ON artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN users.user_id IS '4-digit unique numeric identifier for users (1000-9999)';
COMMENT ON COLUMN artists.artist_id IS '5-digit unique numeric identifier for artists (10000-99999)';
COMMENT ON COLUMN bookings.booking_id IS '7-character unique alphanumeric identifier for bookings (BK + 5 chars)';

-- ============================================
-- DONE! Now the system will automatically generate IDs for:
-- - New user registrations
-- - New artist registrations  
-- - New booking creations
-- ============================================
