-- ============================================
-- ROLES & PERMISSIONS SYSTEM
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS + ON CONFLICT)
-- ============================================

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('user',   'Regular user who books artists'),
  ('artist', 'Performer who receives bookings'),
  ('admin',  'Platform administrator')
ON CONFLICT (name) DO NOTHING;

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert permissions
INSERT INTO permissions (name, description) VALUES
  ('view_home',             'View home/search page'),
  ('book_artist',           'Book an artist'),
  ('manage_wishlist',       'Manage wishlist'),
  ('view_user_dashboard',   'View user dashboard'),
  ('manage_bookings',       'Manage own booking requests'),
  ('manage_profile',        'Edit own artist profile'),
  ('view_analytics',        'View own analytics'),
  ('manage_content',        'Upload/manage content/reels'),
  ('manage_schedule',       'Manage availability calendar'),
  ('view_artist_dashboard', 'Access artist dashboard'),
  ('manage_users',          'Admin: manage all users'),
  ('manage_artists',        'Admin: manage all artists'),
  ('view_admin_dashboard',  'Access admin dashboard'),
  ('manage_categories',     'Admin: manage categories'),
  ('view_reports',          'Admin: view platform reports')
ON CONFLICT (name) DO NOTHING;

-- 3. Role-Permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- Assign permissions to USER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user'
  AND p.name IN ('view_home', 'book_artist', 'manage_wishlist', 'view_user_dashboard')
ON CONFLICT DO NOTHING;

-- Assign permissions to ARTIST role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'artist'
  AND p.name IN ('view_artist_dashboard', 'manage_bookings', 'manage_profile', 'view_analytics', 'manage_content', 'manage_schedule')
ON CONFLICT DO NOTHING;

-- Assign permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name IN ('view_admin_dashboard', 'manage_users', 'manage_artists', 'manage_categories', 'view_reports', 'view_home', 'view_analytics')
ON CONFLICT DO NOTHING;

-- 4. Routes config table (optional - for future dynamic routing)
CREATE TABLE IF NOT EXISTS routes_config (
  id SERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  redirect_path VARCHAR(255),
  is_protected BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO routes_config (path, role_name, redirect_path, is_protected, description) VALUES
  ('/dashboard',  'artist', '/login',   true,  'Artist dashboard'),
  ('/login',      'artist', '/dashboard', false, 'Artist login'),
  ('/register',   'artist', '/dashboard', false, 'Artist register'),
  ('/user/dashboard', 'user', '/user/login', true, 'User dashboard'),
  ('/user/login', 'user', '/user/dashboard', false, 'User login'),
  ('/advanced',   'admin', '/login',    true,  'Admin dashboard'),
  ('/',           'admin', '/advanced', false, 'Admin login')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY: Check what was created
-- ============================================
SELECT 'roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'routes_config', COUNT(*) FROM routes_config;
