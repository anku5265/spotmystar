-- Add counter_price column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS counter_price INTEGER;

-- Add event_type column (used in some queries)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);

-- Verify
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
