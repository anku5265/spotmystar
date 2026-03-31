import jwt from 'jsonwebtoken';

// Verify JWT token
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

    // Attach user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role
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

// Check if user has specific role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

// Middleware specifically for user-only routes
export const requireUser = (req, res, next) => {
  return requireRole('user')(req, res, next);
};

// Middleware specifically for artist-only routes
export const requireArtist = (req, res, next) => {
  return requireRole('artist')(req, res, next);
};

// Middleware for admin-only routes
export const requireAdmin = (req, res, next) => {
  return requireRole('admin')(req, res, next);
};

// Middleware for brand-only routes
export const requireBrand = (req, res, next) => {
  return requireRole('brand')(req, res, next);
};
