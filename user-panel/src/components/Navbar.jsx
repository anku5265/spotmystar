import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import { getCurrentRole } from '../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authState, setAuthState] = useState({ role: null, user: null });

  useEffect(() => {
    refreshAuthState();

    const handleStorageChange = () => refreshAuthState();
    const handleLoginEvent = () => refreshAuthState();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleLoginEvent);

    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLoginEvent);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileMenu]);

  const refreshAuthState = () => {
    const role = getCurrentRole();
    if (role === 'user') {
      const userInfo = localStorage.getItem('userInfo');
      setAuthState({ role: 'user', user: userInfo ? JSON.parse(userInfo) : null });
    } else {
      setAuthState({ role: null, user: null });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    setAuthState({ role: null, user: null });
    setShowProfileMenu(false);
    setIsOpen(false);
    navigate('/');
  };

  const { role, user } = authState;
  const displayName = user?.name || user?.fullName || '';
  const logoPath = '/';

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={logoPath} className="flex items-center gap-2 hover:opacity-80 transition">
            <img src="/star-logo.svg" alt="SpotMyStar" className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SpotMyStar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {role === 'user' && (
              // USER NAV - discovery focused
              <>
                <Link to="/search" className="text-white hover:text-primary transition">Explore Artists</Link>
                <Link to="/wishlist" className="text-gray-300 hover:text-white transition">Wishlist</Link>
                <Link to="/user/dashboard" className="text-gray-300 hover:text-white transition">My Bookings</Link>
                <div className="flex items-center gap-3">
                  <NotificationBell userType="user" userId={user?.id} />
                  <div className="relative profile-dropdown">
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 hover:text-primary transition">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <ChevronDown size={16} />
                    </button>
                    {showProfileMenu && <UserDropdown user={user} dashboardPath="/user/dashboard" onLogout={handleLogout} onClose={() => setShowProfileMenu(false)} />}
                  </div>
                </div>
              </>
            )}

            {!role && (
              // LOGGED OUT NAV
              <>
                <Link to="/search" className="text-white hover:text-primary transition">Explore Artists</Link>
                <a href={`${import.meta.env.VITE_ARTIST_PANEL_URL || 'http://localhost:5175'}/register`} className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-semibold transition">
                  Join as Artist
                </a>
                <Link to="/user/login" className="text-gray-300 hover:text-white transition">Login</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/10">
            {role === 'user' && (
              <>
                <Link to="/search" className="block py-2 hover:text-primary transition" onClick={() => setIsOpen(false)}>Explore Artists</Link>
                <Link to="/wishlist" className="block py-2 hover:text-primary transition" onClick={() => setIsOpen(false)}>Wishlist</Link>
                <Link to="/user/dashboard" className="block py-2 hover:text-primary transition" onClick={() => setIsOpen(false)}>My Bookings</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400 hover:text-red-300 transition">Logout</button>
              </>
            )}
            {!role && (
              <>
                <Link to="/search" className="block py-2 hover:text-primary transition" onClick={() => setIsOpen(false)}>Explore Artists</Link>
                <a href={`${import.meta.env.VITE_ARTIST_PANEL_URL || 'http://localhost:5175'}/register`} className="block bg-secondary text-white px-4 py-3 rounded-lg font-semibold text-center transition" onClick={() => setIsOpen(false)}>Join as Artist</a>
                <Link to="/user/login" className="block py-2 text-gray-300 hover:text-white transition" onClick={() => setIsOpen(false)}>Login</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// User dropdown menu
function UserDropdown({ user, dashboardPath, onLogout, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div className="fixed right-4 top-14 w-52 bg-gray-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[9999]">
        <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10">
          <p className="font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">User</span>
        </div>
        <Link to={dashboardPath} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-gray-200" onClick={onClose}>
          My Dashboard
        </Link>
        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-gray-200" onClick={onClose}>
          Wishlist
        </Link>
        <div className="border-t border-white/10">
          <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-red-400">
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
