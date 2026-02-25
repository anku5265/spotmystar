-- SpotMyStar - Artist Discovery Platform - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Artists Table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  stage_name VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  bio TEXT,
  city VARCHAR(100) NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  instagram VARCHAR(100),
  profile_image TEXT DEFAULT 'https://via.placeholder.com/400',
  gallery TEXT[], -- Array of image URLs
  videos TEXT[], -- Array of video URLs
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  rating DECIMAL(2,1) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users Table (for admin and wishlist)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_location VARCHAR(255) NOT NULL,
  budget INTEGER NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist Table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, artist_id)
);

-- Indexes for better performance
CREATE INDEX idx_artists_city ON artists(city);
CREATE INDEX idx_artists_category ON artists(category_id);
CREATE INDEX idx_artists_status ON artists(status);
CREATE INDEX idx_artists_stage_name ON artists(stage_name);
CREATE INDEX idx_bookings_artist ON bookings(artist_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Insert default categories
INSERT INTO categories (name, icon, description) VALUES
  ('DJ', '🎧', 'Professional DJs for all events'),
  ('Anchor', '🎤', 'Event hosts and MCs'),
  ('Band', '🎸', 'Live music bands'),
  ('Singer', '🎵', 'Solo singers and vocalists'),
  ('Dancer', '💃', 'Dance performers'),
  ('Comedian', '😂', 'Stand-up comedians');

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, name, password, role) VALUES
  ('admin@spotmystar.com', 'Admin', '$2a$10$rKvVPZqGhf5vZ5qZ5qZ5qeX5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', 'admin');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
