-- Fix: Add is_available column to artists table
-- Run this in Supabase SQL Editor if column doesn't exist

ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Set all existing artists as available by default
UPDATE artists SET is_available = true WHERE is_available IS NULL;

-- Add index for faster availability queries
CREATE INDEX IF NOT EXISTS idx_artists_availability ON artists(is_available);
