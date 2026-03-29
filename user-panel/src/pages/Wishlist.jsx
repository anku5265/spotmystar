import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, MapPin, Star, Calendar } from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import BookingModal from '../components/BookingModal';
import { getCurrentRole } from '../hooks/useAuth';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    const role = getCurrentRole();
    if (role !== 'user') {
      navigate('/user/login');
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await api.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (artistId) => {
    try {
      const token = localStorage.getItem('userToken');
      await api.delete(`/api/wishlist/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(prev => prev.filter(item => item.artist_id !== artistId));
      setToast({ message: 'Removed from wishlist', type: 'success' });
    } catch {
      setToast({ message: 'Failed to remove', type: 'error' });
    }
  };

  const handleBooking = async (formData) => {
    try {
      const token = localStorage.getItem('userToken');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await api.post('/api/bookings', {
        artistId: selectedArtist.artist_id,
        userId: userInfo.id,
        ...formData
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowBookingModal(false);
      setToast({ message: 'Booking request sent!', type: 'success' });
      setTimeout(() => navigate('/booking-success'), 1500);
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Booking failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Heart className="text-primary" />
        My Wishlist
        {wishlist.length > 0 && <span className="text-lg text-gray-400 font-normal">({wishlist.length} artists)</span>}
      </h1>

      {wishlist.length === 0 ? (
        <div className="card text-center py-20">
          <Heart size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8">Start adding artists you like to compare and book later</p>
          <Link to="/search" className="btn-primary inline-block">Browse Artists</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="card group relative">
              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.artist_id)}
                className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition z-10"
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>

              {/* Artist Image */}
              <Link to={`/artist/${item.artist_id}`}>
                <div className="relative mb-4">
                  <img
                    src={item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.stage_name || item.full_name)}&background=8B5CF6&color=fff&size=200`}
                    alt={item.stage_name}
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.stage_name || 'A')}&background=8B5CF6&color=fff&size=200`; }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {item.category_name}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1 hover:text-primary transition">{item.stage_name || item.full_name}</h3>
              </Link>

              <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1"><MapPin size={14} />{item.city}</span>
                {item.rating > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" />{item.rating}</span>}
              </div>

              <p className="text-primary font-semibold mb-4">
                ₹{(item.price_min || 0).toLocaleString()} - ₹{(item.price_max || 0).toLocaleString()}
              </p>

              <div className="flex gap-2">
                <Link to={`/artist/${item.artist_id}`} className="flex-1 glass px-4 py-2 rounded-lg text-center text-sm hover:bg-white/10 transition">
                  View Profile
                </Link>
                <button
                  onClick={() => { setSelectedArtist(item); setShowBookingModal(true); }}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                >
                  <Calendar size={14} /> Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBookingModal && selectedArtist && (
        <BookingModal
          artist={{
            ...selectedArtist,
            id: selectedArtist.artist_id,
            stage_name: selectedArtist.stage_name,
            price_min: selectedArtist.price_min,
            price_max: selectedArtist.price_max,
            category_name: selectedArtist.category_name,
            city: selectedArtist.city,
          }}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBooking}
        />
      )}
    </div>
  );
}
