import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  
  // Check for user token
  const userToken = localStorage.getItem('userToken');
  const userInfo = userToken ? JSON.parse(localStorage.getItem('userInfo') || '{}') : null;
  
  // Check for artist token
  const artistToken = localStorage.getItem('artistToken');
  const artistData = artistToken ? JSON.parse(localStorage.getItem('artistData') || '{}') : null;
  
  // Determine current role
  let currentRole = null;
  if (userToken && userInfo) {
    currentRole = 'user';
  } else if (artistToken && artistData) {
    currentRole = 'artist';
  }
  
  // Not logged in at all
  if (!currentRole) {
    return <Navigate to="/" state={{ from: location, message: 'Please login to access this page' }} replace />;
  }
  
  // Check role match
  if (requiredRole && currentRole !== requiredRole) {
    // Wrong role - redirect to appropriate dashboard
    if (currentRole === 'user') {
      return <Navigate to="/user/dashboard" state={{ message: 'Access denied. Artists only.' }} replace />;
    } else if (currentRole === 'artist') {
      return <Navigate to="/artist/dashboard" state={{ message: 'Access denied. Users only.' }} replace />;
    }
  }
  
  return children;
}
