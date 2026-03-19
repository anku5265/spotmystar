import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Clock, CheckCircle, XCircle, Eye, Calendar, 
  UserCircle, LogOut, ChevronDown, TrendingUp, Shield, Ban, UserX,
  AlertTriangle, Activity, BarChart3, Settings, Search, Filter,
  Star, Edit3, FileText, Database, Zap
} from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import AdvancedUserManagement from '../components/AdvancedUserManagement';
import AdvancedArtistManagement from '../components/AdvancedArtistManagement';
import SuspensionModal from '../components/SuspensionModal';

export default function AdvancedDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin', email: 'admin@spotmystar.com' });
  const profileMenuRef = useRef(null);
  const [riskFlags, setRiskFlags] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  
  // Original dashboard states
  const [stats, setStats] = useState(null);
  const [pendingArtists, setPendingArtists] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);
  const [managedArtists, setManagedArtists] = useState([]);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryArtists, setCategoryArtists] = useState([]);

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
    fetchDashboardData();

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes, 
        riskFlagsRes, 
        auditLogRes,
        statsRes,
        artistsRes,
        usersRes,
        bookingsRes,
        managedUsersRes,
        managedArtistsRes
      ] = await Promise.all([
        api.get('/api/admin-advanced/analytics/dashboard'),
        api.get('/api/admin-advanced/risk-flags?resolved=false'),
        api.get('/api/admin-advanced/audit-log?limit=10'),
        api.get('/api/admin/stats').catch(() => ({ data: null })),
        api.get('/api/admin/artists').catch(() => ({ data: [] })),
        api.get('/api/admin/users').catch(() => ({ data: [] })),
        api.get('/api/admin/bookings').catch(() => ({ data: [] })),
        api.get('/api/user-management/users').catch(() => ({ data: [] })),
        api.get('/api/user-management/artists').catch(() => ({ data: [] }))
      ]);
      
      setAnalytics(analyticsRes.data);
      setRiskFlags(riskFlagsRes.data);
      setAuditLog(auditLogRes.data);
      setStats(statsRes.data);
      setAllArtists(artistsRes.data);
      setPendingArtists(artistsRes.data.filter(a => a.status === 'submitted' || a.status === 'pending'));
      setAllUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setManagedUsers(managedUsersRes.data);
      setManagedArtists(managedArtistsRes.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        setTimeout(() => navigate('/'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setShowProfileMenu(false);
    navigate('/');
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Original dashboard functions
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
      
      // Update local state instead of fetching all data
      setAllArtists(prev => prev.map(a => 
        a.id === artistId ? { ...a, is_verified: isVerified, status } : a
      ));
      setPendingArtists(prev => prev.filter(a => a.id !== artistId));
      
      // Update stats locally
      if (stats) {
        setStats(prev => ({
          ...prev,
          artists: {
            ...prev.artists,
            pending: Math.max(0, prev.artists.pending - 1),
            active: action === 'accept' ? prev.artists.active + 1 : prev.artists.active,
            verified: action === 'accept' ? prev.artists.verified + 1 : prev.artists.verified
          }
        }));
      }
      
      setToast({ 
        message: action === 'accept' ? 'Artist approved successfully!' : action === 'reject' ? 'Artist rejected' : 'Action completed', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Artist action error:', error);
      setToast({ message: 'Action failed', type: 'error' });
    }
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
      
      const response = await api.patch(endpoint, data);
      
      // Update local state instead of fetching all data
      if (selectedUserType === 'user') {
        setManagedUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, ...response.data } : u
        ));
      } else {
        setManagedArtists(prev => prev.map(a => 
          a.id === selectedUser.id ? { ...a, ...response.data } : a
        ));
      }
      
      setToast({ 
        message: `Account ${data.status === 'active' ? 'reactivated' : data.status === 'terminated' ? 'terminated' : 'suspended'} successfully!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Status update error:', error);
      setToast({ message: 'Failed to update account status', type: 'error' });
    }
  };

  const handleCategoryClick = (category) => {
    const artists = allArtists.filter(a => a.category_name === category.name);
    setSelectedCategory(category);
    setCategoryArtists(artists);
    setShowCategoryModal(true);
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
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/star-logo.svg" alt="SpotMyStar" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                SpotMyStar Admin
              </h1>
              <p className="text-gray-400 text-sm mt-1">Complete platform management & control</p>
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
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden animate-slide-in-right z-50">
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

      {/* Advanced Analytics Cards */}
      {analytics && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Analytics */}
            <button
              onClick={() => setActiveTab('users')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="text-blue-400" size={28} />
                  </div>
                  <TrendingUp className="text-blue-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{analytics.users.total_users}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-green-400">{analytics.users.active_users} Active</span>
                  <span className="text-red-400">{analytics.users.high_risk_users} High Risk</span>
                </div>
              </div>
            </button>

            {/* Artists Analytics */}
            <button
              onClick={() => setActiveTab('artists')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <UserCheck className="text-purple-400" size={28} />
                  </div>
                  <Star className="text-purple-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{analytics.artists.total_artists}</p>
                <p className="text-gray-400 text-sm">Total Artists</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-green-400">{analytics.artists.verified_artists} Verified</span>
                  <span className="text-yellow-400">{analytics.artists.featured_artists} Featured</span>
                </div>
              </div>
            </button>

            {/* Bookings Analytics */}
            <button
              onClick={() => setActiveTab('bookings')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Calendar className="text-green-400" size={28} />
                  </div>
                  <BarChart3 className="text-green-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{analytics.bookings.total_bookings}</p>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-yellow-400">{analytics.bookings.pending_bookings} Pending</span>
                  <span className="text-red-400">{analytics.bookings.escalated_bookings} Escalated</span>
                </div>
              </div>
            </button>

            {/* Risk Analytics */}
            <button
              onClick={() => setActiveTab('risk-management')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-6 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Shield className="text-red-400" size={28} />
                  </div>
                  <AlertTriangle className="text-red-400 opacity-50" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">{analytics.risks.total_flags}</p>
                <p className="text-gray-400 text-sm">Risk Flags</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-yellow-400">{analytics.risks.unresolved_flags} Unresolved</span>
                  <span className="text-red-400">{analytics.risks.critical_flags} Critical</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700/50 px-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'artists', label: 'Artist Management', icon: UserCheck },
            { id: 'bookings', label: 'Booking Control', icon: Calendar },
            { id: 'risk-management', label: 'Risk Management', icon: Shield },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'audit-log', label: 'Audit Log', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap relative flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Platform Overview & Control Center
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Platform Health */}
              <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-green-400" size={24} />
                  Platform Health
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-300">User Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Users:</span>
                        <span className="font-bold text-white">{analytics.users.total_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Users:</span>
                        <span className="text-green-400 font-semibold">{analytics.users.active_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Suspended:</span>
                        <span className="text-yellow-400 font-semibold">{analytics.users.suspended_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">High Risk:</span>
                        <span className="text-red-400 font-semibold">{analytics.users.high_risk_users}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-300">Artist Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Artists:</span>
                        <span className="font-bold text-white">{analytics.artists.total_artists}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Active Artists:</span>
                        <span className="text-green-400 font-semibold">{analytics.artists.active_artists}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Verified:</span>
                        <span className="text-blue-400 font-semibold">{analytics.artists.verified_artists}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Featured:</span>
                        <span className="text-yellow-400 font-semibold">{analytics.artists.featured_artists}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Risk Flags */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" size={24} />
                  Recent Risk Flags
                </h3>
                <div className="space-y-3">
                  {riskFlags.slice(0, 5).map(flag => (
                    <div key={flag.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(flag.severity)}`}>
                          {flag.severity}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(flag.created_at)}</span>
                      </div>
                      <p className="text-sm text-white font-medium">{flag.flag_type}</p>
                      <p className="text-xs text-gray-400 mt-1">{flag.user_name} ({flag.user_type})</p>
                    </div>
                  ))}
                  {riskFlags.length === 0 && (
                    <div className="text-center py-8">
                      <Shield className="mx-auto mb-2 text-green-400" size={32} />
                      <p className="text-gray-400">No active risk flags</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Admin Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-blue-400" size={24} />
                Recent Admin Actions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Target</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Admin</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map(log => (
                      <tr key={log.id} className="border-t border-gray-700/50">
                        <td className="px-4 py-3 text-sm text-white">{log.action_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {log.target_type} #{log.target_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{log.admin_name || 'System'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{formatTimeAgo(log.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <AdvancedUserManagement />
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

        {/* Artist Management Tab */}
        {activeTab === 'artists' && (
          <AdvancedArtistManagement />
        )}

        {/* Other tabs would be implemented similarly */}
        {/* Booking Control Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Booking Control</h2>
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-semibold">{bookings.length} Total</span>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Artist</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Event Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Budget</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-t border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{b.user_name}</p>
                        <p className="text-gray-400 text-xs">{b.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{b.full_name || b.stage_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-300">{new Date(b.event_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">₹{(b.budget || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          b.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{b.event_location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto mb-3 text-gray-500" size={40} />
                  <p className="text-gray-400">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Management Tab */}
        {activeTab === 'risk-management' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Risk Management</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg"><Shield className="text-red-400" size={24} /></div>
                  <h3 className="font-bold text-white">Pending Artists</h3>
                </div>
                <p className="text-3xl font-black text-white mb-1">{pendingArtists.length}</p>
                <p className="text-gray-400 text-sm">Awaiting review</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg"><AlertTriangle className="text-yellow-400" size={24} /></div>
                  <h3 className="font-bold text-white">Pending Bookings</h3>
                </div>
                <p className="text-3xl font-black text-white mb-1">{bookings.filter(b => b.status === 'pending').length}</p>
                <p className="text-gray-400 text-sm">Need attention</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg"><CheckCircle className="text-green-400" size={24} /></div>
                  <h3 className="font-bold text-white">Active Risk Flags</h3>
                </div>
                <p className="text-3xl font-black text-white mb-1">0</p>
                <p className="text-gray-400 text-sm">All clear</p>
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="text-yellow-400" size={20} /> Pending Artist Approvals
              </h3>
              {pendingArtists.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
                  <p className="text-gray-400">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingArtists.map(artist => (
                    <div key={artist.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <div>
                        <p className="text-white font-semibold">{artist.full_name}</p>
                        <p className="text-gray-400 text-sm">{artist.stage_name} • {artist.city} • {artist.category_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleArtistAction(artist.id, 'accept')} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors">Approve</button>
                        <button onClick={() => handleArtistAction(artist.id, 'reject')} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Platform Analytics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: analytics.users.total_users, color: 'blue', sub: `${analytics.users.new_users} new` },
                { label: 'Total Artists', value: analytics.artists.total_artists, color: 'purple', sub: `${analytics.artists.pending_artists} pending` },
                { label: 'Total Bookings', value: analytics.bookings.total_bookings, color: 'green', sub: `${analytics.bookings.recent_bookings} recent` },
                { label: 'Verified Artists', value: analytics.artists.verified_artists, color: 'yellow', sub: `${analytics.artists.active_artists} active` },
              ].map(card => (
                <div key={card.label} className={`bg-gray-800/50 border border-${card.color}-500/20 rounded-xl p-6`}>
                  <p className="text-4xl font-black text-white mb-2">{card.value}</p>
                  <p className="text-gray-400 font-semibold">{card.label}</p>
                  <p className={`text-${card.color}-400 text-sm mt-1`}>{card.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Booking Status Breakdown</h3>
                <div className="space-y-3">
                  {['pending','accepted','completed','rejected'].map(s => {
                    const count = bookings.filter(b => b.status === s).length;
                    const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-300">{s}</span>
                          <span className="text-white font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div className={`h-2 rounded-full ${s==='accepted'||s==='completed'?'bg-green-500':s==='pending'?'bg-yellow-500':'bg-red-500'}`} style={{width: pct + '%'}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Artist Status Breakdown</h3>
                <div className="space-y-3">
                  {['active','pending','inactive'].map(s => {
                    const count = allArtists.filter(a => a.status === s).length;
                    const pct = allArtists.length ? Math.round((count / allArtists.length) * 100) : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-300">{s}</span>
                          <span className="text-white font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div className={`h-2 rounded-full ${s==='active'?'bg-green-500':s==='pending'?'bg-yellow-500':'bg-red-500'}`} style={{width: pct + '%'}}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit-log' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">Activity Log</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" size={20} /> Recent User Registrations
                </h3>
                <div className="space-y-3">
                  {allUsers.slice(0, 8).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{u.name || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                  {allUsers.length === 0 && <p className="text-gray-400 text-center py-4">No users yet</p>}
                </div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="text-purple-400" size={20} /> Recent Artist Registrations
                </h3>
                <div className="space-y-3">
                  {allArtists.slice(0, 8).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{a.stage_name || a.full_name}</p>
                        <p className="text-gray-400 text-xs">{a.city} • {a.category_name}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a.status}</span>
                    </div>
                  ))}
                  {allArtists.length === 0 && <p className="text-gray-400 text-center py-4">No artists yet</p>}
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="text-green-400" size={20} /> Recent Bookings
              </h3>
              <div className="space-y-3">
                {bookings.slice(0, 10).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{b.user_name} → {b.full_name || b.stage_name || 'Artist'}</p>
                      <p className="text-gray-400 text-xs">{b.event_location} • {new Date(b.event_date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${b.status === 'accepted' ? 'bg-green-500/20 text-green-400' : b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{b.status}</span>
                      <p className="text-green-400 text-xs mt-1">₹{(b.budget||0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-gray-400 text-center py-4">No bookings yet</p>}
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

      {/* Category Artists Modal */}
      {showCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedCategory.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{categoryArtists.length} artists in this category</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {categoryArtists.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto mb-4 text-gray-500" size={48} />
                  <p className="text-gray-400">No artists in this category yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {categoryArtists.map(artist => (
                    <div key={artist.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold text-white">{artist.full_name}</h4>
                            {artist.is_verified && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                ✓ Verified
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              artist.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {artist.status}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-400">🎭 Stage Name: <span className="text-white">{artist.stage_name}</span></p>
                            <p className="text-gray-400">📧 Email: <span className="text-white">{artist.email}</span></p>
                            <p className="text-gray-400">📱 WhatsApp: <span className="text-white">{artist.whatsapp}</span></p>
                            <p className="text-gray-400">📍 City: <span className="text-white">{artist.city}</span></p>
                            <p className="text-gray-400">💰 Price: <span className="text-green-400">₹{artist.price_min} - ₹{artist.price_max}</span></p>
                            <p className="text-gray-400">👁️ Views: <span className="text-white">{artist.views || 0}</span></p>
                          </div>
                          {artist.bio && (
                            <p className="text-gray-500 text-sm mt-2">📝 {artist.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}