import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../config/api';

export default function ArtistLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/artist/login', formData);
      console.log('Artist login response:', data);
      
      localStorage.setItem('artistToken', data.token);
      localStorage.setItem('artistData', JSON.stringify(data.artist));
      
      console.log('Saved to localStorage - artistToken:', data.token);
      console.log('Saved to localStorage - artistData:', JSON.stringify(data.artist));
      
      // Dispatch custom event to notify Navbar
      console.log('Dispatching userLogin event');
      window.dispatchEvent(new Event('userLogin'));
      
      // Check for reactivation notification
      try {
        const notifResponse = await api.get('/api/notifications', {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const reactivationNotif = notifResponse.data.find(n => 
          n.title.includes('Welcome Back') || n.title.includes('Account Restored')
        );
        
        if (reactivationNotif && !reactivationNotif.is_read) {
          // Mark as read
          await api.patch(`/api/notifications/${reactivationNotif.id}/read`, {}, {
            headers: { Authorization: `Bearer ${data.token}` }
          });
          
          // Show reactivation page
          navigate('/account-reactivated', { 
            state: { 
              userType: 'artist',
              previousStatus: reactivationNotif.title.includes('Welcome Back') ? 'terminated' : 'suspended'
            } 
          });
          return;
        }
      } catch (notifError) {
        console.log('Could not check notifications:', notifError);
      }
      
      navigate('/artist/dashboard');
    } catch (err) {
      // Check if account is suspended/terminated
      if (err.response?.status === 403) {
        const errorData = err.response.data;
        if (errorData.message.includes('suspended') || errorData.message.includes('deactivated') || errorData.message.includes('terminated')) {
          // Redirect to account blocked page with details
          navigate('/account-blocked', { 
            state: { 
              status: errorData.message.includes('suspended') ? 'suspended' : 
                      errorData.message.includes('terminated') ? 'terminated' : 'inactive',
              reason: errorData.reason,
              suspensionEnd: errorData.suspendedUntil
            } 
          });
          return;
        }
      }
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
            <img src="/logo.svg" alt="SpotMyStar" className="w-10 h-10" />
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
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 rounded-lg pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
