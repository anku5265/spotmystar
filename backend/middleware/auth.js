import jwt from 'jsonwebtoken';

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check if user has specific role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        requiredRole: allowedRoles,
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
