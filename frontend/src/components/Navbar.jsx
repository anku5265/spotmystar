import { Link } from 'react-router-dom';
import { Search, Heart, Menu, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link to="/wishlist" className="flex items-center gap-2 hover:text-primary transition">
              <Heart size={20} />
              <span>Wishlist</span>
            </Link>
            <Link to="/artist/register" className="hover:text-primary transition">
              Join as Artist
            </Link>
            <Link to="/artist/login" className="flex items-center gap-2 hover:text-primary transition">
              <User size={20} />
              <span>Login</span>
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
            <Link to="/wishlist" className="block hover:text-primary transition">Wishlist</Link>
            <Link to="/artist/register" className="block hover:text-primary transition">Join as Artist</Link>
            <Link to="/artist/login" className="block hover:text-primary transition">Artist Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
