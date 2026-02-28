import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, CheckCircle, XCircle, Eye, Calendar, UserCircle, LogOut, ChevronDown, TrendingUp, Shield, Ban, UserX } from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import SuspensionModal from '../components/SuspensionModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingArtists, setPendingArtists] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin', email: 'admin@spotmystar.com' });
  const profileMenuRef = useRef(null);
  const [managedUsers, setManagedUsers] = useState([]);
  const [managedArtists, setManagedArtists] = useState([]);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
      return;
    }
    
    const storedInfo = localStorage.getItem('adminInfo');
    if (storedInfo) {
      setAdminInfo(JSON.parse(storedInfo));
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchData();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, artistsRes, usersRes, bookingsRes, managedUsersRes, managedArtistsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/artists'),
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings').catch(() => ({ data: [] })),
        api.get('/api/user-management/users').catch(() => ({ data: [] })),
        api.get('/api/user-management/artists').catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data);
      setAllArtists(artistsRes.data);
      setPendingArtists(artistsRes.data.filter(a => a.status === 'submitted' || a.status === 'pending'));
      setAllUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setManagedUsers(managedUsersRes.data);
      setManagedArtists(managedArtistsRes.data);
    } catch (error) {
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleArtistAction = async (artistId, action) => {
    try {
      let isVerified = false;
      let status = 'pending';
      
      if (action === 'accept') {
        isVerified = true;
        status = 'active';
      } else if (action === 'reject') {
        isVerified = false;
        status = 'rejected';
      }
      
      await api.patch(`/api/admin/artists/${artistId}/verify`, { isVerified, status });
      
      setToast({ 
        message: action === 'accept' ? 'Artist approved successfully!' : action === 'reject' ? 'Artist rejected' : 'Action completed', 
        type: 'success' 
      });
      
      fetchData();
    } catch (error) {
      setToast({ message: 'Action failed', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleManageUser = (user, userType) => {
    setSelectedUser(user);
    setSelectedUserType(userType);
    setShowSuspensionModal(true);
  };

  const handleStatusUpdate = async (data) => {
    try {
      const endpoint = selectedUserType === 'user' 
        ? `/api/user-management/users/${selectedUser.id}/status`
        : `/api/user-management/artists/${selectedUser.id}/status`;
      
      await api.patch(endpoint, data);
      
      setToast({ 
        message: `Account ${data.status === 'active' ? 'reactivated' : data.status === 'terminated' ? 'terminated' : data.status === 'inactive' ? 'deactivated' : 'suspended'} successfully!`, 
        type: 'success' 
      });
      
      fetchData();
    } catch (error) {
      setToast({ message: 'Failed to update account status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header with Profile Dropdown */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SpotMyStar" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                SpotMyStar Admin
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage your platform</p>
            </div>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <UserCircle size={24} />
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-sm">{adminInfo.name}</p>
                <p className="text-xs text-gray-400">{adminInfo.email}</p>
              </div>
              <ChevronDown size={20} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden animate-slide-in-right">
                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-gray-700">
                  <p className="font-semibold">{adminInfo.name}</p>
                  <p className="text-sm text-gray-400">{adminInfo.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-red-400"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Stats Cards */}
      {stats && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="text-blue-400" size={28} />
                  </div>
                  <TrendingUp className="text-blue-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{stats.users.total}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <UserCheck className="text-green-400" size={28} />
                  </div>
                  <TrendingUp className="text-green-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{stats.artists.active}</p>
                <p className="text-gray-400 text-sm">Active Artists</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 p-6 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Clock className="text-yellow-400" size={28} />
                  </div>
                  <TrendingUp className="text-yellow-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{stats.artists.pending}</p>
                <p className="text-gray-400 text-sm">Pending Approvals</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Calendar className="text-purple-400" size={28} />
                  </div>
                  <TrendingUp className="text-purple-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{stats.bookings.total}</p>
                <p className="text-gray-400 text-sm">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50 px-6">
        <div className="flex gap-2 overflow-x-auto">
          {['overview', 'pending', 'artists', 'users', 'bookings', 'user-management'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium capitalize transition-all duration-300 whitespace-nowrap relative ${
                activeTab === tab 
                  ? 'text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'pending' ? 'Pending Approvals' : tab === 'user-management' ? 'User Management' : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Platform Statistics</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-xl transition-all duration-300">
                <h4 className="font-semibold mb-4 text-lg">Artists Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-bold text-xl">{stats.artists.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Active:</span>
                    <span className="text-green-400 font-semibold">{stats.artists.active}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Pending:</span>
                    <span className="text-yellow-400 font-semibold">{stats.artists.pending}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Verified:</span>
                    <span className="text-blue-400 font-semibold">{stats.artists.verified}</span>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-xl transition-all duration-300">
                <h4 className="font-semibold mb-4 text-lg">Bookings Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-bold text-xl">{stats.bookings.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Pending:</span>
                    <span className="text-yellow-400 font-semibold">{stats.bookings.pending}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-green-400 font-semibold">{stats.bookings.completed}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Today:</span>
                    <span className="text-purple-400 font-semibold">{stats.bookings.today}</span>
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-xl transition-all duration-300">
                <h4 className="font-semibold mb-4 text-lg">Platform Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Total Users:</span>
                    <span className="font-bold text-xl">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Total Artists:</span>
                    <span className="font-semibold">{stats.artists.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-400">Total Bookings:</span>
                    <span className="font-semibold">{stats.bookings.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Artists by Category</h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {stats.categoryBreakdown.map((cat, idx) => (
                    <div key={idx} className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="text-center">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{cat.count}</p>
                        <p className="text-gray-400 text-sm">{cat.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Pending Artist Approvals
              </h2>
              <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                {pendingArtists.length} Pending
              </span>
            </div>
            
            {pendingArtists.length === 0 ? (
              <div className="card text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-800/30">
                <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                <p className="text-gray-400 text-lg">No pending approvals</p>
                <p className="text-gray-500 text-sm mt-2">All artist registrations have been reviewed</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingArtists.map(artist => (
                  <div key={artist.id} className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-white">{artist.full_name}</h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-400">🎭 Stage Name: <span className="text-white">{artist.stage_name}</span></p>
                          <p className="text-gray-400">📂 Category: <span className="text-blue-400">{artist.category_name}</span></p>
                          <p className="text-gray-400">📧 Email: <span className="text-white">{artist.email}</span></p>
                          <p className="text-gray-400">📱 WhatsApp: <span className="text-white">{artist.whatsapp}</span></p>
                          <p className="text-gray-400">📍 City: <span className="text-white">{artist.city}</span></p>
                          <p className="text-gray-400">💰 Price: <span className="text-green-400">₹{artist.price_min} - ₹{artist.price_max}</span></p>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">📅 Registered: {new Date(artist.created_at).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleArtistAction(artist.id, 'accept')}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-2 font-semibold"
                        >
                          <CheckCircle size={20} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleArtistAction(artist.id, 'reject')}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 flex items-center gap-2 font-semibold"
                        >
                          <XCircle size={20} />
                          Reject
                        </button>
                        <button
                          onClick={() => setToast({ message: 'Artist kept in pending status', type: 'success' })}
                          className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 font-semibold"
                        >
                          <Eye size={20} />
                          Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* All Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                All Artists
              </h2>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                {allArtists.length} Total
              </span>
            </div>
            
            <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stage Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">City</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Verified</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allArtists.map(artist => (
                      <tr key={artist.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white">{artist.full_name}</td>
                        <td className="px-6 py-4 text-gray-300">{artist.stage_name}</td>
                        <td className="px-6 py-4 text-blue-400">{artist.category_name}</td>
                        <td className="px-6 py-4 text-gray-300">{artist.city}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            artist.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {artist.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {artist.is_verified ? 
                            <span className="text-green-400 text-xl">✓</span> : 
                            <span className="text-gray-500 text-xl">✗</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-gray-300">{artist.views || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                All Users
              </h2>
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
                {allUsers.length} Total
              </span>
            </div>
            
            <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 text-gray-300">{user.phone}</td>
                        <td className="px-6 py-4 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* All Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                All Bookings
              </h2>
              <span className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-full font-semibold">
                {bookings.length} Total
              </span>
            </div>
            
            {bookings.length === 0 ? (
              <div className="card text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-800/30">
                <Calendar className="mx-auto mb-4 text-purple-400" size={48} />
                <p className="text-gray-400 text-lg">No bookings yet</p>
                <p className="text-gray-500 text-sm mt-2">Bookings will appear here once users start booking artists</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{booking.full_name || booking.stage_name}</h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-400">📅 Date: <span className="text-white">{new Date(booking.event_date).toLocaleDateString()}</span></p>
                          <p className="text-gray-400">📍 Venue: <span className="text-white">{booking.venue}</span></p>
                          <p className="text-gray-400">🎭 Event: <span className="text-white">{booking.event_type}</span></p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'user-management' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                User Management
              </h2>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                  {managedUsers.length} Users
                </span>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
                  {managedArtists.length} Artists
                </span>
              </div>
            </div>

            {/* Users Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-400" />
                Regular Users
              </h3>
              <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedUsers.map(user => (
                        <tr key={user.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                          <td className="px-6 py-4 text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 text-gray-300">{user.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.account_status === 'active' ? 'bg-green-500/20 text-green-400' :
                              user.account_status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                              user.account_status === 'inactive' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {user.account_status || 'active'}
                            </span>
                            {user.suspension_end && new Date(user.suspension_end) > new Date() && (
                              <p className="text-xs text-gray-400 mt-1">
                                Until: {new Date(user.suspension_end).toLocaleString()}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleManageUser(user, 'user')}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <Shield size={16} />
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Artists Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCheck size={24} className="text-purple-400" />
                Artists
              </h3>
              <div className="card bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stage Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managedArtists.map(artist => (
                        <tr key={artist.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{artist.full_name}</td>
                          <td className="px-6 py-4 text-gray-300">{artist.stage_name}</td>
                          <td className="px-6 py-4 text-gray-300">{artist.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              artist.account_status === 'active' ? 'bg-green-500/20 text-green-400' :
                              artist.account_status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                              artist.account_status === 'inactive' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {artist.account_status || 'active'}
                            </span>
                            {artist.suspension_end && new Date(artist.suspension_end) > new Date() && (
                              <p className="text-xs text-gray-400 mt-1">
                                Until: {new Date(artist.suspension_end).toLocaleString()}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleManageUser(artist, 'artist')}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <Shield size={16} />
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suspension Modal */}
      {showSuspensionModal && (
        <SuspensionModal
          user={selectedUser}
          userType={selectedUserType}
          onClose={() => setShowSuspensionModal(false)}
          onSubmit={handleStatusUpdate}
        />
      )}
    </div>
  );
}
