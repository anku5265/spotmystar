import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import api from '../config/api';
import NotificationBell from '../components/NotificationBell';
import EditProfileModal from '../components/EditProfileModal';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user: authUser, isLoading, logout } = useAuth('user');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Wait for auth validation
    if (isLoading) return;
    
    // If not authenticated or wrong role, useAuth hook will redirect
    if (!isAuthenticated || userRole !== 'user') return;
    
    // Set user from auth hook
    if (authUser) {
      setUser(authUser);
      checkAccountStatus(authUser.id);
    }
  }, [isLoading, isAuthenticated, userRole, authUser]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);
    
    fetchBookings(token);
    
    // Check status every minute
    const statusInterval = setInterval(() => checkAccountStatus(parsedUser.id), 60000);
    return () => clearInterval(statusInterval);
  }, [navigate]);

  const checkAccountStatus = async (userId) => {
    try {
      const { data } = await api.get(`/api/user-management/check-status/user/${userId}`);
      
      if (data.account_status && data.account_status !== 'active') {
        navigate('/account-blocked', { 
          state: { 
            status: data.account_status, 
            reason: data.suspension_reason,
            suspensionEnd: data.suspension_end
          } 
        });
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  };

  const fetchBookings = async (token) => {
    try {
      const { data } = await api.get('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // Use logout from useAuth hook
  };

  const handleProfileUpdate = async (formData) => {
    try {
      const token = localStorage.getItem('userToken');
      const { data } = await api.patch('/api/auth/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local storage and state
      const updatedUser = data.user;
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Failed to update profile', 
        type: 'error' 
      });
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || userRole !== 'user') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-gray-400">{user?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-white/10 transition"
              title="Edit Profile"
            >
              <Settings size={20} />
              <span className="hidden md:inline">Edit Profile</span>
            </button>
            {user && <NotificationBell userType="user" userId={user.id} />}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Calendar className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-gray-400">Total Bookings</p>
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
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CheckCircle className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
              <p className="text-gray-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No bookings yet</p>
            <button
              onClick={() => navigate('/search')}
              className="btn-primary mt-4"
            >
              Browse Artists
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.artist?.profile_image || 'https://via.placeholder.com/80'}
                      alt={booking.artist?.stage_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{booking.artist?.stage_name}</h3>
                      <p className="text-gray-400">{booking.artist?.category_name}</p>
                    </div>
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

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Event Date</p>
                    <p className="font-semibold">
                      {new Date(booking.event_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p className="font-semibold">{booking.event_location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Budget</p>
                    <p className="font-semibold text-primary">₹{booking.budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Booked On</p>
                    <p className="font-semibold">
                      {new Date(booking.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm">Message</p>
                    <p className="text-sm">{booking.message}</p>
                  </div>
                )}

                {booking.status === 'accepted' && (
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://wa.me/${booking.artist?.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      Contact on WhatsApp
                    </a>
                    {booking.artist?.instagram && (
                      <a
                        href={`https://instagram.com/${booking.artist?.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleProfileUpdate}
        />
      )}
    </div>
  );
}
