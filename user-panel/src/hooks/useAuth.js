import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Decode JWT payload without verifying signature (client-side only)
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const useAuth = (requiredRole = null) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const validateAuth = useCallback(() => {
    try {
      const userToken = localStorage.getItem('userToken');
      const userInfo = localStorage.getItem('userInfo');
      const artistToken = localStorage.getItem('artistToken');
      const artistData = localStorage.getItem('artistData');

      let currentRole = null;
      let currentUser = null;
      let hasValidToken = false;

      if (userToken && userInfo) {
        if (isTokenExpired(userToken)) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
        } else {
          try {
            currentRole = 'user';
            currentUser = JSON.parse(userInfo);
            hasValidToken = true;
          } catch {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
          }
        }
      } else if (artistToken && artistData) {
        if (isTokenExpired(artistToken)) {
          localStorage.removeItem('artistToken');
          localStorage.removeItem('artistData');
        } else {
          try {
            currentRole = 'artist';
            currentUser = JSON.parse(artistData);
            hasValidToken = true;
          } catch {
            localStorage.removeItem('artistToken');
            localStorage.removeItem('artistData');
          }
        }
      }

      if (!hasValidToken && requiredRole) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        setIsLoading(false);
        navigate('/', { replace: true, state: { message: 'Please login to continue' } });
        return;
      }

      // Role mismatch - strict redirect
      if (requiredRole && currentRole !== requiredRole) {
        setIsAuthenticated(false);
        setUserRole(currentRole);
        setUser(currentUser);
        setIsLoading(false);

        if (currentRole === 'user') {
          navigate('/user/dashboard', { replace: true, state: { message: 'Access denied. This area is for artists only.', type: 'error' } });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

      setIsAuthenticated(hasValidToken);
      setUserRole(currentRole);
      setUser(currentUser);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth validation error:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
      setIsLoading(false);
      if (requiredRole) navigate('/', { replace: true });
    }
  }, [requiredRole, navigate]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    navigate('/', { replace: true, state: { message: 'Logged out successfully' } });
  }, [navigate]);

  const switchRole = useCallback((targetRole) => {
    logout();
    if (targetRole === 'user') navigate('/user/login');
    else if (targetRole === 'artist') navigate('/artist/login');
  }, [logout, navigate]);

  return { isAuthenticated, userRole, user, isLoading, logout, switchRole, revalidate: validateAuth };
};

// Helper: is anyone logged in (with expiry check)
export const isLoggedIn = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  if (userToken && !isTokenExpired(userToken)) return true;
  if (artistToken && !isTokenExpired(artistToken)) return true;
  return false;
};

// Helper: get current role (with expiry check)
export const getCurrentRole = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  if (userToken && !isTokenExpired(userToken)) return 'user';
  if (artistToken && !isTokenExpired(artistToken)) return 'artist';
  return null;
};

export const hasRole = (role) => getCurrentRole() === role;

export const getAuthToken = () => {
  const userToken = localStorage.getItem('userToken');
  const artistToken = localStorage.getItem('artistToken');
  if (userToken && !isTokenExpired(userToken)) return userToken;
  if (artistToken && !isTokenExpired(artistToken)) return artistToken;
  return null;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const validateRoleAccess = (requiredRole) => {
  const currentRole = getCurrentRole();
  if (!currentRole) return { hasAccess: false, reason: 'NOT_AUTHENTICATED' };
  if (currentRole !== requiredRole) return { hasAccess: false, reason: 'ROLE_MISMATCH', currentRole, requiredRole };
  return { hasAccess: true };
};
