import { Link } from 'react-router-dom';
import { Menu, User, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    
    const handleStorageChange = () => checkUser();
    const handleLoginEvent = () => checkUser();
    
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

  const checkUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    const artistData = localStorage.getItem('artistData');
    
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else if (artistData) {
      setUser(JSON.parse(artistData));
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('artistToken');
    localStorage.removeItem('artistData');
    setUser(null);
    setShowProfileMenu(false);
    // Redirect to public home page
    window.location.href = '/';
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible, redirects to homepage */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img src="/star-logo.svg" alt="SpotMyStar" className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SpotMyStar
            </span>
          </Link>

          {/* Desktop Menu - 3-4 elements max */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              /* After Login - Notification Bell + Profile Dropdown */
              <div className="flex items-center gap-3">
                <NotificationBell 
                  userType={user.stageName ? 'artist' : 'user'} 
                  userId={user.id} 
                />
                <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <ChevronDown size={16} />
                </button>
                
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="fixed right-4 top-14 w-52 bg-gray-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[9999]">
                      <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10">
                        <p className="font-semibold text-white truncate">{user.name || user.fullName || user.stageName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
                      </div>
                      <Link
                        to={user.stageName ? "/artist/dashboard" : "/user/dashboard"}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-gray-200 hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Dashboard
                      </Link>
                      <div className="border-t border-white/10">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition text-red-400"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
                </div>
              </div>
            ) : (
              /* Before Login - 3 Elements */
              <>
                {/* Explore Artists - Normal link */}
                <Link 
                  to="/search" 
                  className="text-white hover:text-primary transition"
                >
                  Explore Artists
                </Link>
                
                {/* Join as Artist - Primary CTA (highlighted) */}
                <Link 
                  to="/artist/register" 
                  className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Join as Artist
                </Link>
                
                {/* Login - Simple text link */}
                <Link 
                  to="/user/login" 
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Vertical stacked */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/10">
            {user ? (
              <>
                <Link 
                  to={user.stageName ? "/artist/dashboard" : "/user/dashboard"} 
                  className="block py-2 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  My Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left py-2 hover:text-primary transition text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/search" 
                  className="block py-2 hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Explore Artists
                </Link>
                
                {/* Join as Artist - Primary button in mobile */}
                <Link 
                  to="/artist/register" 
                  className="block bg-secondary hover:bg-secondary/80 text-white px-4 py-3 rounded-lg font-semibold text-center transition"
                  onClick={() => setIsOpen(false)}
                >
                  Join as Artist
                </Link>
                
                <Link 
                  to="/user/login" 
                  className="block py-2 text-gray-300 hover:text-white transition"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
