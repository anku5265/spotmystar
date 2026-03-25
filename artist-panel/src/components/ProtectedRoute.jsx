import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../hooks/useAuth';

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
