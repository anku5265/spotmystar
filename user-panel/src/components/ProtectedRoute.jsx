import { Navigate, useLocation } from 'react-router-dom';
import { validateRoleAccess, getCurrentRole } from '../hooks/useAuth';

// Protects routes that require a specific role
export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const validation = validateRoleAccess(requiredRole);

  if (!validation.hasAccess) {
    const currentRole = getCurrentRole();

    if (validation.reason === 'NOT_AUTHENTICATED') {
      return <Navigate to="/" state={{ from: location, message: 'Please login to access this page', type: 'warning' }} replace />;
    }

    if (validation.reason === 'ROLE_MISMATCH') {
      if (currentRole === 'user') {
        return <Navigate to="/user/dashboard" state={{ message: 'Access denied. This area is for artists only.', type: 'error' }} replace />;
      } else if (currentRole === 'artist') {
        return <Navigate to="/artist/dashboard" state={{ message: 'Access denied. This area is for users only.', type: 'error' }} replace />;
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('artistToken');
        localStorage.removeItem('artistData');
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
}

// Wraps public-only routes (login, register) - redirects logged-in users to their dashboard
export function PublicOnlyRoute({ children }) {
  const currentRole = getCurrentRole();
  if (currentRole === 'user') return <Navigate to="/user/dashboard" replace />;
  // Artist should be on artist-panel, clear stale token
  if (currentRole === 'artist') {
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
  }
  return children;
}

// Wraps user-facing public pages (Home, Search, ArtistProfile)
// Artists are blocked and redirected to their dashboard
// Unauthenticated users can still access these pages
export function UserFacingRoute({ children }) {
  const currentRole = getCurrentRole();
  if (currentRole === 'artist') {
    // Artist should not be on user frontend - clear stale token and show page
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
  }
  return children;
}
