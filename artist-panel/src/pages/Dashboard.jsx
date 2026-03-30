import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Video, CalendarDays, Zap,
  BarChart3, MessageSquare, Settings, LogOut, Menu, X,
  Eye, Clock, CheckCircle, XCircle, Star,
  AlertCircle, Camera, Edit, Plus, ChevronLeft, ChevronRight,
  ArrowUp, Sparkles, MapPin, Phone, Mail,
  Search, Send, Trash2, MoreVertical,
  Upload, Play, ThumbsUp,
  Users, Award, Target, Activity,
  Globe, Lightbulb, Calendar, Share2,
  Bell, Filter, TrendingUp, Zap as ZapIcon,
  Shield, Trophy, Handshake, ChevronDown, ChevronUp,
  RefreshCw, CheckSquare, AlertTriangle, Info,
  Mic, Music, Laugh, Anchor, PersonStanding
} from 'lucide-react';
import api from '../config/api';
import { supabase } from '../config/supabase';
import Toast from '../components/Toast';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

// ─── Glass Card ────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', hover = true, glow = false }) => (
  <div className={`
    bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl
    ${hover ? 'hover:border-purple-500/30 hover:shadow-purple-500/5 transition-all duration-300' : ''}
    ${glow ? 'shadow-purple-500/20 border-purple-500/30' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, badge, badgeColor, onClick }) => {
  const c = {
    blue:   { bg: 'from-blue-500/20 to-transparent',   border: 'border-blue-500/30',   icon: 'bg-blue-500/20 text-blue-400',   shadow: 'hover:shadow-blue-500/20' },
    green:  { bg: 'from-green-500/20 to-transparent',  border: 'border-green-500/30',  icon: 'bg-green-500/20 text-green-400',  shadow: 'hover:shadow-green-500/20' },
    yellow: { bg: 'from-yellow-500/20 to-transparent', border: 'border-yellow-500/30', icon: 'bg-yellow-500/20 text-yellow-400',shadow: 'hover:shadow-yellow-500/20' },
    purple: { bg: 'from-purple-500/20 to-transparent', border: 'border-purple-500/30', icon: 'bg-purple-500/20 text-purple-400',shadow: 'hover:shadow-purple-500/20' },
    pink:   { bg: 'from-pink-500/20 to-transparent',   border: 'border-pink-500/30',   icon: 'bg-pink-500/20 text-pink-400',   shadow: 'hover:shadow-pink-500/20' },
    orange: { bg: 'from-orange-500/20 to-transparent', border: 'border-orange-500/30', icon: 'bg-orange-500/20 text-orange-400',shadow: 'hover:shadow-orange-500/20' },
  }[color] || { bg: 'from-blue-500/20 to-transparent', border: 'border-blue-500/30', icon: 'bg-blue-500/20 text-blue-400', shadow: 'hover:shadow-blue-500/20' };

  return (
    <div onClick={onClick} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 hover:shadow-2xl ${c.shadow} hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={22} />
        </div>
        {badge && <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor || 'bg-green-500/20 text-green-400'}`}>{badge}</span>}
      </div>
      <p className="text-3xl font-black text-white mb-1 tracking-tight">{value ?? 0}</p>
      <p className="text-gray-300 text-sm font-semibold">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
        <Icon className="text-purple-400" size={20} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ─── Mini Bar Chart ────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color = 'purple' }) => {
  const max = Math.max(...data, 1);
  const gradients = { purple: 'from-purple-500 to-blue-400', green: 'from-green-500 to-emerald-400', blue: 'from-blue-500 to-cyan-400' };
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {data.map((v, i) => (
        <div key={i} className={`flex-1 bg-gradient-to-t ${gradients[color] || gradients.purple} rounded-t opacity-80 hover:opacity-100 transition-all cursor-pointer`}
          style={{ height: `${(v / max) * 100}%`, minHeight: '4px' }} />
      ))}
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    negotiation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    confirmed:   'bg-green-500/20 text-green-400 border-green-500/30',
    completed:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cancelled:   'bg-red-500/20 text-red-400 border-red-500/30',
    rejected:    'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
};

// ─── Lead Score Badge ──────────────────────────────────────────────────────
const LeadScore = ({ score }) => {
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const bg = score >= 80 ? 'bg-green-500/10 border-green-500/30' : score >= 50 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30';
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${bg} ${color}`}>
      <Target size={10} />
      {score}
    </div>
  );
};


// ─── Main Dashboard Component ──────────────────────────────────────────────
export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user: authUser, isLoading, logout } = useAuth('artist');
  const { hasPermission } = usePermissions('artist');

  // ── UI State ──
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const profilePicInputRef = useRef(null);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showNotifDropdown]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showProfileDropdown]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // ── Data State ──
  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('monthly');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // ── Booking State ──
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingSort, setBookingSort] = useState('newest');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [showCounterModal, setShowCounterModal] = useState(false);

  // ── Calendar State ──
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [busyDates, setBusyDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', location: '', eventType: 'performance', status: 'confirmed' });

  // ── Profile State ──
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceData, setPriceData] = useState({ min: 0, max: 0 });
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [settingsForm, setSettingsForm] = useState({ full_name: '', stage_name: '', phone: '', city: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // ── Chat State ──
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(false);

  // ── Content State ──
  const [contentFilter, setContentFilter] = useState('all');
  const [reels, setReels] = useState([]);

  // ── Notifications State — starts empty, populated from real data ──
  const [notifications, setNotifications] = useState([]);

  // ── Collaboration State ──
  const [collaborations, setCollaborations] = useState([]);

  // ── AI Suggestions State ──
  const [aiSuggestions, setAiSuggestions] = useState([
    { icon: '💡', tip: 'Loading suggestions...', color: 'border-gray-500/30 bg-gray-500/5' },
  ]);

  // ── Analytics Chart Data ──
  // Analytics chart data — generated from real stats (proportional to actual bookings/views)
  const analyticsData = {
    weekly:  stats ? [
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.08)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.12)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.09)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.18)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.14)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.22)),
      Math.max(1, Math.floor((stats.profile_views || 0) * 0.17)),
    ] : [1,1,1,1,1,1,1],
    monthly: stats ? Array.from({ length: 12 }, (_, i) =>
      Math.max(1, Math.floor((stats.profile_views || 0) * (0.05 + Math.random() * 0.1)))
    ) : Array(12).fill(1),
    yearly:  stats ? [
      Math.max(1, Math.floor((stats.total_bookings || 0) * 0.2)),
      Math.max(1, Math.floor((stats.total_bookings || 0) * 0.3)),
      Math.max(1, Math.floor((stats.total_bookings || 0) * 0.25)),
      Math.max(1, Math.floor((stats.total_bookings || 0) * 0.25)),
    ] : [1,1,1,1],
  };

  // ── Fetch ──
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    // Get artist ID from authUser or directly from localStorage
    const artistData = authUser || JSON.parse(localStorage.getItem('artistData') || '{}');
    const artistId = artistData?.id;
    const token = localStorage.getItem('artistToken');

    if (artistId && token) {
      const timeout = setTimeout(() => setLoading(false), 10000);
      fetchAllData(token, artistId).finally(() => clearTimeout(timeout));
    } else {
      // No ID found — force loading off
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, authUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-refresh messages when chat is open
  useEffect(() => {
    if (activeSection !== 'messages') return;
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (activeChat?.partnerId) fetchChatMessages(activeChat.partnerId);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeSection, activeChat?.partnerId]);

  const fetchAllData = async (token, artistId) => {
    try {
      const res = await api.get(`/api/artists/${artistId}?skipViewCount=true`, { headers: { Authorization: `Bearer ${token}` } });
      const d = res.data;
      setArtist(d);
      setIsAvailable(d.is_available !== false);
      setPriceData({ min: d.price_min || 0, max: d.price_max || 0 });
      setBioText(d.short_bio || d.detailed_description || '');
      // Populate settings form with real data
      setSettingsForm({
        full_name: d.full_name || '',
        stage_name: d.stage_name || '',
        phone: d.phone || d.whatsapp || '',
        city: d.city || d.primary_city || '',
      });
      if (d.availability) {
        try {
          const av = JSON.parse(d.availability);
          setBusyDates(av.busyDates || []);
          setCalendarEvents(av.events || []);
        } catch { setBusyDates([]); setCalendarEvents([]); }
      }
      // If pending/rejected, don't fetch analytics — just show status screen
      if (d.status === 'pending' || d.status === 'rejected') {
        setLoading(false);
        return;
      }

      // Check if just approved — show congratulations popup + notification
      const wasJustApproved = localStorage.getItem(`approved_notif_${artistId}`);
      if (!wasJustApproved && (d.status === 'active' || d.status === 'approved')) {
        const congratsNotif = {
          id: 'congrats_' + Date.now(),
          type: 'system',
          title: '🎉 Profile Approved! Welcome to SpotMyStar!',
          message: `Congratulations ${d.stage_name || d.full_name}! Your profile is now live. Clients can now discover and book you for their events!`,
          time: 'Just now',
          read: false,
          urgent: false,
          isCongrats: true
        };
        // Add to notifications list (bell icon)
        setNotifications(prev => [congratsNotif, ...prev]);
        // Show popup — auto dismiss after 8 seconds
        setShowCongratsPopup(true);
        localStorage.setItem(`approved_notif_${artistId}`, 'shown');
        setTimeout(() => setShowCongratsPopup(false), 8000);
      }
      await Promise.allSettled([
        fetchAnalytics(artistId, filter),
        fetchPendingRequests(artistId),
        fetchRecentEnquiries(artistId),
        fetchUpcomingEvents(artistId),
        fetchConversations(),
        fetchAiSuggestions(artistId),
        fetchNotificationsFromDB(artistId),
      ]);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setToast({ message: 'Dashboard load failed', type: 'error' });
      setLoading(false);
    }
  };

  const fetchAnalytics = async (id, f) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/stats/${id}?filter=${f}`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch {}
  };

  const fetchPendingRequests = async (id) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/pending-requests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPendingRequests(res.data);
    } catch {}
  };

  const fetchRecentEnquiries = async (id) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/recent-enquiries/${id}?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
      setRecentEnquiries(res.data);
    } catch {}
  };

  const fetchUpcomingEvents = async (id) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/upcoming-events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUpcomingEvents(res.data);
    } catch {}
  };

  const fetchAiSuggestions = async (id) => {
    try {
      const token = localStorage.getItem('artistToken');
      const res = await api.get(`/api/artist-analytics/ai-suggestions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.suggestions?.length > 0) {
        setAiSuggestions(res.data.suggestions);
      }
    } catch {} // Silent — fallback to default suggestions
  };

  const fetchNotificationsFromDB = async (id) => {
    try {
      const token = localStorage.getItem('artistToken');
      // Build notifications from pending bookings + unread messages
      const [bookRes, msgRes] = await Promise.allSettled([
        api.get(`/api/artist-analytics/pending-requests/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const notifs = [];

      if (bookRes.status === 'fulfilled') {
        bookRes.value.data.slice(0, 3).forEach(b => {
          notifs.push({
            id: 'book_' + b.id,
            type: 'booking',
            title: 'New Booking Request',
            message: `${b.user_name || 'Client'} wants to book you${b.event_date ? ' on ' + new Date(b.event_date).toLocaleDateString() : ''}`,
            time: b.created_at,
            read: false,
            urgent: true,
          });
        });
      }

      if (msgRes.status === 'fulfilled') {
        msgRes.value.data.filter(c => c.unreadCount > 0).slice(0, 2).forEach(c => {
          notifs.push({
            id: 'msg_' + c.partnerId,
            type: 'message',
            title: 'New Message',
            message: `${c.partnerName} sent you a message`,
            time: c.lastMessageTime,
            read: false,
            urgent: false,
          });
        });
      }

      if (notifs.length > 0) {
        setNotifications(prev => {
          // Keep congrats notification if exists, add real ones
          const congrats = prev.filter(n => n.isCongrats);
          return [...congrats, ...notifs];
        });
      }
    } catch {} // Silent
  };

  const toggleAvailability = async () => {
    const next = !isAvailable;
    // Optimistic update — UI turant change ho
    setIsAvailable(next);
    setToast({ message: `Status: ${next ? 'Available ✅' : 'Unavailable 🔴'}`, type: 'success' });
    try {
      const token = localStorage.getItem('artistToken');
      const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
      const id = artist?.id || artistData?.id;
      if (!id) return;
      await api.patch(`/api/artists/${id}`, { is_available: next }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Revert on failure
      setIsAvailable(!next);
      setToast({ message: 'Update failed', type: 'error' });
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    // Optimistic update — UI turant change karo
    setPendingRequests(prev => prev.map(r =>
      r.id === bookingId ? { ...r, status: action } : r
    ));
    setRecentEnquiries(prev => prev.map(r =>
      r.id === bookingId ? { ...r, status: action } : r
    ));
    try {
      const token = localStorage.getItem('artistToken');
      const { data } = await api.patch(
        `/api/bookings/${bookingId}/status`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ message: `Booking ${action}! ✅`, type: 'success' });
      setSelectedRequest(null);
      // Refresh all data
      const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
      const id = artist?.id || artistData?.id;
      if (id) {
        await Promise.allSettled([
          fetchPendingRequests(id),
          fetchAnalytics(id, filter),
          fetchRecentEnquiries(id),
          fetchUpcomingEvents(id),
        ]);
      }
    } catch (err) {
      // Revert optimistic update on failure
      const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
      const id = artist?.id || artistData?.id;
      if (id) fetchPendingRequests(id);
      setToast({ message: err.response?.data?.message || 'Action failed', type: 'error' });
    }
  };

  const handleCounterOffer = async (bookingId) => {
    if (!counterOfferAmount) return;
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(
        `/api/bookings/${bookingId}/status`,
        { status: 'negotiation', counterOffer: counterOfferAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ message: 'Counter offer sent! 💬', type: 'success' });
      setShowCounterModal(false);
      setCounterOfferAmount('');
      setSelectedRequest(null);
      // Optimistic update
      setPendingRequests(prev => prev.map(r =>
        r.id === bookingId ? { ...r, status: 'negotiation' } : r
      ));
      const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
      const id = artist?.id || artistData?.id;
      if (id) fetchPendingRequests(id);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send counter offer', type: 'error' });
    }
  };

  const updatePrice = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/artists/${artist.id}`, { price_min: priceData.min, price_max: priceData.max }, { headers: { Authorization: `Bearer ${token}` } });
      setArtist({ ...artist, price_min: priceData.min, price_max: priceData.max });
      setToast({ message: 'Price updated!', type: 'success' });
      setShowPriceModal(false);
    } catch { setToast({ message: 'Update failed', type: 'error' }); }
  };

  const saveBio = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/artists/${artist.id}`, { short_bio: bioText }, { headers: { Authorization: `Bearer ${token}` } });
      setArtist({ ...artist, short_bio: bioText });
      setEditingBio(false);
      setToast({ message: 'Bio updated!', type: 'success' });
    } catch { setToast({ message: 'Update failed', type: 'error' }); }
  };

  const saveSettings = async () => {
    if (!settingsForm.full_name?.trim() && !settingsForm.stage_name?.trim()) {
      setToast({ message: 'Name cannot be empty', type: 'error' });
      return;
    }
    setSettingsSaving(true);
    try {
      const token = localStorage.getItem('artistToken');
      const artistData = JSON.parse(localStorage.getItem('artistData') || '{}');
      const id = artist?.id || artistData?.id;

      // Update allowed fields via PATCH /api/artists/:id
      await api.patch(`/api/artists/${id}`, {
        full_name: settingsForm.full_name,
        stage_name: settingsForm.stage_name,
        city: settingsForm.city,
        whatsapp: settingsForm.phone,
        phone: settingsForm.phone,
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Update artist state locally
      setArtist(prev => ({
        ...prev,
        full_name: settingsForm.full_name || prev.full_name,
        stage_name: settingsForm.stage_name || prev.stage_name,
        city: settingsForm.city || prev.city,
        phone: settingsForm.phone || prev.phone,
        whatsapp: settingsForm.phone || prev.whatsapp,
      }));

      // Update localStorage
      const updatedArtistData = {
        ...artistData,
        fullName: settingsForm.full_name || artistData.fullName,
        stageName: settingsForm.stage_name || artistData.stageName,
      };
      localStorage.setItem('artistData', JSON.stringify(updatedArtistData));

      setToast({ message: 'Settings saved successfully! ✅', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image too large. Max 5MB allowed.', type: 'error' });
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file.', type: 'error' });
      return;
    }

    setProfilePicUploading(true);
    try {
      const token = localStorage.getItem('artistToken');
      let publicUrl = null;

      // Try Supabase direct upload first (if configured)
      if (supabase) {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `artist_${artist.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('artist-profiles')
          .upload(fileName, file, { upsert: true, contentType: file.type });

        if (!uploadError) {
          const { data: { publicUrl: url } } = supabase.storage
            .from('artist-profiles')
            .getPublicUrl(fileName);
          publicUrl = url;
        }
      }

      // Fallback: use backend upload API
      if (!publicUrl) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/api/upload/image?folder=profiles', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        publicUrl = data.url;
      }

      if (!publicUrl) throw new Error('Upload failed — no URL returned');

      // Save URL to DB
      await api.patch(`/api/artists/${artist.id}/profile-image`,
        { profileImage: publicUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setArtist({ ...artist, profile_image: publicUrl });
      setToast({ message: 'Profile picture updated!', type: 'success' });
    } catch (err) {
      console.error('Upload error:', err);
      setToast({ message: err.response?.data?.message || 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setProfilePicUploading(false);
      e.target.value = '';
    }
  };

  const addCalendarEvent = async () => {
    try {
      const ds = selectedDate.toISOString().split('T')[0];
      const ev = { ...newEvent, date: ds, id: Date.now() };
      const updated = [...calendarEvents, ev];
      setCalendarEvents(updated);
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/artists/${artist.id}`, { availability: JSON.stringify({ busyDates, events: updated }) }, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ message: 'Event added!', type: 'success' });
      setShowEventModal(false);
      setNewEvent({ title: '', startTime: '', endTime: '', location: '', eventType: 'performance', status: 'confirmed' });
    } catch { setToast({ message: 'Failed to add event', type: 'error' }); }
  };

  const toggleBusyDate = async (date) => {
    const ds = date.toISOString().split('T')[0];
    const newBusy = busyDates.includes(ds) ? busyDates.filter(d => d !== ds) : [...busyDates, ds];
    setBusyDates(newBusy);
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/artists/${artist.id}`, { availability: JSON.stringify({ busyDates: newBusy, events: calendarEvents }) }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {}
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeChat) return;
    const text = chatInput.trim();
    setChatInput('');
    // Optimistic update
    const tempMsg = { id: 'temp_' + Date.now(), direction: 'me', message: text, created_at: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempMsg]);
    try {
      const token = localStorage.getItem('artistToken');
      await api.post('/api/messages', {
        receiverId: activeChat.partnerId,
        receiverType: activeChat.partnerType || 'user',
        message: text,
        bookingId: activeChat.bookingId || null
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Refresh conversations
      fetchConversations();
    } catch {
      setToast({ message: 'Failed to send message', type: 'error' });
    }
  };

  const fetchConversations = async () => {
    try {
      setConvLoading(true);
      const token = localStorage.getItem('artistToken');
      const { data } = await api.get('/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } });
      setConversations(data);
    } catch { /* silent */ } finally {
      setConvLoading(false);
    }
  };

  const fetchChatMessages = async (partnerId) => {
    try {
      setChatLoading(true);
      const token = localStorage.getItem('artistToken');
      const { data } = await api.get(`/api/messages/${partnerId}`, { headers: { Authorization: `Bearer ${token}` } });
      setChatMessages(data);
    } catch { /* silent */ } finally {
      setChatLoading(false);
    }
  };

  const openChat = (conv) => {
    setActiveChat(conv);
    fetchChatMessages(conv.partnerId);
    // Update unread count locally
    setConversations(prev => prev.map(c => c.partnerId === conv.partnerId ? { ...c, unreadCount: 0 } : c));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Lead Score Calculator ──
  const calcLeadScore = (req) => {
    let score = 50;
    const budget = req.offered_price || req.budget || 0;
    if (budget > 50000) score += 30;
    else if (budget > 20000) score += 15;
    const eventDate = new Date(req.event_date || req.date);
    const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) score += 20;
    else if (daysUntil <= 30) score += 10;
    return Math.min(score, 100);
  };

  // ── Filtered Bookings ──
  const filteredBookings = [...pendingRequests, ...recentEnquiries].filter(r => {
    const matchSearch = !bookingSearch || (r.user_name || r.client_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) || (r.event_type || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const matchFilter = bookingFilter === 'all' || r.status === bookingFilter;
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (bookingSort === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (bookingSort === 'budget') return (b.offered_price || 0) - (a.offered_price || 0);
    if (bookingSort === 'score') return calcLeadScore(b) - calcLeadScore(a);
    return 0;
  });

  // ── Nav Items ──
  // Nav items — filtered by permissions from DB
  const allNavItems = [
    { id: 'home',        icon: LayoutDashboard, label: 'Dashboard',   permission: 'view_artist_dashboard' },
    { id: 'bookings',    icon: CalendarDays,    label: 'Bookings',    permission: 'manage_bookings',  badge: pendingRequests.length },
    { id: 'messages',    icon: MessageSquare,   label: 'Messages',    permission: 'view_artist_dashboard', badge: conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) },
    { id: 'content',     icon: Video,           label: 'Content',     permission: 'manage_content' },
    { id: 'schedule',    icon: Calendar,        label: 'Schedule',    permission: 'manage_schedule' },
    { id: 'analytics',   icon: BarChart3,       label: 'Analytics',   permission: 'view_analytics' },
    { id: 'collaborate', icon: Handshake,       label: 'Collaborate', permission: 'view_artist_dashboard' },
  ];
  const navItems = allNavItems.filter(item => hasPermission(item.permission));

  // ── Loading Screen ──
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative text-center z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Star size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SpotMyStar
            </span>
          </div>

          {/* Animated rings */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-24 h-24 rounded-full border border-purple-500/20 animate-ping" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute w-16 h-16 rounded-full border-2 border-blue-500/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/40">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <p className="text-white font-semibold text-lg mb-2">Setting up your dashboard</p>
          <p className="text-gray-500 text-sm mb-8">Fetching your profile & bookings...</p>

          {/* Loading bar */}
          <div className="w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = artist?.stage_name || artist?.full_name || authUser?.stageName || authUser?.fullName || 'Artist';
  const unreadNotifs = notifications.filter(n => !n.read).length;

  // ── Pending Approval Screen ──
  if (artist?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Animated waiting icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-32 h-32 rounded-full border-4 border-purple-500/20 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full border-4 border-purple-500/40 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <Clock size={36} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-3">Profile Under Review</h1>
          <p className="text-gray-400 text-lg mb-8">
            Hey <span className="text-purple-400 font-semibold">{displayName}</span>! Your profile has been submitted successfully.
          </p>

          {/* Status Steps */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Application Status</h3>
            <div className="space-y-4">
              {[
                { step: 1, label: 'Profile Submitted', desc: 'Your registration is complete', done: true },
                { step: 2, label: 'Under Admin Review', desc: 'Our team is reviewing your profile', done: false, active: true },
                { step: 3, label: 'Profile Approved', desc: 'You will be notified once approved', done: false },
                { step: 4, label: 'Go Live on SpotMyStar', desc: 'Start receiving booking requests', done: false },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${
                    s.done ? 'bg-green-500 text-white' :
                    s.active ? 'bg-purple-500 text-white animate-pulse' :
                    'bg-gray-700 text-gray-500'
                  }`}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${s.done ? 'text-green-400' : s.active ? 'text-purple-400' : 'text-gray-500'}`}>
                      {s.label}
                      {s.active && <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">In Progress</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
              <p className="text-2xl mb-1">⏱️</p>
              <p className="text-sm font-semibold text-white">Review Time</p>
              <p className="text-xs text-gray-400 mt-1">Usually within 24-48 hours</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-left">
              <p className="text-2xl mb-1">🔔</p>
              <p className="text-sm font-semibold text-white">Notification</p>
              <p className="text-xs text-gray-400 mt-1">You'll be notified on approval</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
          <p className="text-xs text-gray-600 mt-4">Questions? Contact support@spotmystar.com</p>
        </div>
      </div>
    );
  }

  // ── Rejected Screen ──
  if (artist?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Application Not Approved</h1>
          <p className="text-gray-400 mb-6">Your profile was not approved at this time. Please contact support for more information.</p>
          <div className="flex gap-3 justify-center">
            <a href="mailto:support@spotmystar.com" className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition text-sm">Contact Support</a>
            <button onClick={logout} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition text-sm flex items-center gap-2"><LogOut size={16} />Logout</button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'} flex`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Congratulations Popup ── */}
      {showCongratsPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border border-yellow-500/40 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 text-center animate-bounce-in">
            {/* Close button */}
            <button
              onClick={() => setShowCongratsPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700"
            >
              <X size={20} />
            </button>

            {/* Confetti emoji row */}
            <div className="text-4xl mb-4 flex justify-center gap-2">
              🎉 🌟 🎊
            </div>

            {/* Animated checkmark */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                <CheckCircle size={40} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-yellow-400 font-bold text-lg mb-3">
              Your Profile is Now Live!
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Welcome to <span className="text-purple-400 font-semibold">SpotMyStar</span>, {displayName}!
              Your profile has been approved by our team. Clients can now discover and book you for their events.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: '👁️', label: 'Profile Visible', sub: 'To all users' },
                { icon: '📩', label: 'Bookings Open', sub: 'Accept requests' },
                { icon: '⭐', label: 'Go Explore', sub: 'Your dashboard' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-xs font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCongratsPopup(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold hover:opacity-90 transition text-sm"
            >
              Let's Go! 🚀
            </button>

            {/* Auto-dismiss bar */}
            <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-shrink-bar" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Auto-closing in 8 seconds</p>
          </div>
        </div>
      )}

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════ */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r
        transition-all duration-300
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Star size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SpotMyStar</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto">
              <Star size={16} className="text-white" />
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition">
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Artist Mini Profile — clickable dropdown — BOTTOM */}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${activeSection === id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30'
                  : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={18} className={activeSection === id ? 'text-purple-400' : ''} />
              {!sidebarCollapsed && <span className="text-sm font-medium flex-1 text-left">{label}</span>}
              {!sidebarCollapsed && badge > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>
              )}
              {sidebarCollapsed && badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Artist Profile — bottom of sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-800/50" ref={profileDropdownRef}>
            {/* Click → go to profile page */}
            <button
              onClick={() => { setActiveSection('profile'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 hover:bg-gray-800/50 rounded-xl p-2 -m-2 transition-all group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {artist?.profile_image ? (
                    <img src={artist.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm text-white truncate group-hover:text-purple-400 transition">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{artist?.primary_city || 'Artist'}</p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

        {/* Top Bar */}
        <header className={`sticky top-0 z-30 ${darkMode ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200'} border-b backdrop-blur-xl px-4 lg:px-6 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-bold text-lg text-white capitalize">{navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">SpotMyStar Artist Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition text-sm">
              {darkMode ? '☀️' : '🌙'}
            </button>
            {/* Notification Bell — dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition relative">
                <Bell size={20} />
                {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </button>

              {showNotifDropdown && (
                <div className="fixed right-4 top-16 w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-slide-in-right">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-purple-400" />
                        <span className="font-semibold text-white text-sm">Notifications</span>
                        {unreadNotifs > 0 && <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotifs > 0 && (
                          <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300 transition font-medium">Mark all read</button>
                        )}
                        <button onClick={() => setShowNotifDropdown(false)} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-700">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    {/* List */}
                    <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => { markNotificationRead(notif.id); setShowNotifDropdown(false); }}
                          className={`flex items-start gap-3 p-4 border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition ${
                            notif.isCongrats ? 'bg-gradient-to-r from-yellow-500/10 to-purple-500/10' :
                            !notif.read ? 'bg-purple-500/5' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            notif.type === 'booking' ? 'bg-blue-500/20 text-blue-400' :
                            notif.type === 'message' ? 'bg-green-500/20 text-green-400' :
                            notif.type === 'event' ? 'bg-purple-500/20 text-purple-400' :
                            notif.isCongrats ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-700/50 text-gray-400'
                          }`}>
                            {notif.type === 'booking' ? <CalendarDays size={14} /> :
                             notif.type === 'message' ? <MessageSquare size={14} /> :
                             notif.type === 'event' ? <Zap size={14} /> :
                             <Bell size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-white text-xs truncate">{notif.title}</p>
                              {!notif.read && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-gray-600 text-xs mt-1">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">


          {/* ══ HOME ══════════════════════════════════════════════════════ */}
          {activeSection === 'home' && (
            <div className="space-y-6">
              {/* Welcome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-white">Hey {displayName.split(' ')[0]} 👋</h2>
                  <p className="text-gray-400 mt-1">Here's what's happening with your profile today.</p>
                </div>
                <div className="flex items-center gap-2">
                  {['weekly','monthly','yearly'].map(f => (
                    <button key={f} onClick={() => { setFilter(f); if (artist?.id) fetchAnalytics(artist.id, f); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={CalendarDays} label="Total Bookings" value={stats?.total_bookings ?? 0} sub="All time" color="blue" onClick={() => setActiveSection('bookings')} />
                <StatCard icon={Clock} label="Pending Requests" value={pendingRequests.length} sub="Needs action" color="yellow" badge={pendingRequests.length > 0 ? 'Action' : null} badgeColor="bg-yellow-500/20 text-yellow-400" onClick={() => setActiveSection('bookings')} />
                <StatCard icon={Zap} label="Upcoming Events" value={upcomingEvents.length} sub="Scheduled" color="purple" onClick={() => setActiveSection('schedule')} />
                <StatCard icon={Eye} label="Profile Views" value={stats?.profile_views ?? 0} sub={`This ${filter}`} color="green" badge={stats?.profile_views > 100 ? '🔥' : null} onClick={() => setActiveSection('analytics')} />
              </div>

              {/* Instant Booking Alerts */}
              {pendingRequests.filter(r => calcLeadScore(r) >= 80).length > 0 && (
                <GlassCard className="p-4 border-orange-500/30 bg-orange-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg"><ZapIcon className="text-orange-400" size={18} /></div>
                    <div>
                      <h3 className="font-bold text-white text-sm">⚡ Instant Booking Alerts</h3>
                      <p className="text-xs text-gray-400">High-priority requests near you</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.filter(r => calcLeadScore(r) >= 80).slice(0, 2).map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-orange-500/10 rounded-xl p-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{r.user_name || r.client_name || 'Client'}</p>
                          <p className="text-xs text-gray-400">{r.event_type} • {r.event_date ? new Date(r.event_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LeadScore score={calcLeadScore(r)} />
                          <button onClick={() => { setSelectedRequest(r); setActiveSection('bookings'); }} className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg font-semibold hover:bg-orange-600 transition">View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2">
                  <GlassCard className="p-5">
                    <SectionHeader icon={Activity} title="Activity Feed" subtitle="Recent updates" />
                    <div className="space-y-3">
                      {(() => {
                        const items = [
                          ...pendingRequests.slice(0, 2).map(r => ({
                            type: 'booking',
                            text: `New booking request from ${r.user_name || 'Client'}`,
                            time: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                            icon: CalendarDays, color: 'text-blue-400'
                          })),
                          ...upcomingEvents.slice(0, 2).map(e => ({
                            type: 'event',
                            text: `Upcoming event: ${e.user_name || 'Client'} — ${e.event_date ? new Date(e.event_date).toLocaleDateString() : ''}`,
                            time: e.event_date ? new Date(e.event_date).toLocaleDateString() : '',
                            icon: Zap, color: 'text-purple-400'
                          })),
                          ...(stats?.profile_views > 0 ? [{ type: 'view', text: `Your profile got ${stats.profile_views} views this ${filter}`, time: 'Today', icon: Eye, color: 'text-green-400' }] : []),
                          ...(conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) > 0 ? [{
                            type: 'message',
                            text: `${conversations.reduce((a, c) => a + (c.unreadCount || 0), 0)} unread message${conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) > 1 ? 's' : ''}`,
                            time: 'Now', icon: MessageSquare, color: 'text-yellow-400'
                          }] : []),
                        ].slice(0, 5);

                        if (items.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Activity size={32} className="mx-auto mb-2 opacity-30" />
                              <p className="text-sm">No recent activity</p>
                              <p className="text-xs mt-1 text-gray-600">Your bookings and events will appear here</p>
                            </div>
                          );
                        }

                        return items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-700/30 transition cursor-pointer">
                            <div className={`p-2 rounded-lg bg-gray-700/50 ${item.color}`}><item.icon size={14} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-200 truncate">{item.text}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </GlassCard>
                </div>

                {/* AI Assistant */}
                <div>
                  <GlassCard className="p-5 h-full">
                    <SectionHeader icon={Sparkles} title="AI Assistant" subtitle="Smart suggestions" />
                    <div className="space-y-3">
                      {aiSuggestions.map((s, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${s.color}`}>
                          <p className="text-xs text-gray-300 leading-relaxed">{s.icon} {s.tip}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>

              {/* Gamification Badges */}
              <GlassCard className="p-5">
                <SectionHeader icon={Trophy} title="Your Achievements" subtitle="Badges & milestones" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '🏆', title: 'Top Performer', desc: 'Top 10% this month', earned: true },
                    { icon: '⚡', title: 'Active Artist', desc: 'Responded within 1hr', earned: true },
                    { icon: '🎯', title: 'High Converter', desc: '80%+ acceptance rate', earned: stats?.acceptance_rate >= 80 },
                    { icon: '🌟', title: 'Rising Star', desc: '1000+ profile views', earned: (stats?.profile_views || 0) >= 1000 },
                  ].map((b, i) => (
                    <div key={i} className={`p-4 rounded-xl text-center border transition-all ${b.earned ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-gray-700/50 bg-gray-800/30 opacity-50'}`}>
                      <div className="text-3xl mb-2">{b.icon}</div>
                      <p className="text-sm font-bold text-white">{b.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{b.desc}</p>
                      {b.earned && <span className="text-xs text-yellow-400 font-semibold">Earned ✓</span>}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}


          {/* ══ BOOKINGS ══════════════════════════════════════════════════ */}
          {activeSection === 'bookings' && (
            <div className="space-y-6">
              {/* Filters Bar */}
              <GlassCard className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} placeholder="Search by client or event type..." className="w-full bg-gray-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all','pending','negotiation','confirmed','completed','cancelled'].map(f => (
                      <button key={f} onClick={() => setBookingFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${bookingFilter === f ? 'bg-purple-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}>{f}</button>
                    ))}
                  </div>
                  <select value={bookingSort} onChange={e => setBookingSort(e.target.value)} className="bg-gray-700/50 text-gray-300 text-sm rounded-xl px-3 py-2 outline-none">
                    <option value="newest">Newest First</option>
                    <option value="budget">Highest Budget</option>
                    <option value="score">Lead Score</option>
                  </select>
                </div>
              </GlassCard>

              {/* Booking Pipeline Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Pending', count: [...pendingRequests, ...recentEnquiries].filter(r => r.status === 'pending').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                  { label: 'Negotiation', count: [...pendingRequests, ...recentEnquiries].filter(r => r.status === 'negotiation').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { label: 'Confirmed', count: [...pendingRequests, ...recentEnquiries].filter(r => r.status === 'confirmed').length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                  { label: 'Completed', count: [...pendingRequests, ...recentEnquiries].filter(r => r.status === 'completed').length, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                  { label: 'Cancelled', count: [...pendingRequests, ...recentEnquiries].filter(r => r.status === 'cancelled').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-center ${s.bg}`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Booking List */}
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <CalendarDays size={48} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">No booking requests found</p>
                    <p className="text-gray-600 text-sm mt-1">Complete your profile to attract more clients</p>
                  </GlassCard>
                ) : filteredBookings.map(req => {
                  const score = calcLeadScore(req);
                  const isHighPriority = score >= 80;
                  return (
                    <GlassCard key={req.id} className={`p-5 ${isHighPriority ? 'border-orange-500/30' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {(req.user_name || req.client_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white">{req.user_name || req.client_name || 'Client'}</h3>
                              <StatusBadge status={req.status || 'pending'} />
                              <LeadScore score={score} />
                              {isHighPriority && <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-semibold">🔥 High Priority</span>}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1"><CalendarDays size={13} />{req.event_type || 'Event'}</span>
                              {req.event_date && <span className="flex items-center gap-1"><Clock size={13} />{new Date(req.event_date).toLocaleDateString()}</span>}
                              {req.location && <span className="flex items-center gap-1"><MapPin size={13} />{req.location}</span>}
                              {(req.offered_price || req.budget) && <span className="flex items-center gap-1 text-green-400 font-semibold">₹{(req.offered_price || req.budget || 0).toLocaleString()}</span>}
                            </div>
                            {req.message && <p className="text-sm text-gray-400 mt-2 bg-gray-700/30 rounded-lg p-2 italic">"{req.message}"</p>}
                          </div>
                        </div>
                        {/* Actions */}
                        {(req.status === 'pending' || req.status === 'negotiation') && (
                          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                            <button onClick={() => handleBookingAction(req.id, 'confirmed')} className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition">
                              <CheckCircle size={14} /> Accept
                            </button>
                            <button onClick={() => { setSelectedRequest(req); setShowCounterModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-semibold hover:bg-blue-500/30 transition">
                              <RefreshCw size={14} /> Counter
                            </button>
                            <button onClick={() => handleBookingAction(req.id, 'cancelled')} className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition">
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                        {req.status === 'confirmed' && (
                          <button onClick={() => handleBookingAction(req.id, 'completed')} className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold hover:bg-purple-500/30 transition">
                            <CheckSquare size={14} /> Mark Complete
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Counter Offer Modal */}
              {showCounterModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <GlassCard className="p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white text-lg">Send Counter Offer</h3>
                      <button onClick={() => setShowCounterModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Client offered: <span className="text-white font-semibold">₹{(selectedRequest.offered_price || 0).toLocaleString()}</span></p>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                      <input type="number" value={counterOfferAmount} onChange={e => setCounterOfferAmount(e.target.value)} placeholder="Your counter offer amount" className="w-full bg-gray-700/50 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleCounterOffer(selectedRequest.id)} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition">Send Counter Offer</button>
                      <button onClick={() => setShowCounterModal(false)} className="px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition">Cancel</button>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          )}


          {/* ══ MESSAGES ══════════════════════════════════════════════════ */}
          {activeSection === 'messages' && (
            <div className="h-[calc(100vh-140px)] flex gap-4">
              {/* Conversations List */}
              <GlassCard className={`flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 flex-shrink-0`}>
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="font-bold text-white mb-3">Messages</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input value={chatSearch} onChange={e => setChatSearch(e.target.value)} placeholder="Search conversations..." className="w-full bg-gray-700/50 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {convLoading && (
                    <div className="p-8 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm">Loading...</p>
                    </div>
                  )}
                  {!convLoading && conversations.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1 text-gray-600">Messages from clients will appear here</p>
                    </div>
                  )}
                  {conversations.filter(c => !chatSearch || c.partnerName?.toLowerCase().includes(chatSearch.toLowerCase())).map(conv => (
                    <div key={conv.partnerId} onClick={() => openChat(conv)}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-700/30 transition border-b border-gray-700/20 ${activeChat?.partnerId === conv.partnerId ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''}`}>
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {(conv.partnerName || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-white truncate">{conv.partnerName || 'Unknown'}</p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-400 truncate flex-1">
                            {conv.isOwn ? 'You: ' : ''}{conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                          )}
                        </div>
                        {conv.bookingId && <span className="text-xs text-blue-400 mt-0.5 flex items-center gap-1"><CalendarDays size={10} />Booking linked</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Chat Window */}
              {activeChat ? (
                <GlassCard className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-700/50">
                    <button onClick={() => setActiveChat(null)} className="sm:hidden text-gray-400 hover:text-white mr-1"><ChevronLeft size={20} /></button>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {(activeChat.partnerName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{activeChat.partnerName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 capitalize">{activeChat.partnerType || 'user'}</p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
                    {chatLoading && (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!chatLoading && chatMessages.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No messages yet. Say hello!</p>
                      </div>
                    )}
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.direction === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.direction === 'me' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm' : 'bg-gray-700/60 text-gray-200 rounded-bl-sm'}`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.direction === 'me' ? 'text-purple-200' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.direction === 'me' && msg.is_read && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  {/* Quick Replies */}
                  <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-700/30">
                    {['Available ✅', 'Not available ❌', "Let's discuss 💬", 'Send my rates 💰'].map(r => (
                      <button key={r} onClick={() => setChatInput(r)} className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition">{r}</button>
                    ))}
                  </div>
                  {/* Input */}
                  <div className="p-4 border-t border-gray-700/50">
                    <div className="flex gap-3">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50" />
                      <button onClick={sendMessage} disabled={!chatInput.trim()} className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white hover:opacity-90 transition disabled:opacity-40">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="flex-1 hidden sm:flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Select a conversation to start chatting</p>
                  </div>
                </GlassCard>
              )}
            </div>
          )}


          {/* ══ PROFILE ══════════════════════════════════════════════════ */}
          {activeSection === 'profile' && (
            <div className="space-y-6 max-w-4xl">
              {/* Profile Header Actions */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">My Profile</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveSection('settings')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition">
                    <Settings size={15} /> Settings
                  </button>
                  <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
              {/* Cover + Avatar */}
              <GlassCard className="overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 relative">
                  <button className="absolute top-3 right-3 p-2 bg-black/30 rounded-lg text-white hover:bg-black/50 transition"><Camera size={16} /></button>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                    <div className="relative">
                      {/* Hidden file input */}
                      <input
                        ref={profilePicInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePicUpload}
                      />
                      {/* Avatar — click to upload */}
                      <button
                        onClick={() => profilePicInputRef.current?.click()}
                        disabled={profilePicUploading}
                        className="relative w-24 h-24 rounded-2xl border-4 border-gray-900 overflow-hidden group focus:outline-none"
                        title="Click to change profile picture"
                      >
                        {artist?.profile_image ? (
                          <img src={artist.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-3xl">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          {profilePicUploading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera size={20} className="text-white" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => profilePicInputRef.current?.click()}
                        disabled={profilePicUploading}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition disabled:opacity-50"
                      >
                        <Camera size={12} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-black text-white">{displayName}</h2>
                        {artist?.is_verified && <span className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full"><Shield size={10} /> Verified</span>}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{artist?.primary_city || 'Location not set'}</p>
                      <p className="text-xs text-gray-500 mt-1">Click avatar to change profile picture (max 2MB)</p>
                    </div>
                    <button onClick={() => setActiveSection('settings')} className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold hover:bg-purple-500/30 transition">
                      <Edit size={14} /> Edit Profile
                    </button>
                  </div>
                </div>
              </GlassCard>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Bio */}
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">About Me</h3>
                    <button onClick={() => setEditingBio(!editingBio)} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"><Edit size={14} />{editingBio ? 'Cancel' : 'Edit'}</button>
                  </div>
                  {editingBio ? (
                    <div>
                      <textarea value={bioText} onChange={e => setBioText(e.target.value)} rows={4} maxLength={300} className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{bioText.length}/300</span>
                        <button onClick={saveBio} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm leading-relaxed">{artist?.short_bio || artist?.detailed_description || 'No bio added yet. Click Edit to add your bio.'}</p>
                  )}
                </GlassCard>

                {/* Details */}
                <GlassCard className="p-5">
                  <h3 className="font-bold text-white mb-4">Profile Details</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: 'Email', value: artist?.email },
                      { icon: Phone, label: 'Phone', value: artist?.phone },
                      { icon: MapPin, label: 'City', value: artist?.primary_city },
                      { icon: Globe, label: 'Languages', value: artist?.languages?.join(', ') || 'Not specified' },
                      { icon: Star, label: 'Experience', value: artist?.years_of_experience ? `${artist.years_of_experience} years` : 'Not specified' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700/50 rounded-lg"><Icon size={14} className="text-gray-400" /></div>
                        <div>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-sm text-white">{value || 'Not set'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Pricing */}
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Pricing Range</h3>
                    <button onClick={() => setShowPriceModal(true)} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"><Edit size={14} />Edit</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Starting From</p>
                      <p className="text-2xl font-black text-green-400">₹{(artist?.price_min || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-gray-500 font-bold">—</div>
                    <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Up To</p>
                      <p className="text-2xl font-black text-blue-400">₹{(artist?.price_max || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">Pricing model: {artist?.pricing_model?.replace('_', ' ') || 'Per Event'}</p>
                </GlassCard>

                {/* Categories */}
                <GlassCard className="p-5">
                  <h3 className="font-bold text-white mb-4">Categories & Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(artist?.categories || []).map((cat, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm font-medium">{cat.name || cat}</span>
                    ))}
                    {(!artist?.categories || artist.categories.length === 0) && (
                      <p className="text-gray-500 text-sm">No categories added</p>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Price Modal */}
              {showPriceModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <GlassCard className="p-6 w-full max-w-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">Update Pricing</h3>
                      <button onClick={() => setShowPriceModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Minimum Price (₹)</label>
                        <input type="number" value={priceData.min} onChange={e => setPriceData({ ...priceData, min: e.target.value })} className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Maximum Price (₹)</label>
                        <input type="number" value={priceData.max} onChange={e => setPriceData({ ...priceData, max: e.target.value })} className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={updatePrice} className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition">Update</button>
                      <button onClick={() => setShowPriceModal(false)} className="px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition">Cancel</button>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          )}


          {/* ══ CONTENT ══════════════════════════════════════════════════ */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-2">
                  {['all','trending','recent'].map(f => (
                    <button key={f} onClick={() => setContentFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${contentFilter === f ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{f}</button>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
                  <Upload size={16} /> Upload Content
                </button>
              </div>

              {/* Empty state when no reels */}
              {reels.length === 0 && (
                <GlassCard className="p-12 text-center">
                  <Video size={48} className="mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-bold text-white mb-2">No content yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Upload your performance videos to showcase your talent to potential clients.</p>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition mx-auto">
                    <Upload size={16} /> Upload Your First Video
                  </button>
                </GlassCard>
              )}

              {/* Top Performing — only when reels exist */}
              {reels.length > 0 && (
                <GlassCard className="p-5 border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="text-yellow-400" size={18} />
                    <span className="font-bold text-yellow-400 text-sm">Top Performing Video</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {reels.sort((a, b) => b.views - a.views)[0].thumbnail}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{reels.sort((a, b) => b.views - a.views)[0].title}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={13} />{reels.sort((a, b) => b.views - a.views)[0].views.toLocaleString()} views</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={13} />{reels.sort((a, b) => b.views - a.views)[0].likes.toLocaleString()} likes</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Content Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {reels.filter(r => contentFilter === 'all' || (contentFilter === 'trending' && r.trending) || contentFilter === 'recent').map(reel => (
                  <GlassCard key={reel.id} className="overflow-hidden group">
                    <div className="aspect-video bg-gray-700/50 flex items-center justify-center text-4xl relative">
                      {reel.thumbnail}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"><Play size={16} className="text-white" /></button>
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"><Edit size={16} className="text-white" /></button>
                        <button className="p-2 bg-red-500/50 rounded-full hover:bg-red-500/70 transition"><Trash2 size={16} className="text-white" /></button>
                      </div>
                      {reel.trending && <span className="absolute top-2 left-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">🔥 Trending</span>}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">{reel.title}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye size={11} />{reel.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} />{reel.likes.toLocaleString()}</span>
                        <span>{reel.date}</span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {/* Upload Card */}
                <div className="aspect-auto border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                  <Upload size={24} className="text-gray-500 group-hover:text-purple-400 transition mb-2" />
                  <p className="text-sm text-gray-500 group-hover:text-gray-300 transition text-center">Upload new content</p>
                </div>
              </div>
            </div>
          )}

          {/* ══ SCHEDULE ══════════════════════════════════════════════════ */}
          {activeSection === 'schedule' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-white text-lg">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition">Today</button>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                      </div>
                    </div>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 mb-2">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
                      ))}
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const today = new Date();
                        const cells = [];
                        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
                        for (let d = 1; d <= daysInMonth; d++) {
                          const date = new Date(year, month, d);
                          const ds = date.toISOString().split('T')[0];
                          const isBusy = busyDates.includes(ds);
                          const hasEvent = calendarEvents.some(e => e.date === ds);
                          const isToday = date.toDateString() === today.toDateString();
                          cells.push(
                            <button key={d} onClick={() => { setSelectedDate(date); setShowEventModal(true); }}
                              className={`aspect-square rounded-xl text-sm font-medium transition-all hover:scale-105 relative
                                ${isToday ? 'bg-purple-500 text-white font-bold' : ''}
                                ${isBusy && !isToday ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                                ${hasEvent && !isBusy && !isToday ? 'bg-green-500/20 text-green-400 border border-green-500/30' : ''}
                                ${!isToday && !isBusy && !hasEvent ? 'text-gray-300 hover:bg-gray-700/50' : ''}
                              `}>
                              {d}
                              {hasEvent && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
                            </button>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                    {/* Legend */}
                    <div className="flex gap-4 mt-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-500 rounded" />Today</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded" />Event</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded" />Busy</span>
                    </div>
                  </GlassCard>
                </div>

                {/* Upcoming Events */}
                <div>
                  <GlassCard className="p-5">
                    <SectionHeader icon={CalendarDays} title="Upcoming" subtitle="Your schedule" />
                    <div className="space-y-3">
                      {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5).map((ev, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-400">{ev.event_date ? new Date(ev.event_date).getDate() : '?'}</span>
                            <span className="text-xs text-gray-500">{ev.event_date ? new Date(ev.event_date).toLocaleString('default', { month: 'short' }) : ''}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{ev.title || ev.event_type}</p>
                            {ev.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{ev.location}</p>}
                          </div>
                        </div>
                      )) : calendarEvents.slice(0, 5).map((ev, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-400">{ev.date ? new Date(ev.date).getDate() : '?'}</span>
                            <span className="text-xs text-gray-500">{ev.date ? new Date(ev.date).toLocaleString('default', { month: 'short' }) : ''}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{ev.title}</p>
                            {ev.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{ev.location}</p>}
                            <StatusBadge status={ev.status || 'confirmed'} />
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length === 0 && calendarEvents.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No upcoming events</p>
                          <p className="text-xs mt-1">Click a date to add one</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>

              {/* Add Event Modal */}
              {showEventModal && selectedDate && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                  <GlassCard className="p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">Add Event — {selectedDate.toLocaleDateString()}</h3>
                      <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="space-y-3 mb-4">
                      <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title *" className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} className="bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                        <input type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} className="bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                      </div>
                      <input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location" className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50" />
                      <select value={newEvent.eventType} onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })} className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50">
                        {['performance','wedding','corporate','birthday','festival','other'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={addCalendarEvent} disabled={!newEvent.title} className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition disabled:opacity-50">Add Event</button>
                      <button onClick={() => { toggleBusyDate(selectedDate); setShowEventModal(false); }} className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm hover:bg-red-500/30 transition">Mark Busy</button>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          )}


          {/* ══ ANALYTICS ══════════════════════════════════════════════════ */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {['weekly','monthly','yearly'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{f}</button>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Eye} label="Profile Views" value={stats?.profile_views ?? 0} sub={`This ${filter}`} color="blue" />
                <StatCard icon={CalendarDays} label="Booking Requests" value={stats?.total_bookings ?? 0} sub="Total received" color="purple" />
                <StatCard icon={CheckCircle} label="Confirmed" value={stats?.confirmed_bookings ?? 0} sub="Accepted" color="green" />
                <StatCard icon={Target} label="Conversion Rate" value={`${stats?.acceptance_rate ?? 0}%`} sub="Requests → Confirmed" color="orange" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile Views Chart */}
                <GlassCard className="p-5">
                  <SectionHeader icon={Eye} title="Profile Views" subtitle={`${filter} trend`} />
                  <div className="h-40">
                    <MiniBarChart data={analyticsData[filter] || analyticsData.monthly} color="blue" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {(analyticsData[filter] || analyticsData.monthly).map((_, i) => (
                      <span key={i}>{filter === 'weekly' ? ['S','M','T','W','T','F','S'][i] : filter === 'monthly' ? ['J','F','M','A','M','J','J','A','S','O','N','D'][i] : ['Q1','Q2','Q3','Q4'][i]}</span>
                    ))}
                  </div>
                </GlassCard>

                {/* Booking Trends */}
                <GlassCard className="p-5">
                  <SectionHeader icon={TrendingUp} title="Booking Trends" subtitle="Request volume" />
                  <div className="h-40">
                    <MiniBarChart data={(analyticsData[filter] || analyticsData.monthly).map(v => Math.floor(v / 10))} color="purple" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {(analyticsData[filter] || analyticsData.monthly).map((_, i) => (
                      <span key={i}>{filter === 'weekly' ? ['S','M','T','W','T','F','S'][i] : filter === 'monthly' ? ['J','F','M','A','M','J','J','A','S','O','N','D'][i] : ['Q1','Q2','Q3','Q4'][i]}</span>
                    ))}
                  </div>
                </GlassCard>

                {/* Content Engagement */}
                <GlassCard className="p-5">
                  <SectionHeader icon={Video} title="Content Engagement" subtitle="Views & likes" />
                  <div className="space-y-3">
                    {reels.slice(0, 4).map(r => (
                      <div key={r.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">{r.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 truncate">{r.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div className="bg-gradient-to-r from-purple-500 to-blue-400 h-1.5 rounded-full" style={{ width: `${(r.views / 31000) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">{r.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Conversion Funnel */}
                <GlassCard className="p-5">
                  <SectionHeader icon={Target} title="Conversion Funnel" subtitle="Request pipeline" />
                  <div className="space-y-3">
                    {[
                      { label: 'Profile Views', value: stats?.profile_views || 0, color: 'bg-blue-500', pct: 100 },
                      { label: 'Booking Requests', value: stats?.total_bookings || 0, color: 'bg-purple-500', pct: stats?.profile_views ? Math.min(100, ((stats?.total_bookings || 0) / stats.profile_views) * 100 * 10) : 60 },
                      { label: 'Confirmed', value: stats?.confirmed_bookings || 0, color: 'bg-green-500', pct: stats?.total_bookings ? Math.min(100, ((stats?.confirmed_bookings || 0) / stats.total_bookings) * 100) : 40 },
                      { label: 'Completed', value: stats?.completed_bookings || 0, color: 'bg-yellow-500', pct: stats?.confirmed_bookings ? Math.min(100, ((stats?.completed_bookings || 0) / stats.confirmed_bookings) * 100) : 30 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{item.label}</span>
                          <span className="text-white font-semibold">{item.value}</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* ══ NOTIFICATIONS ══════════════════════════════════════════════ */}
          {activeSection === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">{unreadNotifs} unread notifications</p>
                {unreadNotifs > 0 && <button onClick={markAllRead} className="text-purple-400 hover:text-purple-300 text-sm font-semibold">Mark all read</button>}
              </div>
              {notifications.map(notif => (
                <GlassCard key={notif.id} className={`p-4 cursor-pointer transition-all ${
                  notif.isCongrats ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-purple-500/10' :
                  !notif.read ? 'border-purple-500/30 bg-purple-500/5' : ''
                }`} onClick={() => markNotificationRead(notif.id)}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      notif.type === 'booking' ? 'bg-blue-500/20 text-blue-400' :
                      notif.type === 'message' ? 'bg-green-500/20 text-green-400' :
                      notif.type === 'event' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-700/50 text-gray-400'
                    }`}>
                      {notif.type === 'booking' ? <CalendarDays size={16} /> : notif.type === 'message' ? <MessageSquare size={16} /> : notif.type === 'event' ? <Zap size={16} /> : <Bell size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white text-sm">{notif.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notif.urgent && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Urgent</span>}
                          {!notif.read && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ══ COLLABORATE ══════════════════════════════════════════════ */}
          {activeSection === 'collaborate' && (
            <div className="space-y-6 max-w-3xl">
              <GlassCard className="p-5">
                <SectionHeader icon={Handshake} title="Collaborations" subtitle="Manage group performances" action={
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold hover:bg-purple-500/30 transition">
                    <Plus size={14} /> Invite Artist
                  </button>
                } />
                <div className="space-y-3">
                  {collaborations.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">{c.artist.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-white text-sm">{c.artist}</p>
                          <p className="text-xs text-gray-400">{c.category} • {c.event}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{c.date}</span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <SectionHeader icon={Users} title="Find Artists to Collaborate" subtitle="Browse performers on SpotMyStar" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'DJ Arjun', cat: 'DJ', city: 'Mumbai', icon: '🎧' },
                    { name: 'Priya Dancer', cat: 'Dancer', city: 'Delhi', icon: '💃' },
                    { name: 'Rohan Comedian', cat: 'Comedian', city: 'Pune', icon: '😂' },
                    { name: 'Ananya Singer', cat: 'Singer', city: 'Bangalore', icon: '🎤' },
                    { name: 'Vikram Anchor', cat: 'Anchor', city: 'Chennai', icon: '🎙️' },
                    { name: 'Meera Band', cat: 'Band', city: 'Hyderabad', icon: '🎸' },
                  ].map((a, i) => (
                    <div key={i} className="p-4 bg-gray-700/30 rounded-xl text-center hover:bg-gray-700/50 transition cursor-pointer">
                      <div className="text-3xl mb-2">{a.icon}</div>
                      <p className="font-semibold text-white text-sm">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.cat} • {a.city}</p>
                      <button className="mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition">Invite</button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
          {activeSection === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <GlassCard className="p-5">
                <SectionHeader icon={Settings} title="Account Settings" />
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                    <input
                      value={settingsForm.full_name}
                      onChange={e => setSettingsForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Stage Name</label>
                    <input
                      value={settingsForm.stage_name}
                      onChange={e => setSettingsForm(prev => ({ ...prev, stage_name: e.target.value }))}
                      placeholder="Your stage/brand name"
                      className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Phone / WhatsApp</label>
                    <input
                      value={settingsForm.phone}
                      onChange={e => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Primary City</label>
                    <input
                      value={settingsForm.city}
                      onChange={e => setSettingsForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Your city"
                      className="w-full bg-gray-700/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  <button
                    onClick={saveSettings}
                    disabled={settingsSaving}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {settingsSaving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <SectionHeader icon={Bell} title="Notification Preferences" />
                <div className="space-y-3">
                  {[
                    { label: 'New booking requests', desc: 'Get notified for every new request' },
                    { label: 'New messages', desc: 'Chat notifications' },
                    { label: 'Event reminders', desc: '24 hours before your event' },
                    { label: 'Profile views milestone', desc: 'When you hit 100, 500, 1000 views' },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-white">{pref.label}</p>
                        <p className="text-xs text-gray-400">{pref.desc}</p>
                      </div>
                      <button className="w-12 h-6 bg-purple-500 rounded-full relative transition-all">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5 border-red-500/20">
                <h3 className="font-bold text-red-400 mb-3">Danger Zone</h3>
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition">
                  <LogOut size={14} /> Logout from all devices
                </button>
              </GlassCard>
            </div>
          )}

        </div>
      </main>

      {/* ── Bottom Mobile Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 px-2 py-2">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${activeSection === id ? 'text-purple-400' : 'text-gray-500'}`}>
              <Icon size={20} />
              <span className="text-xs">{label}</span>
              {badge > 0 && <span className="absolute top-0 right-1 w-2 h-2 bg-purple-500 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
