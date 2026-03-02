import { useState, useEffect } from 'react';
import { 
  UserCheck, Search, Filter, Eye, Shield, Star, CheckCircle, 
  AlertTriangle, Clock, Edit3, MoreVertical, TrendingUp,
  Calendar, Mail, Phone, MapPin, IndianRupee, Users, Activity
} from 'lucide-react';
import api from '../config/api';
import Toast from './Toast';

export default function AdvancedArtistManagement() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    city: '',
    verified: '',
    featured: '',
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
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, artist: null });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchArtists();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      const { data } = await api.get(`/api/admin-advanced/artists/advanced?${params}`);
      setArtists(data.artists);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching artists:', error);
      setToast({ message: 'Failed to fetch artists', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleArtistUpdate = async (artistId, updateData) => {
    try {
      await api.patch(`/api/admin-advanced/artists/${artistId}/admin-update`, updateData);
      setToast({ message: 'Artist updated successfully', type: 'success' });
      fetchArtists();
      setEditModal({ show: false, artist: null });
    } catch (error) {
      console.error('Error updating artist:', error);
      setToast({ message: 'Failed to update artist', type: 'error' });
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
      case 'approved': 
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'pending': 
      case 'submitted': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'suspended': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const ArtistEditModal = ({ artist, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      status: artist.status,
      verified: artist.is_verified,
      featured: artist.featured || false,
      featuredUntil: artist.featured_until ? new Date(artist.featured_until).toISOString().slice(0, 16) : '',
      overrideAvailability: artist.override_availability || false,
      overridePriceMin: artist.admin_override_price_min || '',
      overridePriceMax: artist.admin_override_price_max || '',
      adminNotes: artist.admin_notes || '',
      verificationNotes: artist.verification_notes || '',
      reason: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(artist.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              Edit Artist: {artist.full_name}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Status & Verification */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Verified</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>

            {/* Featured Until */}
            {formData.featured && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Until
                </label>
                <input
                  type="datetime-local"
                  value={formData.featuredUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredUntil: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Price Override */}
            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.overrideAvailability}
                  onChange={(e) => setFormData(prev => ({ ...prev, overrideAvailability: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Override Pricing</span>
              </label>
              
              {formData.overrideAvailability && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Min Price (₹)</label>
                    <input
                      type="number"
                      value={formData.overridePriceMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, overridePriceMin: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Price (₹)</label>
                    <input
                      type="number"
                      value={formData.overridePriceMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, overridePriceMax: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max price"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Internal admin notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Notes
                </label>
                <textarea
                  value={formData.verificationNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationNotes: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Verification notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Changes *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  required
                  placeholder="Explain the reason for these changes..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-white transition-all"
              >
                Update Artist
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

  const ArtistDetailsModal = ({ artist, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{artist.full_name}</h3>
            <p className="text-gray-400">{artist.stage_name} • {artist.categories}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-300">{artist.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">{artist.whatsapp || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-300">{artist.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee size={16} className="text-gray-400" />
                  <span className="text-gray-300">₹{artist.price_min} - ₹{artist.price_max}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    Joined {new Date(artist.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Verification */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Status & Verification
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(artist.status)}`}>
                    {artist.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verified:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    artist.is_verified ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                  }`}>
                    {artist.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Featured:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    artist.featured ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 bg-gray-500/20'
                  }`}>
                    {artist.featured ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Score:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(artist.risk_score)}`}>
                    {artist.risk_score || 0}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Performance Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Views:</span>
                  <span className="text-white">{artist.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Bookings:</span>
                  <span className="text-white">{artist.total_bookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recent Views:</span>
                  <span className="text-white">{artist.recent_views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recent Requests:</span>
                  <span className="text-white">{artist.recent_requests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Risk Flags:</span>
                  <span className="text-red-400">{artist.risk_flags_count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Bio</h4>
              <p className="text-gray-300">{artist.bio}</p>
            </div>
          )}

          {/* Admin Notes */}
          {artist.admin_notes && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-3">Admin Notes</h4>
              <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{artist.admin_notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={() => setEditModal({ show: true, artist })}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-white transition-all flex items-center gap-2"
            >
              <Edit3 size={16} />
              Edit Artist
            </button>
            <button
              onClick={() => handleArtistUpdate(artist.id, { 
                verified: !artist.is_verified, 
                reason: `${artist.is_verified ? 'Removed' : 'Added'} verification status` 
              })}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                artist.is_verified 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <CheckCircle size={16} />
              {artist.is_verified ? 'Remove Verification' : 'Verify Artist'}
            </button>
            <button
              onClick={() => handleArtistUpdate(artist.id, { 
                featured: !artist.featured, 
                reason: `${artist.featured ? 'Removed from' : 'Added to'} featured list` 
              })}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                artist.featured 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              <Star size={16} />
              {artist.featured ? 'Unfeature' : 'Feature'}
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
            <UserCheck className="text-purple-400" size={28} />
            Advanced Artist Management
          </h2>
          <p className="text-gray-400 mt-1">Comprehensive artist oversight and control</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
            {pagination.total} Total Artists
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search artists..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="City..."
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filters.verified}
            onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>

          <select
            value={filters.featured}
            onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Artists Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading artists...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Artist</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Performance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map(artist => (
                  <tr key={artist.id} className="border-t border-gray-700/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {artist.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{artist.full_name}</p>
                          <p className="text-sm text-gray-400">{artist.stage_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {artist.is_verified && (
                              <CheckCircle size={14} className="text-green-400" />
                            )}
                            {artist.featured && (
                              <Star size={14} className="text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">{artist.email}</p>
                        <p className="text-sm text-gray-400">{artist.whatsapp || 'No WhatsApp'}</p>
                        <p className="text-sm text-gray-400">{artist.city}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                        {artist.categories}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(artist.status)}`}>
                          {artist.status}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskLevelColor(artist.risk_score)}`}>
                            Risk: {artist.risk_score || 0}
                          </span>
                          {artist.risk_flags_count > 0 && (
                            <AlertTriangle size={12} className="text-red-400" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">
                          {artist.views || 0} views
                        </p>
                        <p className="text-sm text-gray-400">
                          {artist.total_bookings || 0} bookings
                        </p>
                        <p className="text-sm text-gray-400">
                          ₹{artist.price_min}-{artist.price_max}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedArtist(artist);
                            setShowArtistModal(true);
                          }}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditModal({ show: true, artist })}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          title="Edit Artist"
                        >
                          <Edit3 size={16} />
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} artists
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded">
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
      {showArtistModal && selectedArtist && (
        <ArtistDetailsModal
          artist={selectedArtist}
          onClose={() => {
            setShowArtistModal(false);
            setSelectedArtist(null);
          }}
        />
      )}

      {editModal.show && (
        <ArtistEditModal
          artist={editModal.artist}
          onClose={() => setEditModal({ show: false, artist: null })}
          onSubmit={handleArtistUpdate}
        />
      )}
    </div>
  );
}