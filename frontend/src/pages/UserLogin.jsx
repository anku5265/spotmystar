import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../config/api';

export default function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/user/login', formData);
      
      // Check if user was previously suspended/terminated (will be in notification)
      const userInfo = data.user;
      
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Dispatch custom event to notify Navbar
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
              userType: 'user',
              previousStatus: reactivationNotif.title.includes('Welcome Back') ? 'terminated' : 'suspended'
            } 
          });
          return;
        }
      } catch (notifError) {
        console.log('Could not check notifications:', notifError);
      }
      
      navigate('/');
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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <img src="/logo.svg" alt="SpotMyStar" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Login to book your favorite artists</p>
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
                className="w-full bg-white/5 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="your@email.com"
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
                className="w-full bg-white/5 rounded-lg pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/user/register" className="text-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Are you an artist?{' '}
            <Link to="/artist/login" className="text-secondary hover:underline">
              Artist Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
