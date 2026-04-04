import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import ArtistProfile from './pages/ArtistProfile';
import BookingSuccess from './pages/BookingSuccess';
import Wishlist from './pages/Wishlist';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import AccountBlocked from './components/AccountBlocked';
import AccountReactivated from './components/AccountReactivated';
import ProtectedRoute, { PublicOnlyRoute, UserFacingRoute } from './components/ProtectedRoute';
import { getCurrentRole } from './hooks/useAuth';
import api from './config/api';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import About from './pages/About';
import FAQ from './pages/FAQ';

function AccountStatusChecker() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const excludedPaths = [
      '/user/login', '/user/register',
      '/account-blocked', '/account-reactivated', '/'
    ];
    if (excludedPaths.some(path => location.pathname.startsWith(path))) return;

    const checkAccountStatus = async () => {
      try {
        const currentRole = getCurrentRole();
        if (currentRole !== 'user') return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.id) return;
        const { data } = await api.get(`/api/user-management/check-status/user/${userInfo.id}`);
        if (data.account_status === 'suspended' || data.account_status === 'terminated') {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          navigate('/account-blocked', { state: { status: data.account_status, reason: data.suspension_reason, suspensionEnd: data.suspension_end }, replace: true });
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
    <HelmetProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <AccountStatusChecker />
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* ── USER-FACING PUBLIC ROUTES (artists blocked → redirect to /artist/dashboard) ── */}
            <Route path="/" element={<UserFacingRoute><Home /></UserFacingRoute>} />
            <Route path="/search" element={<UserFacingRoute><Search /></UserFacingRoute>} />
            <Route path="/artist/:identifier" element={<UserFacingRoute><ArtistProfile /></UserFacingRoute>} />

            {/* ── TRULY PUBLIC ROUTES (anyone can access) ── */}
            <Route path="/account-blocked" element={<AccountBlocked />} />
            <Route path="/account-reactivated" element={<AccountReactivated />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            {/* ── AUTH ROUTES (redirect to dashboard if already logged in) ── */}
            <Route path="/user/login" element={<PublicOnlyRoute><UserLogin /></PublicOnlyRoute>} />
            <Route path="/user/register" element={<PublicOnlyRoute><UserRegister /></PublicOnlyRoute>} />

            {/* ── USER-ONLY PROTECTED ROUTES ── */}
            <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/booking-success" element={<ProtectedRoute requiredRole="user"><BookingSuccess /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute requiredRole="user"><Wishlist /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-gray-500 mb-6">Page not found</p>
                  <a href="/" className="text-primary hover:underline">Return to Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;


