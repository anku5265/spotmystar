-- Unique ID system for Users, Artists, Bookings
-- Safe to run multiple times (IF NOT EXISTS everywhere)

-- Artists: 4-digit code (1000-9999), displayed as A1234
ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_code INTEGER UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_artists_artist_code ON artists(artist_code);

-- Users: 4-digit code (1000-9999), displayed as U1234
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_code INTEGER UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);

-- Bookings: 8-digit code (10000001-99999999), displayed as B10000001
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_code BIGINT UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);

-- Backfill existing artists (assign codes to existing rows)
DO $$
DECLARE
  r RECORD;
  new_code INTEGER;
  attempts INTEGER;
BEGIN
  FOR r IN SELECT id FROM artists WHERE artist_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := floor(1000 + random() * 9000)::INTEGER;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM artists WHERE artist_code = new_code);
      attempts := attempts + 1;
      IF attempts > 100 THEN new_code := floor(10000 + random() * 90000)::INTEGER; END IF;
    END LOOP;
    UPDATE artists SET artist_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill existing users
DO $$
DECLARE
  r RECORD;
  new_code INTEGER;
  attempts INTEGER;
BEGIN
  FOR r IN SELECT id FROM users WHERE user_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := floor(1000 + random() * 9000)::INTEGER;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE user_code = new_code);
      attempts := attempts + 1;
      IF attempts > 100 THEN new_code := floor(10000 + random() * 90000)::INTEGER; END IF;
    END LOOP;
    UPDATE users SET user_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill existing bookings
DO $$
DECLARE
  r RECORD;
  new_code BIGINT;
BEGIN
  FOR r IN SELECT id FROM bookings WHERE booking_code IS NULL LOOP
    LOOP
      new_code := floor(10000001 + random() * 89999998)::BIGINT;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE booking_code = new_code);
    END LOOP;
    UPDATE bookings SET booking_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

-- Verify
SELECT 'artists' as tbl, COUNT(*) as total, COUNT(artist_code) as with_code FROM artists
UNION ALL
SELECT 'users', COUNT(*), COUNT(user_code) FROM users
UNION ALL
SELECT 'bookings', COUNT(*), COUNT(booking_code) FROM bookings;
