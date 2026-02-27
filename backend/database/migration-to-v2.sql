-- Migration from schema v1 to v2 (Multi-Category System)
-- This migration adds new tables and columns without dropping existing data

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADD NEW COLUMNS TO CATEGORIES TABLE
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_group VARCHAR(50);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing categories with slugs and groups
UPDATE categories SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
UPDATE categories SET category_group = 'performing_artists' WHERE name IN ('DJ', 'Singer', 'Anchor', 'Band', 'Dancer', 'Comedian');
UPDATE categories SET display_order = 
  CASE name
    WHEN 'DJ' THEN 1
    WHEN 'Singer' THEN 2
    WHEN 'Anchor' THEN 3
    WHEN 'Band' THEN 4
    WHEN 'Dancer' THEN 5
    WHEN 'Comedian' THEN 6
    ELSE 99
  END
WHERE display_order = 0;

-- Add unique constraint on slug
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key') THEN
    ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ============================================
-- 2. ADD NEW COLUMNS TO ARTISTS TABLE
-- ============================================
ALTER TABLE artists ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS portfolio_videos TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS short_bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS primary_city VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS service_locations TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(50) DEFAULT 'per_event';
ALTER TABLE artists ADD COLUMN IF NOT EXISTS availability TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS youtube VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS facebook VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS twitter VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS linkedin VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE;

-- Migrate existing data
UPDATE artists SET phone = whatsapp WHERE phone IS NULL AND whatsapp IS NOT NULL;
UPDATE artists SET primary_city = city WHERE primary_city IS NULL AND city IS NOT NULL;
UPDATE artists SET short_bio = bio WHERE short_bio IS NULL AND bio IS NOT NULL;
UPDATE artists SET detailed_description = bio WHERE detailed_description IS NULL AND bio IS NOT NULL;

-- Drop old status check constraint first
ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_status_check;

-- Update ALL possible status values to match new schema
UPDATE artists SET status = 'submitted' WHERE status = 'pending';
UPDATE artists SET status = 'approved' WHERE status = 'active';
UPDATE artists SET status = 'inactive' WHERE status NOT IN ('draft', 'submitted', 'pending', 'approved', 'rejected', 'suspended', 'inactive');

-- Add new status check constraint
ALTER TABLE artists ADD CONSTRAINT artists_status_check 
  CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'rejected', 'suspended', 'inactive'));

-- Add pricing model check constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'artists_pricing_model_check') THEN
    ALTER TABLE artists ADD CONSTRAINT artists_pricing_model_check 
      CHECK (pricing_model IN ('per_hour', 'per_event', 'per_day', 'custom'));
  END IF;
END $$;

-- ============================================
-- 3. CREATE NEW TABLES
-- ============================================

-- Category Attributes Table
CREATE TABLE IF NOT EXISTS category_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  attribute_name VARCHAR(100) NOT NULL,
  attribute_label VARCHAR(100) NOT NULL,
  attribute_type VARCHAR(50) CHECK (attribute_type IN ('text', 'number', 'select', 'multiselect', 'textarea', 'url', 'email', 'phone')),
  is_required BOOLEAN DEFAULT FALSE,
  options TEXT[],
  placeholder TEXT,
  help_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, attribute_name)
);

-- Artist Categories (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS artist_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(artist_id, category_id)
);

-- Artist Attribute Values (Dynamic Data Storage)
CREATE TABLE IF NOT EXISTS artist_attribute_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  attribute_id UUID REFERENCES category_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(artist_id, attribute_id)
);

-- Migrate existing artist-category relationships
INSERT INTO artist_categories (artist_id, category_id, is_primary)
SELECT id, category_id, true
FROM artists
WHERE category_id IS NOT NULL
ON CONFLICT (artist_id, category_id) DO NOTHING;

-- ============================================
-- 4. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_artists_primary_city ON artists(primary_city);
CREATE INDEX IF NOT EXISTS idx_artist_categories_artist ON artist_categories(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_categories_category ON artist_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_artist_attribute_values_artist ON artist_attribute_values(artist_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_group ON categories(category_group);

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_category_attributes_updated_at') THEN
    CREATE TRIGGER update_category_attributes_updated_at BEFORE UPDATE ON category_attributes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_artist_attribute_values_updated_at') THEN
    CREATE TRIGGER update_artist_attribute_values_updated_at BEFORE UPDATE ON artist_attribute_values
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- 6. SEED NEW CATEGORIES
-- ============================================

-- Add new categories if they don't exist
INSERT INTO categories (name, slug, icon, description, category_group, display_order) VALUES
  ('Photographer', 'photographer', '📷', 'Professional photographers', 'creative_professionals', 7),
  ('Videographer', 'videographer', '🎥', 'Video production specialists', 'creative_professionals', 8),
  ('Makeup Artist', 'makeup-artist', '💄', 'Professional makeup artists', 'creative_professionals', 9),
  ('Choreographer', 'choreographer', '🕺', 'Dance choreographers', 'creative_professionals', 10),
  ('Instagram Influencer', 'instagram-influencer', '📸', 'Instagram content creators', 'influencers_creators', 11),
  ('YouTube Creator', 'youtube-creator', '🎬', 'YouTube content creators', 'influencers_creators', 12),
  ('Content Creator', 'content-creator', '✍️', 'Multi-platform content creators', 'influencers_creators', 13),
  ('Podcaster', 'podcaster', '🎙️', 'Podcast hosts and producers', 'influencers_creators', 14),
  ('UGC Creator', 'ugc-creator', '📱', 'User-generated content creators', 'influencers_creators', 15),
  ('Blogger', 'blogger', '📝', 'Blog writers and influencers', 'influencers_creators', 16)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. SEED SAMPLE CATEGORY ATTRIBUTES
-- ============================================

-- DJ Attributes
INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, options, placeholder) 
SELECT id, 'genres', 'Music Genres', 'multiselect', true, 
  ARRAY['Bollywood', 'EDM', 'Hip Hop', 'House', 'Techno', 'Commercial', 'Retro', 'Punjabi'], 
  'Select genres you specialize in'
FROM categories WHERE slug = 'dj'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'equipment_included', 'Equipment Included', 'textarea', false, 
  'List equipment you provide (speakers, lights, etc.)'
FROM categories WHERE slug = 'dj'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- Singer Attributes
INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, options) 
SELECT id, 'vocal_type', 'Vocal Type', 'select', true, 
  ARRAY['Male', 'Female', 'Both']
FROM categories WHERE slug = 'singer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, options) 
SELECT id, 'instrument_skills', 'Instrument Skills', 'multiselect', false, 
  ARRAY['Guitar', 'Piano', 'Harmonium', 'Tabla', 'Drums', 'Flute']
FROM categories WHERE slug = 'singer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- Instagram Influencer Attributes
INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'follower_count', 'Follower Count', 'number', true, 
  'e.g., 50000'
FROM categories WHERE slug = 'instagram-influencer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'engagement_rate', 'Engagement Rate (%)', 'number', true, 
  'e.g., 5.5'
FROM categories WHERE slug = 'instagram-influencer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, options) 
SELECT id, 'niche', 'Content Niche', 'multiselect', true, 
  ARRAY['Fashion', 'Lifestyle', 'Travel', 'Food', 'Fitness', 'Tech', 'Beauty', 'Entertainment']
FROM categories WHERE slug = 'instagram-influencer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'profile_url', 'Instagram Profile URL', 'url', true, 
  'https://instagram.com/username'
FROM categories WHERE slug = 'instagram-influencer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- YouTube Creator Attributes
INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'channel_name', 'Channel Name', 'text', true, 
  'Your YouTube channel name'
FROM categories WHERE slug = 'youtube-creator'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'subscribers_count', 'Subscribers Count', 'number', true, 
  'e.g., 100000'
FROM categories WHERE slug = 'youtube-creator'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- Photographer Attributes
INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, options) 
SELECT id, 'camera_type', 'Camera Type', 'select', true, 
  ARRAY['DSLR', 'Mirrorless', 'Medium Format', 'Film']
FROM categories WHERE slug = 'photographer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_attributes (category_id, attribute_name, attribute_label, attribute_type, is_required, placeholder) 
SELECT id, 'delivery_timeline', 'Delivery Timeline (days)', 'number', true, 
  'e.g., 7'
FROM categories WHERE slug = 'photographer'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
