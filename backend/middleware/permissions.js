import pool from '../config/db.js';

// Cache permissions in memory to avoid DB hit on every request
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedPermissions = async (roleName) => {
  const cached = permissionCache.get(roleName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }

  try {
    const result = await pool.query(
      `SELECT p.name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.name = $1`,
      [roleName]
    );
    const permissions = result.rows.map(r => r.name);
    permissionCache.set(roleName, { permissions, timestamp: Date.now() });
    return permissions;
  } catch {
    // If roles table doesn't exist yet, fall back to hardcoded
    return getDefaultPermissions(roleName);
  }
};

const getDefaultPermissions = (role) => {
  const defaults = {
    user:   ['view_home', 'book_artist', 'manage_wishlist', 'view_user_dashboard'],
    artist: ['view_artist_dashboard', 'manage_bookings', 'manage_profile', 'view_analytics', 'manage_content', 'manage_schedule'],
    admin:  ['view_admin_dashboard', 'manage_users', 'manage_artists', 'manage_categories', 'view_reports'],
  };
  return defaults[role] || [];
};

// Middleware: check if role has a specific permission
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ message: 'Authentication required' });

      const permissions = await getCachedPermissions(role);
      if (!permissions.includes(permissionName)) {
        return res.status(403).json({
          message: `Access denied. Required permission: ${permissionName}`,
          code: 'INSUFFICIENT_PERMISSION'
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

// API: get permissions for a role (used by frontend)
export const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const permissions = await getCachedPermissions(role);
    res.json({ role, permissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API: get all roles
export const getAllRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM roles ORDER BY id');
    res.json(result.rows);
  } catch {
    res.json([{ id: 1, name: 'user' }, { id: 2, name: 'artist' }, { id: 3, name: 'admin' }]);
  }
};

// API: get routes config
export const getRoutesConfig = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM routes_config';
    const params = [];
    if (role) { query += ' WHERE role_name = $1'; params.push(role); }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.json([]);
  }
};
