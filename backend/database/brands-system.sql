-- Brand/Company System
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS brand_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  instagram VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brand_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  category VARCHAR(100) NOT NULL,
  event_date DATE,
  event_time VARCHAR(20),
  location VARCHAR(255),
  budget_range VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'not_interested')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requirement_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_requirements_brand ON requirements(brand_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_category ON requirements(category);
CREATE INDEX IF NOT EXISTS idx_artist_responses_req ON artist_responses(requirement_id);
CREATE INDEX IF NOT EXISTS idx_artist_responses_artist ON artist_responses(artist_id);
