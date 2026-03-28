import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../hooks/useAuth';

// Fetches redirect path from routes_config if available, else uses default
const getRedirectPath = async (path) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/permissions/routes?role=artist`);
    const routes = await res.json();
    const match = routes.find(r => r.path === path);
    return match?.redirect_path || '/login';
  } catch {
    return '/login';
  }
};

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function PublicOnlyRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
