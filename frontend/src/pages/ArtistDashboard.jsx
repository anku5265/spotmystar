import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, CheckCircle, XCircle, Clock, Music } from 'lucide-react';
import api from '../config/api';

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalNotification, setShowApprovalNotification] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('artistToken');
    const artistData = localStorage.getItem('artistData');
    
    if (!token || !artistData) {
      navigate('/artist/login');
      return;
    }

    const parsedArtist = JSON.parse(artistData);
    
    // Fetch fresh artist data from database
    fetchArtistData(token, parsedArtist.id);
  }, [navigate]);

  const fetchArtistData = async (token, artistId) => {
    try {
      // Fetch fresh artist data from backend
      const { data: freshArtistData } = await api.get(`/api/artists/${artistId}`);
      
      // Convert snake_case to camelCase
      const artistInfo = {
        id: freshArtistData.id,
        fullName: freshArtistData.full_name,
        stageName: freshArtistData.stage_name,
        email: freshArtistData.email,
        status: freshArtistData.status,
        isVerified: freshArtistData.is_verified,
        views: freshArtistData.views || 0
      };
      
      // Check if rejected - logout and redirect
      if (artistInfo.status === 'rejected') {
        localStorage.removeItem('artistToken');
        localStorage.removeItem('artistData');
        localStorage.removeItem('artistLastStatus');
        navigate('/', { state: { message: 'Your registration was rejected. Please contact support or register again.' } });
        return;
      }
      
      // Update localStorage with fresh data
      localStorage.setItem('artistData', JSON.stringify(artistInfo));
      setArtist(artistInfo);
      
      // Check if status changed from pending to active
      const lastStatus = localStorage.getItem('artistLastStatus');
      if (lastStatus === 'pending' && artistInfo.status === 'active' && artistInfo.isVerified) {
        setShowApprovalNotification(true);
        setTimeout(() => setShowApprovalNotification(false), 10000);
      }
      
      // Save current status
      localStorage.setItem('artistLastStatus', artistInfo.status);
      
      // Fetch bookings
      fetchBookings(token, artistId);
    } catch (error) {
      console.error('Error fetching artist data:', error);
      // If artist not found or any error, just use localStorage data
      const artistData = localStorage.getItem('artistData');
      if (artistData) {
        setArtist(JSON.parse(artistData));
        fetchBookings(token, artistId);
      } else {
        localStorage.removeItem('artistToken');
        localStorage.removeItem('artistData');
        navigate('/artist/login');
      }
    }
  };

  const fetchBookings = async (token, artistId) => {
    try {
      const { data } = await api.get(`/api/bookings/artist/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/bookings/${bookingId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh bookings
      const artistData = JSON.parse(localStorage.getItem('artistData'));
      fetchBookings(token, artistData.id);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'accepted':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Unable to load artist data. Please try logging in again.</p>
        <button 
          onClick={() => navigate('/artist/login')}
          className="btn-primary mt-4"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Approval Notification - Only shows when status changes from pending to active */}
      {showApprovalNotification && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-500">🎉 Registration Approved!</h3>
                <p className="text-sm text-gray-400">Congratulations! Your profile is now live and visible to users.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowApprovalNotification(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Status Notification Banner - Always visible based on current status */}
      {artist?.status === 'pending' && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-500" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-500">Registration Pending</h3>
              <p className="text-sm text-gray-400">Your registration is under review by admin. You'll be notified once approved.</p>
            </div>
          </div>
        </div>
      )}

      {artist?.status === 'rejected' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle className="text-red-500" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Registration Rejected</h3>
              <p className="text-sm text-gray-400">Your registration was not approved. Please contact support for more information.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
              <Music className="text-secondary" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{artist?.stageName || artist?.fullName}</h1>
              <p className="text-gray-400">{artist?.email}</p>
              <p className={artist?.isVerified ? 'text-green-500' : 'text-yellow-500'}>
                Status: {artist?.isVerified ? '✓ Verified' : 'Pending Approval'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Eye className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{artist?.views || 0}</p>
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
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-gray-400">Pending</p>
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

      {/* Bookings List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No booking requests yet</p>
            <p className="text-gray-500 text-sm mt-2">Requests will appear here when users book you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{booking.user_name || booking.userName}</h3>
                    <p className="text-gray-400">📞 {booking.phone}</p>
                    <p className="text-gray-400">📧 {booking.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      booking.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                      booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Event Date</p>
                    <p className="font-semibold">
                      {new Date(booking.event_date || booking.eventDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p className="font-semibold">{booking.event_location || booking.eventLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Budget</p>
                    <p className="font-semibold text-primary">₹{(booking.budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Requested On</p>
                    <p className="font-semibold">
                      {new Date(booking.created_at || booking.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {booking.message && (
                  <div className="mb-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm">Message</p>
                    <p className="text-sm">{booking.message}</p>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'accepted')}
                      className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Accept
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                      className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
