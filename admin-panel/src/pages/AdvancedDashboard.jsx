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
      const [analyticsRes, riskFlagsRes, auditLogRes] = await Promise.all([
        api.get('/api/admin-advanced/analytics/dashboard'),
        api.get('/api/admin-advanced/risk-flags?resolved=false'),
        api.get('/api/admin-advanced/audit-log?limit=10')
      ]);
      
      setAnalytics(analyticsRes.data);
      setRiskFlags(riskFlagsRes.data);
      setAuditLog(auditLogRes.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Advanced Dashboard...</p>
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
            <img src="/logo.svg" alt="SpotMyStar" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                SpotMyStar Advanced Admin
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

        {/* Artist Management Tab */}
        {activeTab === 'artists' && (
          <AdvancedArtistManagement />
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'bookings' && (
          <div className="text-center py-16">
            <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">Advanced Booking Management</h3>
            <p className="text-gray-400">Coming soon - Comprehensive booking lifecycle control</p>
          </div>
        )}

        {activeTab === 'risk-management' && (
          <div className="text-center py-16">
            <Shield className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">Risk Management System</h3>
            <p className="text-gray-400">Coming soon - Advanced risk detection and management</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-16">
            <TrendingUp className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-400">Coming soon - Comprehensive platform analytics</p>
          </div>
        )}

        {activeTab === 'audit-log' && (
          <div className="text-center py-16">
            <FileText className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">Complete Audit Log</h3>
            <p className="text-gray-400">Coming soon - Full activity tracking and audit trail</p>
          </div>
        )}
      </div>
    </div>
  );
}