import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import RoleBasedNavbar from './components/RoleBasedNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import ArtistProfile from './pages/ArtistProfile';
import BookingSuccess from './pages/BookingSuccess';
import Wishlist from './pages/Wishlist';
import ArtistRegisterNew from './pages/ArtistRegisterNew';
import ArtistLogin from './pages/ArtistLogin';
import ArtistDashboard from './pages/ArtistDashboard';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import AccountBlocked from './components/AccountBlocked';
import AccountReactivated from './components/AccountReactivated';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentRole } from './hooks/useAuth';
import api from './config/api';

function AccountStatusChecker() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't check on login/register/blocked pages
    const excludedPaths = ['/user/login', '/user/register', '/artist/login', '/artist/register', '/account-blocked', '/account-reactivated'];
    if (excludedPaths.some(path => location.pathname.startsWith(path))) {
      return;
    }

    const checkAccountStatus = async () => {
      try {
        const currentRole = getCurrentRole();
        
        if (currentRole === 'user') {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          if (userInfo.id) {
            const response = await api.get(`/api/user-management/check-status/user/${userInfo.id}`);
            const { account_status, suspension_reason, suspension_end } = response.data;
            
            if (account_status === 'suspended') {
              if (suspension_end && new Date(suspension_end) <= new Date()) {
                console.log('Suspension expired, continuing...');
                return;
              }
              
              localStorage.removeItem('userToken');
              localStorage.removeItem('userInfo');
              navigate('/account-blocked', {
                state: {
                  status: 'suspended',
                  reason: suspension_reason,
                  suspensionEnd: suspension_end
                },
                replace: true
              });
            } else if (account_status === 'terminated') {
              localStorage.removeItem('userToken');
              localStorage.removeItem('userInfo');
              navigate('/account-blocked', {
                state: {
                  status: 'terminated',
                  reason: suspension_reason
                },
                replace: true
              });
            }
          }
        } else if (currentRole === 'artist') {
          const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
          if (artistData.id) {
            const response = await api.get(`/api/user-management/check-status/artist/${artistData.id}`);
            const { account_status, suspension_reason, suspension_end } = response.data;
            
            if (account_status === 'suspended') {
              if (suspension_end && new Date(suspension_end) <= new Date()) {
                console.log('Suspension expired, continuing...');
                return;
              }
              
              localStorage.removeItem('artistToken');
              localStorage.removeItem('artistData');
              navigate('/account-blocked', {
                state: {
                  status: 'suspended',
                  reason: suspension_reason,
                  suspensionEnd: suspension_end
                },
                replace: true
              });
            } else if (account_status === 'terminated') {
              localStorage.removeItem('artistToken');
              localStorage.removeItem('artistData');
              navigate('/account-blocked', {
                state: {
                  status: 'terminated',
                  reason: suspension_reason
                },
                replace: true
              });
            }
          }
        }
      } catch (error) {
        console.log('Status check failed:', error);
      }
    };

    checkAccountStatus();
    const interval = setInterval(checkAccountStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return null;
}

// Role-based redirect component
function RoleBasedRedirect() {
  const navigate = useNavigate();
  const currentRole = getCurrentRole();
  
  useEffect(() => {
    if (currentRole === 'user') {
      navigate('/user/dashboard', { replace: true });
    } else if (currentRole === 'artist') {
      navigate('/artist/dashboard', { replace: true });
    }
  }, [currentRole, navigate]);
  
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <AccountStatusChecker />
        <RoleBasedNavbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:identifier" element={<ArtistProfile />} />
            <Route path="/:stageName" element={<ArtistProfile />} />
            <Route path="/account-blocked" element={<AccountBlocked />} />
            <Route path="/account-reactivated" element={<AccountReactivated />} />
            
            {/* Authentication Routes */}
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/artist/register" element={<ArtistRegisterNew />} />
            <Route path="/artist/login" element={<ArtistLogin />} />
            
            {/* STRICT USER-ONLY ROUTES */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/booking-success" element={
              <ProtectedRoute requiredRole="user">
                <BookingSuccess />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute requiredRole="user">
                <Wishlist />
              </ProtectedRoute>
            } />
            
            {/* STRICT ARTIST-ONLY ROUTES */}
            <Route path="/artist/dashboard" element={
              <ProtectedRoute requiredRole="artist">
                <ArtistDashboard />
              </ProtectedRoute>
            } />
            
            {/* Role-based redirect for authenticated users accessing root */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
            {/* Catch-all route for invalid paths */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <a href="/" className="text-purple-600 hover:text-purple-800">
                    Return to Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
