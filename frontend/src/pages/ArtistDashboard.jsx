import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const token = localStorage.getItem('artistToken');
    if (!token) {
      navigate('/artist/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      const artistData = JSON.parse(localStorage.getItem('artistData'));
      
      const { data } = await axios.get(`/api/bookings/artist/${artistData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setArtist(artistData);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  if (!artist) return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {artist.stageName}!</h1>
            <p className="text-gray-400">
              Status: <span className={artist.isVerified ? 'text-green-500' : 'text-yellow-500'}>
                {artist.isVerified ? '✓ Verified' : 'Pending Approval'}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('artistToken');
              localStorage.removeItem('artistData');
              navigate('/');
            }}
            className="glass px-6 py-2 rounded-lg hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Eye className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{artist.views || 0}</p>
              <p className="text-gray-400">Profile Views</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <Calendar className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-gray-400">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'accepted').length}
              </p>
              <p className="text-gray-400">Accepted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            Booking Requests
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            Edit Profile
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No booking requests yet</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="glass rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{booking.userName}</h3>
                      <p className="text-gray-400">📞 {booking.phone}</p>
                      <p className="text-gray-400">📧 {booking.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      booking.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <p>📅 {new Date(booking.eventDate).toLocaleDateString()}</p>
                    <p>📍 {booking.eventLocation}</p>
                    <p>💰 ₹{booking.budget.toLocaleString()}</p>
                  </div>

                  {booking.message && (
                    <p className="text-gray-400 mb-4">💬 {booking.message}</p>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'accepted')}
                        className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition"
                      >
                        <CheckCircle size={18} className="inline mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'rejected')}
                        className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                      >
                        <XCircle size={18} className="inline mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="text-center py-8 text-gray-400">
            <p>Profile editing coming soon!</p>
            <p className="text-sm mt-2">Contact admin to update your profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
