import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music, Mail, Lock } from 'lucide-react';
import axios from 'axios';

export default function ArtistLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/artist/login', formData);
      localStorage.setItem('artistToken', data.token);
      localStorage.setItem('artistData', JSON.stringify(data.artist));
      
      // Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event('userLogin'));
      
      navigate('/artist/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/20 rounded-full mb-4">
            <Music className="text-secondary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Artist Portal</h1>
          <p className="text-gray-400">Login to manage your bookings and profile</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary"
                placeholder="artist@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/80 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login as Artist'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            New artist?{' '}
            <Link to="/artist/register" className="text-secondary hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Looking to book artists?{' '}
            <Link to="/user/login" className="text-primary hover:underline">
              User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
