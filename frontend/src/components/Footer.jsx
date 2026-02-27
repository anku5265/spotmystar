import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.svg" alt="SpotMyStar" className="w-12 h-12" />
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SpotMyStar
            </h3>
            <p className="text-gray-400 text-sm">Discover and book talented artists across India</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-primary transition text-sm">Home</Link>
              <Link to="/search" className="block text-gray-400 hover:text-primary transition text-sm">Search Artists</Link>
              <Link to="/artist/register" className="block text-gray-400 hover:text-primary transition text-sm">Join as Artist</Link>
              <Link to="/user/login" className="block text-gray-400 hover:text-primary transition text-sm">Login</Link>
            </div>
          </div>

          {/* Explore Artists - Popular Cities */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Popular Cities</h4>
            <div className="space-y-2">
              <Link to="/search?city=Delhi" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Delhi</Link>
              <Link to="/search?city=Mumbai" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Mumbai</Link>
              <Link to="/search?city=Bangalore" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Bangalore</Link>
              <Link to="/search?city=Pune" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Pune</Link>
              <Link to="/search?city=Hyderabad" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Hyderabad</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Categories</h4>
            <div className="space-y-2">
              <Link to="/search?category=dj" className="block text-gray-400 hover:text-primary transition text-sm">DJs</Link>
              <Link to="/search?category=anchor" className="block text-gray-400 hover:text-primary transition text-sm">Anchors</Link>
              <Link to="/search?category=band" className="block text-gray-400 hover:text-primary transition text-sm">Bands</Link>
              <Link to="/search?category=singer" className="block text-gray-400 hover:text-primary transition text-sm">Singers</Link>
              <Link to="/search?category=dancer" className="block text-gray-400 hover:text-primary transition text-sm">Dancers</Link>
              <Link to="/search?category=comedian" className="block text-gray-400 hover:text-primary transition text-sm">Comedians</Link>
            </div>
          </div>

          {/* More Cities */}
          <div>
            <h4 className="font-semibold mb-4 text-white">More Locations</h4>
            <div className="space-y-2">
              <Link to="/search?city=Chennai" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Chennai</Link>
              <Link to="/search?city=Kolkata" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Kolkata</Link>
              <Link to="/search?city=Ahmedabad" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Ahmedabad</Link>
              <Link to="/search?city=Jaipur" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Jaipur</Link>
              <Link to="/search?city=Lucknow" className="block text-gray-400 hover:text-primary transition text-sm">Artists in Lucknow</Link>
            </div>
          </div>

          {/* Company (previously How It Works) */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-400 hover:text-primary transition text-sm">About Us</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-primary transition text-sm">Contact Us</Link>
              <Link to="/how-it-works" className="block text-gray-400 hover:text-primary transition text-sm">How It Works</Link>
              <Link to="/faq" className="block text-gray-400 hover:text-primary transition text-sm">FAQ</Link>
            </div>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy-policy" className="block text-gray-400 hover:text-primary transition text-sm">Privacy Policy</Link>
              <Link to="/terms-conditions" className="block text-gray-400 hover:text-primary transition text-sm">Terms & Conditions</Link>
              <Link to="/report-issue" className="block text-gray-400 hover:text-primary transition text-sm">Report an Issue</Link>
              <Link to="/transparency" className="block text-gray-400 hover:text-primary transition text-sm">Transparency</Link>
            </div>
          </div>

        </div>

        {/* Social Media Links & Copyright */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/company/spotmystar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://instagram.com/spotmystar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com/spotmystar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center">
              &copy; {currentYear} SpotMyStar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
