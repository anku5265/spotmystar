import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Instagram, Star, Eye, Calendar, Heart, Share2 } from 'lucide-react';
import api from '../config/api';
import { getCurrentRole } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import Toast from '../components/Toast';
import ReviewSection from '../components/ReviewSection';

export default function ArtistProfile() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);

  const currentRole = getCurrentRole();

  useEffect(() => {
    fetchArtist();
  }, [identifier]);

  useEffect(() => {
    if (artist && currentRole === 'user') {
      checkWishlist();
    }
  }, [artist, currentRole]);

  const fetchArtist = async () => {
    try {
      const decoded = decodeURIComponent(identifier).trim();
      const { data } = await api.get(`/api/artists/${encodeURIComponent(decoded)}`);
      setArtist(data);
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await api.get(`/api/wishlist/check/${artist.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInWishlist(data.inWishlist);
    } catch { /* silent */ }
  };

  const toggleWishlist = async () => {
    if (!currentRole) { navigate('/user/login'); return; }
    if (currentRole === 'artist') { setToast({ message: 'Wishlist is for users only', type: 'error' }); return; }
    try {
      const token = localStorage.getItem('userToken');
      if (inWishlist) {
        await api.delete(`/api/wishlist/${artist.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setInWishlist(false);
        setToast({ message: 'Removed from wishlist', type: 'success' });
      } else {
        await api.post('/api/wishlist', { artistId: artist.id }, { headers: { Authorization: `Bearer ${token}` } });
        setInWishlist(true);
        setToast({ message: 'Added to wishlist!', type: 'success' });
      }
    } catch { setToast({ message: 'Failed to update wishlist', type: 'error' }); }
  };

  const handleBookingSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('userToken');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      await api.post('/api/bookings', {
        artistId: artist.id,
        userId: userInfo.id || null,
        ...formData
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowBookingModal(false);
      navigate('/booking-success');
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Booking failed. Please try again.', type: 'error' });
    }
  };

  const handleBookNow = () => {
    if (!currentRole) { navigate('/user/login'); return; }
    if (currentRole === 'artist') { setToast({ message: 'Artists cannot book other artists.', type: 'error' }); return; }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <button onClick={() => navigate('/search')} className="btn-primary">Browse Artists</button>
      </div>
    );
  }

  const profileImage = artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stage_name || 'A')}&background=8B5CF6&color=fff&size=400`;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Cover Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={profileImage} alt={artist.stage_name} className="w-full h-full object-cover blur-sm scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/60 to-transparent"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8">

          {/* Profile Card */}
          <div className="md:w-1/3">
            <div className="card sticky top-24">
              <div className="text-center mb-4">
                <img
                  src={profileImage}
                  alt={artist.stage_name}
                  className="w-40 h-40 rounded-2xl mx-auto mb-4 border-4 border-primary object-cover shadow-2xl shadow-primary/30"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stage_name || 'A')}&background=8B5CF6&color=fff&size=160`; }}
                />
                <h1 className="text-2xl font-bold">{artist.stage_name}</h1>
                <p className="text-gray-400 text-sm">{artist.full_name}</p>
              </div>

              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">{artist.category_name}</span>
                {artist.is_verified && <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm">✓ Verified</span>}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="flex items-center gap-2 text-gray-400"><MapPin size={16} className="text-primary" />{artist.city}</p>
                <p className="text-xl font-bold text-primary text-center">
                  ₹{(artist.price_min || 0).toLocaleString()} - ₹{(artist.price_max || 0).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <button onClick={handleBookNow} className="w-full btn-primary mb-3">
                {!currentRole ? 'Login to Book' : currentRole === 'artist' ? 'Users Only' : 'Send Booking Request'}
              </button>

              <div className="flex gap-2 mb-3">
                {artist.whatsapp && (
                  <a href={`https://wa.me/${artist.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 glass px-4 py-2 rounded-lg text-center hover:bg-white/10 transition text-sm flex items-center justify-center gap-1">
                    <Phone size={16} /> WhatsApp
                  </a>
                )}
                {artist.instagram && (
                  <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 glass px-4 py-2 rounded-lg text-center hover:bg-white/10 transition text-sm flex items-center justify-center gap-1">
                    <Instagram size={16} /> Instagram
                  </a>
                )}
              </div>

              {currentRole === 'user' && (
                <button onClick={toggleWishlist}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition ${inWishlist ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'glass hover:bg-white/10'}`}>
                  <Heart size={16} className={inWishlist ? 'fill-red-400' : ''} />
                  {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 space-y-6 pb-12">
            {/* About */}
            <div className="card">
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-gray-400 leading-relaxed">{artist.bio || artist.short_bio || 'No bio available.'}</p>
            </div>

            {/* Stats */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.views || 0}</p>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-1"><Eye size={14} />Views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.total_bookings || 0}</p>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-1"><Calendar size={14} />Bookings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.rating > 0 ? artist.rating : 'New'}</p>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-1"><Star size={14} />Rating</p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {artist.gallery?.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {artist.gallery.map((img, idx) => (
                    <img key={idx} src={img} alt={`Gallery ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer" />
                  ))}
                </div>
              </div>
            )}

            {/* Pricing info */}
            <div className="card">
              <h2 className="text-xl font-bold mb-3">Pricing</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Starting from</p>
                  <p className="text-2xl font-bold text-primary">₹{(artist.price_min || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Up to</p>
                  <p className="text-2xl font-bold text-primary">₹{(artist.price_max || 0).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">* Final price depends on event type, duration, and location</p>
            </div>

            {/* Reviews */}
            <ReviewSection artistId={artist.id} />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          artist={artist}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}
