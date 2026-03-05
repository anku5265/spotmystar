import { Navigate, useLocation } from 'react-router-dom';
import { validateRoleAccess, getCurrentRole } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  
  // Validate role access
  const validation = validateRoleAccess(requiredRole);
  
  if (!validation.hasAccess) {
    const currentRole = getCurrentRole();
    
    // Not authenticated at all
    if (validation.reason === 'NOT_AUTHENTICATED') {
      return (
        <Navigate 
          to="/" 
          state={{ 
            from: location, 
            message: 'Please login to access this page',
            type: 'warning'
          }} 
          replace 
        />
      );
    }
    
    // Wrong role - strict redirection
    if (validation.reason === 'ROLE_MISMATCH') {
      console.warn(`Role violation: ${currentRole} attempted to access ${requiredRole}-only route ${location.pathname}`);
      
      // Clear any potential cross-contamination
      if (currentRole === 'user' && requiredRole === 'artist') {
        return (
          <Navigate 
            to="/user/dashboard" 
            state={{ 
              message: 'Access denied. This area is exclusively for artists.',
              type: 'error',
              attemptedAccess: location.pathname
            }} 
            replace 
          />
        );
      } else if (currentRole === 'artist' && requiredRole === 'user') {
        return (
          <Navigate 
            to="/artist/dashboard" 
            state={{ 
              message: 'Access denied. This area is exclusively for users.',
              type: 'error',
              attemptedAccess: location.pathname
            }} 
            replace 
          />
        );
      } else {
        // Unknown role combination - force logout
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('artistToken');
        localStorage.removeItem('artistData');
        
        return (
          <Navigate 
            to="/" 
            state={{ 
              message: 'Session invalid. Please login again.',
              type: 'error'
            }} 
            replace 
          />
        );
      }
    }
  }
  
  // Access granted
  return children;
}

// Higher-order component for strict role enforcement
export function withRoleProtection(Component, requiredRole) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Component to block access entirely if wrong role
export function RoleBlocker({ allowedRole, children, fallback = null }) {
  const currentRole = getCurrentRole();
  
  if (currentRole !== allowedRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This area is restricted to {allowedRole}s only.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {currentRole || 'Not authenticated'}
          </p>
        </div>
      </div>
    );
  }
  
  return children;
}
