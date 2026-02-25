import { Link } from 'react-router-dom';
import { Search, Heart, Menu, User, LogIn, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

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
              <>
                <Link to="/user/dashboard" className="flex items-center gap-2 hover:text-primary transition">
                  <User size={20} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="hover:text-primary transition">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/user/login" className="btn-primary text-sm">
                <Heart size={18} className="inline mr-2" />
                Book Artists
              </Link>
            )}
            
            <div className="h-6 w-px bg-white/20"></div>
            
            <Link to="/artist/login" className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm">
              For Artists
            </Link>
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
              <Link to="/user/login" className="block hover:text-primary transition">Book Artists</Link>
            )}
            
            <div className="h-px bg-white/20 my-2"></div>
            <Link to="/artist/login" className="block hover:text-secondary transition">For Artists</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
