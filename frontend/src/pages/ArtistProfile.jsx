import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ArtistProfile() {
  const { identifier, stageName } = useParams();
  const [artist, setArtist] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    phone: '',
    email: '',
    eventDate: '',
    eventLocation: '',
    budget: '',
    message: ''
  });

  useEffect(() => {
    fetchArtist();
  }, [identifier, stageName]);

  const fetchArtist = async () => {
    try {
      const id = identifier || stageName;
      const { data } = await axios.get(`/api/artists/${id}`);
      setArtist(data);
    } catch (error) {
      console.error('Error fetching artist:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings', {
        artistId: artist._id,
        ...formData
      });
      window.location.href = '/booking-success';
    } catch (error) {
      alert('Booking failed. Please try again.');
    }
  };

  if (!artist) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;

  return (
    <div>
      {/* Cover Banner */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={artist.profileImage}
          alt={artist.stageName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Card */}
          <div className="md:w-1/3">
            <div className="card sticky top-24">
              <img
                src={artist.profileImage}
                alt={artist.stageName}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary"
              />
              
              <h1 className="text-3xl font-bold text-center mb-2">{artist.stageName}</h1>
              <p className="text-center text-gray-400 mb-4">{artist.fullName}</p>

              <div className="flex justify-center gap-2 mb-6">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                  {artist.category?.name}
                </span>
                {artist.isVerified && (
                  <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <p className="flex items-center gap-2 text-gray-400">
                  <MapPin size={18} className="text-primary" />
                  {artist.city}
                </p>
                <p className="text-2xl font-bold text-primary text-center">
                  ₹{artist.priceMin.toLocaleString()} - ₹{artist.priceMax.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full btn-primary mb-3"
              >
                Send Booking Request
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${artist.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 glass px-4 py-3 rounded-lg text-center hover:bg-white/10 transition"
                >
                  <Phone size={20} className="inline" />
                </a>
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 glass px-4 py-3 rounded-lg text-center hover:bg-white/10 transition"
                  >
                    <Instagram size={20} className="inline" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-400 leading-relaxed">{artist.bio || 'No bio available.'}</p>
            </div>

            {artist.gallery?.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {artist.gallery.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.views || 0}</p>
                  <p className="text-gray-400">Views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.totalBookings || 0}</p>
                  <p className="text-gray-400">Bookings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{artist.rating || 'New'}</p>
                  <p className="text-gray-400">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Book {artist.stageName}</h2>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Event Location"
                  required
                  value={formData.eventLocation}
                  onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Budget (₹)"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Additional Message (Optional)"
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
                <button type="submit" className="w-full btn-primary">
                  Send Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
