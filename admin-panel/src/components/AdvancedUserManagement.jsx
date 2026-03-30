import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Eye, Shield, Ban, CheckCircle, X,
  AlertTriangle, Clock, UserX, Edit3, MoreVertical,
  Calendar, Mail, Phone, MapPin, TrendingUp, Activity
} from 'lucide-react';
import api from '../config/api';
import Toast from './Toast';

export default function AdvancedUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    riskLevel: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionModal, setActionModal] = useState({ show: false, user: null, action: '' });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      const { data } = await api.get(`/api/admin-advanced/users/advanced?${params}`);
      setUsers(data.users);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({ message: 'Failed to fetch users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, statusData) => {
    try {
      await api.patch(`/api/admin-advanced/users/${userId}/status`, statusData);
      setToast({ message: 'User status updated successfully', type: 'success' });
      fetchUsers();
      setActionModal({ show: false, user: null, action: '' });
    } catch (error) {
      console.error('Error updating user status:', error);
      setToast({ message: 'Failed to update user status', type: 'error' });
    }
  };

  const getRiskLevelColor = (score) => {
    if (score <= 30) return 'text-green-400 bg-green-500/20';
    if (score <= 60) return 'text-yellow-400 bg-yellow-500/20';
    if (score <= 80) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'suspended': return 'text-yellow-400 bg-yellow-500/20';
      case 'inactive': return 'text-gray-400 bg-gray-500/20';
      case 'terminated': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const UserActionModal = ({ user, action, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      status: action === 'suspend' ? 'suspended' : action === 'activate' ? 'active' : 'terminated',
      reason: '',
      suspensionDuration: '',
      suspensionUnit: 'days',
      adminNotes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(user.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white capitalize">
              {action} User: {user.name}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
                placeholder="Provide a reason for this action..."
              />
            </div>

            {action === 'suspend' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="number"
                    value={formData.suspensionDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, suspensionDuration: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Duration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.suspensionUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, suspensionUnit: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Notes
              </label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="Internal notes (optional)..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  action === 'suspend' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  action === 'terminate' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                Confirm {action}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UserDetailsModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{user.name}</h3>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Account Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.account_status)}`}>
                    {user.account_status || 'active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Score:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(user.risk_score)}`}>
                    {user.risk_score || 0}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Login Count:</span>
                  <span className="text-white">{user.login_count || 0}</span>
                </div>
                {user.last_login && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Login:</span>
                    <span className="text-white">{new Date(user.last_login).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Activity Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Bookings:</span>
                  <span className="text-white">{user.total_bookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Flags:</span>
                  <span className="text-red-400">{user.risk_flags_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Completion:</span>
                  <span className="text-white">{user.profile_completion_score || 0}%</span>
                </div>
              </div>
            </div>

            {/* Suspension Info */}
            {user.account_status === 'suspended' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Suspension Details
                </h4>
                <div className="space-y-3">
                  {user.suspension_reason && (
                    <div>
                      <span className="text-gray-400 block">Reason:</span>
                      <span className="text-white">{user.suspension_reason}</span>
                    </div>
                  )}
                  {user.suspension_start && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Started:</span>
                      <span className="text-white">{new Date(user.suspension_start).toLocaleString()}</span>
                    </div>
                  )}
                  {user.suspension_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ends:</span>
                      <span className="text-white">{new Date(user.suspension_end).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={() => setActionModal({ show: true, user, action: 'suspend' })}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium text-white transition-all flex items-center gap-2"
              disabled={user.account_status === 'suspended'}
            >
              <Ban size={16} />
              Suspend
            </button>
            <button
              onClick={() => setActionModal({ show: true, user, action: 'activate' })}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium text-white transition-all flex items-center gap-2"
              disabled={user.account_status === 'active'}
            >
              <CheckCircle size={16} />
              Activate
            </button>
            <button
              onClick={() => setActionModal({ show: true, user, action: 'terminate' })}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium text-white transition-all flex items-center gap-2"
            >
              <UserX size={16} />
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-400" size={28} />
            Advanced User Management
          </h2>
          <p className="text-gray-400 mt-1">Comprehensive user oversight and control</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
            {pagination.total} Total Users
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk (0-30)</option>
            <option value="medium">Medium Risk (31-60)</option>
            <option value="high">High Risk (61-80)</option>
            <option value="critical">Critical Risk (81-100)</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="name-ASC">Name A-Z</option>
            <option value="name-DESC">Name Z-A</option>
            <option value="risk_score-DESC">Highest Risk</option>
            <option value="risk_score-ASC">Lowest Risk</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Risk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm font-mono text-blue-400/70">
                            {user.user_code ? `U${user.user_code}` : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">{user.email}</p>
                        <p className="text-sm text-gray-400">{user.phone || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.account_status)}`}>
                        {user.account_status || 'active'}
                      </span>
                      {user.suspension_end && new Date(user.suspension_end) > new Date() && (
                        <p className="text-xs text-gray-400 mt-1">
                          Until: {new Date(user.suspension_end).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskLevelColor(user.risk_score)}`}>
                          {user.risk_score || 0}
                        </span>
                        {user.risk_flags_count > 0 && (
                          <AlertTriangle size={16} className="text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">
                          {user.total_bookings || 0} bookings
                        </p>
                        <p className="text-sm text-gray-400">
                          {user.login_count || 0} logins
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setActionModal({ show: true, user, action: 'suspend' })}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                          title="Manage Status"
                          disabled={user.account_status === 'suspended'}
                        >
                          <Shield size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded">
                {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {actionModal.show && (
        <UserActionModal
          user={actionModal.user}
          action={actionModal.action}
          onClose={() => setActionModal({ show: false, user: null, action: '' })}
          onSubmit={handleStatusUpdate}
        />
      )}
    </div>
  );
}