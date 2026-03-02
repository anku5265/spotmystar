import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Calendar, TrendingUp, Users, Clock, CheckCircle, 
  XCircle, DollarSign, MapPin, Heart, BarChart3, 
  Settings, LogOut, Camera, Edit, AlertCircle, Star
} from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';

export default function ArtistDashboardNew() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user: authUser, isLoading, logout } = useAuth('artist');
  
  // State
  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('daily');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || userRole !== 'artist') return;
    
    if (authUser && authUser.id) {
      const token = localStorage.getItem('artistToken');
      fetchArtistData(token, authUser.id);
    }
  }, [isLoading, isAuthenticated, userRole, authUser]);

  const fetchArtistData = async (token, artistId) => {
    try {
      // Fetch artist profile
      const artistRes = await api.get(`/api/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArtist(artistRes.data);
      setIsAvailable(artistRes.data.is_available !== false);
      
      // Fetch analytics
      await fetchAnalytics(artistId, filter);
      
      // Fetch pending requests
      await fetchPendingRequests(artistId);
      
      // Fetch recent enquiries
      await fetchRecentEnquiries(artistId);
      
      // Fetch upcoming events
      await fetchUpcomingEvents(artistId);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching artist data:', error);
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
      setLoading(false);
    }
  };

  const fetchAnalytics = async (artistId, filterType) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/stats/${artistId}?filter=${filterType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPendingRequests = async (artistId) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/pending-requests/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(res.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchRecentEnquiries = async (artistId) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/recent-enquiries/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentEnquiries(res.data);
    } catch (error) {
      console.error('Error fetching recent enquiries:', error);
    }
  };

  const fetchUpcomingEvents = async (artistId) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/upcoming-events/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpcomingEvents(res.data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    if (artist) {
      await fetchAnalytics(artist.id, newFilter);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      const newStatus = !isAvailable;
      
      await api.patch(`/api/artist-analytics/availability/${artist.id}`, 
        { isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setIsAvailable(newStatus);
      setToast({ 
        message: `You are now ${newStatus ? 'Available' : 'Not Available'} for bookings`, 
        type: 'success' 
      });
    } catch (error) {
      setToast({ message: 'Failed to update availability', type: 'error' });
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/bookings/${bookingId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setToast({ message: `Booking ${action}!`, type: 'success' });
      await fetchPendingRequests(artist.id);
      await fetchAnalytics(artist.id, filter);
    } catch (error) {
      setToast({ message: 'Failed to update booking', type: 'error' });
    }
  };

  const getProfileCompletion = () => {
    if (!artist) return 0;
    let completed = 0;
    const total = 8;
    
    if (artist.full_name) completed++;
    if (artist.stage_name) completed++;
    if (artist.email) completed++;
    if (artist.phone || artist.whatsapp) completed++;
    if (artist.city) completed++;
    if (artist.bio) completed++;
    if (artist.price_min && artist.price_max) completed++;
    if (artist.category_id) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'artist') {
    return null;
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Unable to load artist data.</p>
        <button onClick={() => logout()} className="btn-primary mt-4">
          Back to Login
        </button>
      </div>
    );
  }

  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{artist.stage_name}</h1>
              <p className="text-gray-400 text-sm">{artist.category_name} • {artist.city}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => logout()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-800/30 p-1 rounded-lg w-fit">
          {['daily', 'weekly', 'monthly'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                filter === f
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="text-blue-400" size={24} />
                <TrendingUp className="text-blue-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-white">{stats.views}</p>
              <p className="text-gray-400 text-sm">Profile Visits</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="text-green-400" size={24} />
                <TrendingUp className="text-green-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-white">{stats.bookings}</p>
              <p className="text-gray-400 text-sm">Total Bookings</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-400" size={24} />
                <AlertCircle className="text-yellow-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
              <p className="text-gray-400 text-sm">Pending Requests</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="text-pink-400" size={24} />
                <Star className="text-pink-400" size={16} />
              </div>
              <p className="text-3xl font-bold text-white">{stats.wishlistCount}</p>
              <p className="text-gray-400 text-sm">Wishlist Count</p>
            </div>
          </div>
        )}

        {/* Quick Actions & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Availability Toggle */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-secondary" />
              Availability Status
            </h3>
            <button
              onClick={toggleAvailability}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isAvailable
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {isAvailable ? '✓ Available for Bookings' : '✗ Not Available'}
            </button>
          </div>

          {/* Profile Completion */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-400" />
              Profile Completion
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-semibold">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-secondary h-3 rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Count */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Upcoming Events
            </h3>
            <p className="text-4xl font-bold text-white">{stats?.upcomingEvents || 0}</p>
            <p className="text-gray-400 text-sm mt-2">Confirmed bookings</p>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="text-yellow-400" size={24} />
              Pending Booking Requests
            </h3>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-secondary/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{request.user_name}</h4>
                      <p className="text-gray-400 text-sm">{request.email} • {request.phone}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                      Pending
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar size={16} className="text-blue-400" />
                      <span>{new Date(request.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={16} className="text-green-400" />
                      <span>{request.event_location}</span>
                    </div>
                    {request.event_type && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users size={16} className="text-purple-400" />
                        <span>{request.event_type}</span>
                      </div>
                    )}
                    {request.budget && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign size={16} className="text-green-400" />
                        <span>₹{request.budget}</span>
                      </div>
                    )}
                  </div>
                  
                  {request.message && (
                    <div className="bg-gray-800/50 rounded p-3 mb-3">
                      <p className="text-gray-300 text-sm">{request.message}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookingAction(request.id, 'accepted')}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleBookingAction(request.id, 'rejected')}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Enquiries & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Enquiries */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-blue-400" size={20} />
              Recent Enquiries
            </h3>
            {recentEnquiries.length > 0 ? (
              <div className="space-y-3">
                {recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{enquiry.user_name}</p>
                      <p className="text-gray-400 text-sm">{new Date(enquiry.event_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      enquiry.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      enquiry.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {enquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No recent enquiries</p>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-purple-400" size={20} />
              Upcoming Events
            </h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-medium">{event.user_name}</p>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                        Confirmed
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">
                        <MapPin size={14} className="inline mr-1" />
                        {event.event_location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="text-secondary" size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-secondary/50 rounded-lg transition-all text-center">
              <DollarSign className="mx-auto mb-2 text-green-400" size={24} />
              <p className="text-sm text-white">Update Price</p>
            </button>
            <button className="p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-secondary/50 rounded-lg transition-all text-center">
              <Camera className="mx-auto mb-2 text-blue-400" size={24} />
              <p className="text-sm text-white">Add Photos</p>
            </button>
            <button className="p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-secondary/50 rounded-lg transition-all text-center">
              <Edit className="mx-auto mb-2 text-purple-400" size={24} />
              <p className="text-sm text-white">Edit Profile</p>
            </button>
            <button className="p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-secondary/50 rounded-lg transition-all text-center">
              <Calendar className="mx-auto mb-2 text-yellow-400" size={24} />
              <p className="text-sm text-white">Mark Busy</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
