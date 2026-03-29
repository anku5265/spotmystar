import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, Heart, Calendar } from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import BookingModal from '../components/BookingModal';
import { getCurrentRole } from '../hooks/useAuth';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const currentRole = getCurrentRole();

  useEffect(() => {
    fetchCategories();
    fetchArtists();
  }, [filters]);

  const fetchCategories = async () => {
    const { data } = await api.get('/api/categories');
    setCategories(data);
  };

  const fetchArtists = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const { data } = await api.get(`/api/artists/search?${params}`);
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const handleBookNow = (artist, e) => {
    e.preventDefault();
    e.stopPropagation();
    // Artists cannot book other artists
    if (currentRole === 'artist') {
      setToast({ message: 'Artists cannot book other artists. Please login as a user.', type: 'error' });
      return;
    }
    // Non-logged-in users go to login
    if (!currentRole) {
      navigate('/user/login');
      return;
    }
    setSelectedArtist(artist);
    setShowBookingModal(true);
  };

  const handleWishlist = async (artist, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentRole) {
      navigate('/user/login');
      return;
    }
    if (currentRole === 'artist') {
      setToast({ message: 'Wishlist is a user-only feature.', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('userToken');
      await api.post('/api/wishlist', { artistId: artist.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: `${artist.stage_name || artist.stageName} added to wishlist!`, type: 'success' });
    } catch (error) {
      if (error.response?.status === 409) {
        // Already in wishlist — remove it
        await api.delete(`/api/wishlist/${artist.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
        setToast({ message: 'Removed from wishlist', type: 'success' });
      } else {
        setToast({ message: 'Failed to update wishlist', type: 'error' });
      }
    }
  };

  const handleBookingSubmit = async (formData) => {
    try {
      const userToken = localStorage.getItem('userToken');
      await api.post('/api/bookings', {
        artistId: selectedArtist.id,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setToast({ message: 'Booking request sent successfully! Artist will contact you soon.', type: 'success' });
      setShowBookingModal(false);
      setSelectedArtist(null);
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to send booking request', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="md:w-64 space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Budget Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => setFilters({ city: '', category: '', minPrice: '', maxPrice: '', search: '' })}
                className="w-full glass px-4 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{artists.length} Artists Found</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary' : 'glass'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary' : 'glass'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {artists.map((artist) => (
              <div key={artist.id} className="card group relative">
                <button
                  onClick={(e) => handleWishlist(artist, e)}
                  className="absolute top-4 right-4 z-10 p-2 glass rounded-full hover:bg-primary transition"
                  title={currentRole === 'user' ? 'Add to Wishlist' : 'Login to save'}
                >
                  <Heart size={20} />
                </button>

                <Link to={`/artist/${artist.id}`}>
                  <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-xl">
                    <img
                      src={artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stage_name || 'A')}&background=8B5CF6&color=fff&size=400`}
                      alt={artist.stage_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stage_name || 'A')}&background=8B5CF6&color=fff&size=400`; }}
                    />
                    {artist.is_verified && (
                      <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-sm">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{artist.stage_name}</h3>
                  <p className="text-gray-400 mb-2">{artist.category_name} • {artist.city}</p>
                </Link>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-primary font-semibold">
                      ₹{(artist.price_min || 0).toLocaleString()} - ₹{(artist.price_max || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <span>⭐ {artist.rating || 'New'}</span>
                      <span>•</span>
                      <span>{artist.total_bookings || 0} bookings</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleBookNow(artist, e)}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 rounded-lg transition-all text-white font-medium text-sm flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>

          {artists.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No artists found. Try adjusting your filters.</p>
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedArtist && (
        <BookingModal
          artist={selectedArtist}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedArtist(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}
