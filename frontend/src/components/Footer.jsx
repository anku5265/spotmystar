import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              SpotMyStar
            </h3>
            <p className="text-gray-400">Discover and book talented artists across India</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/search" className="block text-gray-400 hover:text-primary transition">Search Artists</Link>
              <Link to="/artist/register" className="block text-gray-400 hover:text-primary transition">Join as Artist</Link>
              <Link to="/admin/login" className="block text-gray-400 hover:text-primary transition">Admin Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2 text-gray-400">
              <p>DJs</p>
              <p>Anchors</p>
              <p>Bands</p>
              <p>Singers</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2"><Mail size={16} /> support@spotmystar.com</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> India</p>
              <p className="flex items-center gap-2"><Instagram size={16} /> @spotmystar</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SpotMyStar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
