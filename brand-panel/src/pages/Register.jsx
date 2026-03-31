import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', email: '', mobile: '', website: '', instagram: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/brands/register', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
        <p className="text-gray-400 text-sm mb-6">Your account is pending admin approval. You'll be able to login once approved.</p>
        <Link to="/login" className="text-purple-400 hover:underline text-sm">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Register as Brand</h1>
          <p className="text-gray-400 text-sm mt-1">Post artist requirements on SpotMyStar</p>
        </div>
        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'companyName', label: 'Company Name *', type: 'text' },
            { key: 'email', label: 'Email *', type: 'email' },
            { key: 'mobile', label: 'Mobile Number *', type: 'tel' },
            { key: 'website', label: 'Website (optional)', type: 'url' },
            { key: 'instagram', label: 'Instagram (optional)', type: 'text' },
            { key: 'password', label: 'Password *', type: 'password' },
          ].map(f => (
            <input key={f.key} type={f.type} placeholder={f.label}
              value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
              required={f.label.includes('*')}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          Already registered? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
