-- Add unique ID columns to users, artists, and bookings tables
-- User ID: 4-digit numeric
-- Artist ID: 5-digit numeric  
-- Booking ID: 7-character alphanumeric (BK + 5 chars)

-- Add user_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(4) UNIQUE;

-- Add artist_id column to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS artist_id VARCHAR(5) UNIQUE;

-- Add booking_id column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_id VARCHAR(7) UNIQUE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_artist_id ON artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);

-- Add comments for documentation
COMMENT ON COLUMN users.user_id IS '4-digit unique numeric identifier for users (1000-9999)';
COMMENT ON COLUMN artists.artist_id IS '5-digit unique numeric identifier for artists (10000-99999)';
COMMENT ON COLUMN bookings.booking_id IS '7-character unique alphanumeric identifier for bookings (BK + 5 chars)';
