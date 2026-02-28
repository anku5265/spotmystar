import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Toast from '../components/Toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/admin/login', formData);
      localStorage.setItem('adminToken', data.token);
      setToast({ message: 'Login successful!', type: 'success' });
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Invalid credentials', type: 'error' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="card max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="w-full btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
