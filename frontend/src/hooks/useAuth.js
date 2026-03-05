import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (requiredRole = null) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    validateAuth();
  }, []);

  const validateAuth = () => {
    try {
      // Check for user token
      const userToken = localStorage.getItem('userToken');
      const userInfo = localStorage.getItem('userInfo');
      
      // Check for artist token
      const artistToken = localStorage.getItem('artistToken');
      const artistData = localStorage.getItem('artistData');
      
      let currentRole = null;
      let currentUser = null;
      let hasValidToken = false;
      
      if (userToken && userInfo) {
        try {
          currentRole = 'user';
          currentUser = JSON.parse(userInfo);
          hasValidToken = true;
        } catch (e) {
          // Invalid JSON, clear storage
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
        }
      } else if (artistToken && artistData) {
        try {
          currentRole = 'artist';
          currentUser = JSON.parse(artistData);
          hasValidToken = true;
        } catch (e) {
          // Invalid JSON, clear storage
          localStorage.removeItem('artistToken');
          localStorage.removeItem('artistData');
        }
      }
      
      // If no valid authentication found and role is required
      if (!hasValidToken && requiredRole) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        setIsLoading(false);
        navigate('/', { replace: true, state: { message: 'Please login to continue' } });
        return;
      }
      
      // If role doesn't match required role - STRICT ENFORCEMENT
      if (requiredRole && currentRole !== requiredRole) {
        setIsAuthenticated(false);
        setUserRole(currentRole);
        setUser(currentUser);
        setIsLoading(false);
        
        // Clear tokens to prevent any cross-role access
        if (currentRole === 'user' && requiredRole === 'artist') {
          console.warn('User attempted to access artist-only area');
          navigate('/user/dashboard', { 
            replace: true, 
            state: { 
              message: 'Access denied. This area is for artists only.',
              type: 'error'
            } 
          });
        } else if (currentRole === 'artist' && requiredRole === 'user') {
          console.warn('Artist attempted to access user-only area');
          navigate('/artist/dashboard', { 
            replace: true, 
            state: { 
              message: 'Access denied. This area is for users only.',
              type: 'error'
            } 
          });
        } else {
          // Unknown role combination
          navigate('/', { 
            replace: true, 
            state: { 
              message: 'Access denied. Please login with appropriate credentials.',
              type: 'error'
            } 
          });
        }
        return;
      }
      
      // All checks passed
      setIsAuthenticated(hasValidToken);
      setUserRole(currentRole);
      setUser(currentUser);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth validation error:', error);
      // Clear all auth data on error
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');
      
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
      setIsLoading(false);
      
      if (requiredRole) {
        navigate('/', { replace: true });
      }
    }
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    
    navigate('/', { replace: true, state: { message: 'Logged out successfully' } });
  };

  const switchRole = (targetRole) => {
    // Force logout and redirect to appropriate login
    logout();
    if (targetRole === 'user') {
      navigate('/user/login');
    } else if (targetRole === 'artist') {
      navigate('/artist/login');
    }
  };

  return {
    isAuthenticated,
    userRole,
    user,
    isLoading,
    logout,
    switchRole,
    revalidate: validateAuth
  };
};

// Helper function to check if user is logged in (any role)
export const isLoggedIn = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  return !!(userToken || artistToken);
};

// Helper function to get current role
export const getCurrentRole = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  
  if (userToken) return 'user';
  if (artistToken) return 'artist';
  return null;
};

// Helper function to check specific role
export const hasRole = (role) => {
  return getCurrentRole() === role;
};

// Helper function to get auth token for API calls
export const getAuthToken = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  return userToken || artistToken || null;
};

// Helper function to get auth headers for API calls
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Strict role validation for components
export const validateRoleAccess = (requiredRole) => {
  const currentRole = getCurrentRole();
  
  if (!currentRole) {
    return { hasAccess: false, reason: 'NOT_AUTHENTICATED' };
  }
  
  if (currentRole !== requiredRole) {
    return { 
      hasAccess: false, 
      reason: 'ROLE_MISMATCH',
      currentRole,
      requiredRole
    };
  }
  
  return { hasAccess: true };
};
