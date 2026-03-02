-- Add availability column to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_artists_availability ON artists(is_available);

-- Update existing artists to be available by default
UPDATE artists SET is_available = true WHERE is_available IS NULL;
