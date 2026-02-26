import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

export default function ArtistRegister() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    stageName: '',
    category: '',
    bio: '',
    city: '',
    priceMin: '',
    priceMax: '',
    email: '',
    whatsapp: '',
    instagram: '',
    password: '',
    customCategory: ''
  });

  useEffect(() => {
    console.log('Component mounted, fetching categories...');
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...');
      setLoading(true);
      const { data } = await axios.get('/api/categories');
      console.log('Categories received:', data);
      console.log('Number of categories:', data.length);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setToast({ message: 'Failed to load categories. Please refresh the page.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting artist registration:', formData);
    try {
      await axios.post('/api/artists/register', formData);
      setToast({ message: 'Registration successful! Awaiting admin approval.', type: 'success' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setToast({ message: error.response?.data?.message || 'Registration failed', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Join as Artist</h1>
        <p className="text-gray-400 mb-8">Register your profile and start receiving bookings</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Stage Name"
              required
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="w-full bg-white/5 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-400">Select Category *</p>
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className="text-primary hover:text-secondary text-sm"
              >
                {showCategories ? '▲ Hide' : '▼ Show'}
              </button>
            </div>
            {showCategories && (
              loading ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories available</p>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={formData.category === cat.id}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          setShowOtherCategory(false);
                        }}
                        required
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-white">{cat.name}</span>
                    </label>
                  ))}
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                    <input
                      type="radio"
                      name="category"
                      value="other"
                      checked={formData.category === 'other'}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value });
                        setShowOtherCategory(true);
                      }}
                      required
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-white">Other (Specify)</span>
                  </label>
                  {showOtherCategory && (
                    <input
                      type="text"
                      placeholder="Enter your category"
                      value={formData.customCategory || ''}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      required={formData.category === 'other'}
                      className="bg-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              )
            )}
          </div>

          <textarea
            placeholder="Bio (Max 500 characters)"
            maxLength="500"
            rows="4"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          ></textarea>

          <input
            type="text"
            placeholder="City"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min Price (₹)"
              required
              value={formData.priceMin}
              onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Max Price (₹)"
              required
              value={formData.priceMax}
              onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="WhatsApp Number"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Instagram Handle (optional)"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white/5 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button type="submit" className="w-full btn-primary">
            Register
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/artist/login" className="text-secondary hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
