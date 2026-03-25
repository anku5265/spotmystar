import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AccountBlocked from './components/AccountBlocked.jsx';
import AccountReactivated from './components/AccountReactivated.jsx';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import { isLoggedIn } from './hooks/useAuth.js';
import api from './config/api.js';

function AccountStatusChecker() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const excludedPaths = ['/login', '/register', '/account-blocked', '/account-reactivated'];
    if (excludedPaths.some(path => location.pathname.startsWith(path))) return;

    const checkAccountStatus = async () => {
      try {
        if (!isLoggedIn()) return;
        const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
        if (!artistData.id) return;

        const { data } = await api.get(`/api/user-management/check-status/artist/${artistData.id}`);
        if (data.account_status === 'suspended' || data.account_status === 'terminated') {
          localStorage.removeItem('artistToken');
          localStorage.removeItem('artistData');
          navigate('/account-blocked', {
            state: { status: data.account_status, reason: data.suspension_reason, suspensionEnd: data.suspension_end },
            replace: true
          });
        }
      } catch {
        // Silent fail
      }
    };

    checkAccountStatus();
    const interval = setInterval(checkAccountStatus, 30000);
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AccountStatusChecker />
      <Routes>
        {/* Public only (redirect to dashboard if logged in) */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Truly public */}
        <Route path="/account-blocked" element={<AccountBlocked />} />
        <Route path="/account-reactivated" element={<AccountReactivated />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Default: redirect to login */}
        <Route path="/" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-gray-500 mb-6">Page not found</p>
              <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
