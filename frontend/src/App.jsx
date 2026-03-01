import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
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
        // Check if user is logged in
        const userToken = localStorage.getItem('userToken');
        const artistToken = localStorage.getItem('artistToken');
        
        if (userToken) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          if (userInfo.id) {
            const response = await api.get(`/api/user-management/check-status/user/${userInfo.id}`);
            const { account_status, suspension_reason, suspension_end } = response.data;
            
            if (account_status === 'suspended' || account_status === 'terminated') {
              // Logout and redirect
              localStorage.removeItem('userToken');
              localStorage.removeItem('userInfo');
              navigate('/account-blocked', {
                state: {
                  status: account_status,
                  reason: suspension_reason,
                  suspensionEnd: suspension_end
                }
              });
            }
          }
        } else if (artistToken) {
          const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
          if (artistData.id) {
            const response = await api.get(`/api/user-management/check-status/artist/${artistData.id}`);
            const { account_status, suspension_reason, suspension_end } = response.data;
            
            if (account_status === 'suspended' || account_status === 'terminated') {
              // Logout and redirect
              localStorage.removeItem('artistToken');
              localStorage.removeItem('artistData');
              navigate('/account-blocked', {
                state: {
                  status: account_status,
                  reason: suspension_reason,
                  suspensionEnd: suspension_end
                }
              });
            }
          }
        }
      } catch (error) {
        console.log('Status check failed:', error);
      }
    };

    // Check immediately
    checkAccountStatus();

    // Check every 10 seconds
    const interval = setInterval(checkAccountStatus, 10000);

    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <AccountStatusChecker />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:identifier" element={<ArtistProfile />} />
            <Route path="/:stageName" element={<ArtistProfile />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account-blocked" element={<AccountBlocked />} />
            <Route path="/account-reactivated" element={<AccountReactivated />} />
            
            {/* User Routes */}
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            
            {/* Artist Routes */}
            <Route path="/artist/register" element={<ArtistRegisterNew />} />
            <Route path="/artist/login" element={<ArtistLogin />} />
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
