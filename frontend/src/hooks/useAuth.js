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
      
      if (userToken && userInfo) {
        currentRole = 'user';
        currentUser = JSON.parse(userInfo);
      } else if (artistToken && artistData) {
        currentRole = 'artist';
        currentUser = JSON.parse(artistData);
      }
      
      // If no role found and role is required
      if (!currentRole && requiredRole) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
        setIsLoading(false);
        navigate('/', { replace: true, state: { message: 'Please login to continue' } });
        return;
      }
      
      // If role doesn't match required role
      if (requiredRole && currentRole !== requiredRole) {
        setIsAuthenticated(false);
        setUserRole(currentRole);
        setUser(currentUser);
        setIsLoading(false);
        
        // Redirect to appropriate dashboard
        if (currentRole === 'user') {
          navigate('/user/dashboard', { replace: true, state: { message: 'Access denied. Artists only.' } });
        } else if (currentRole === 'artist') {
          navigate('/artist/dashboard', { replace: true, state: { message: 'Access denied. Users only.' } });
        }
        return;
      }
      
      // All checks passed
      setIsAuthenticated(!!currentRole);
      setUserRole(currentRole);
      setUser(currentUser);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth validation error:', error);
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
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    navigate('/', { replace: true });
  };

  return {
    isAuthenticated,
    userRole,
    user,
    isLoading,
    logout,
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
