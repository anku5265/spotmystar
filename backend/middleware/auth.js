import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Verify JWT token and load user data
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate token payload
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ 
        message: 'Invalid token payload',
        code: 'INVALID_TOKEN'
      });
    }

    // Verify user still exists and is active
    let userQuery, userTable;
    if (decoded.role === 'user') {
      userTable = 'users';
      userQuery = 'SELECT id, name, email, role, account_status FROM users WHERE id = $1 AND role = $2';
    } else if (decoded.role === 'artist') {
      userTable = 'artists';
      userQuery = 'SELECT id, full_name as name, email, account_status FROM artists WHERE id = $1';
    } else if (decoded.role === 'admin') {
      userTable = 'users';
      userQuery = 'SELECT id, name, email, role, account_status FROM users WHERE id = $1 AND role = $2';
    } else {
      return res.status(401).json({ 
        message: 'Invalid role in token',
        code: 'INVALID_ROLE'
      });
    }

    const userResult = await pool.query(
      userQuery, 
      decoded.role === 'artist' ? [decoded.id] : [decoded.id, decoded.role]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        message: 'User not found or role mismatch',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];

    // Check account status
    if (user.account_status && ['suspended', 'terminated', 'inactive'].includes(user.account_status)) {
      return res.status(403).json({ 
        message: `Account is ${user.account_status}`,
        code: 'ACCOUNT_SUSPENDED',
        accountStatus: user.account_status
      });
    }

    // Attach user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: user.name,
      email: user.email,
      accountStatus: user.account_status || 'active'
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(500).json({ 
      message: 'Token verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
};

// Strict role-based access control
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    // Ensure token verification happened first
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required - use verifyToken middleware first',
        code: 'NO_AUTH'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. This endpoint requires ${allowedRoles.join(' or ')} role. Your role: ${req.user.role}`,
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Combined middleware for user-only routes
export const requireUser = [verifyToken, requireRole('user')];

// Combined middleware for artist-only routes  
export const requireArtist = [verifyToken, requireRole('artist')];

// Combined middleware for admin-only routes
export const requireAdmin = [verifyToken, requireRole('admin')];

// Middleware for routes that accept multiple roles
export const requireUserOrArtist = [verifyToken, requireRole('user', 'artist')];

// Middleware to block cross-role access completely
export const strictRoleGuard = (allowedRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    if (req.user.role !== allowedRole) {
      // Log unauthorized access attempt
      console.warn(`Unauthorized access attempt: ${req.user.role} tried to access ${allowedRole}-only endpoint ${req.path}`);
      
      return res.status(403).json({ 
        message: `Strict access control: This endpoint is exclusively for ${allowedRole}s`,
        code: 'ROLE_VIOLATION',
        requiredRole: allowedRole,
        currentRole: req.user.role,
        endpoint: req.path
      });
    }

    next();
  };
};
