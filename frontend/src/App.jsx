import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
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
