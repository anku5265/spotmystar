import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const useAuth = (requiredRole = 'artist') => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const validateAuth = useCallback(() => {
    try {
      const artistToken = localStorage.getItem('artistToken');
      const artistData = localStorage.getItem('artistData');

      if (artistToken && artistData) {
        if (isTokenExpired(artistToken)) {
          localStorage.removeItem('artistToken');
          localStorage.removeItem('artistData');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          navigate('/login', { replace: true });
          return;
        }
        try {
          setIsAuthenticated(true);
          setUser(JSON.parse(artistData));
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem('artistToken');
          localStorage.removeItem('artistData');
        }
      }

      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      if (requiredRole) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Auth validation error:', error);
      localStorage.removeItem('artistToken');
      localStorage.removeItem('artistData');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      navigate('/login', { replace: true });
    }
  }, [requiredRole, navigate]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  return { isAuthenticated, user, isLoading, logout, revalidate: validateAuth };
};

export const isLoggedIn = () => {
  const artistToken = localStorage.getItem('artistToken');
  return !!(artistToken && !isTokenExpired(artistToken));
};

export const getArtistToken = () => {
  const artistToken = localStorage.getItem('artistToken');
  if (artistToken && !isTokenExpired(artistToken)) return artistToken;
  return null;
};
