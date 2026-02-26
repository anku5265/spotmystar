import { Link } from 'react-router-dom';
import { Search, Heart, Menu, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SpotMyStar
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="flex items-center gap-2 hover:text-primary transition">
              <Search size={20} />
              <span>Search</span>
            </Link>
            
            {user ? (
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
                  <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl py-2 border border-white/10 z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-lg font-semibold truncate">{user.name}</p>
                    </div>
                    <Link
                      to="/user/dashboard"
                      className="block px-4 py-2 hover:bg-white/5 transition"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 transition text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/user/login" className="btn-primary text-sm">
                  <Heart size={18} className="inline mr-2" />
                  Book Artists
                </Link>
                
                <div className="h-6 w-px bg-white/20"></div>
                
                <Link to="/artist/login" className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm">
                  For Artists
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/search" className="block hover:text-primary transition">Search Artists</Link>
            
            {user ? (
              <>
                <Link to="/user/dashboard" className="block hover:text-primary transition">My Dashboard</Link>
                <button onClick={handleLogout} className="block hover:text-primary transition w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/user/login" className="block hover:text-primary transition">Book Artists</Link>
                <div className="h-px bg-white/20 my-2"></div>
                <Link to="/artist/login" className="block hover:text-secondary transition">For Artists</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
