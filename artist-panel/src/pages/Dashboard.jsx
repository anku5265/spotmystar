import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Video, CalendarDays, Zap, IndianRupee,
  BarChart3, MessageSquare, Settings, LogOut, Bell, Menu, X,
  Eye, TrendingUp, Clock, CheckCircle, XCircle, Star, Heart,
  AlertCircle, Camera, Edit, Plus, ChevronLeft, ChevronRight,
  ArrowUp, Sparkles, MapPin, Phone, Mail,
  Search, Send, Image as ImageIcon, Trash2, MoreVertical,
  Upload, Play, ThumbsUp, Wallet, CreditCard,
  Users, Award, Target, Activity, ExternalLink,
  Globe, Sun, Moon, Lightbulb, Calendar, Share2
} from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';

// â”€â”€â”€ Glass Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GlassCard = ({ children, className = '', hover = true, glow = false }) => (
  <div className={`
    bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl
    ${hover ? 'hover:border-purple-500/30 hover:shadow-purple-500/5 transition-all duration-300' : ''}
    ${glow ? 'animate-glow-pulse' : ''}
    ${className}
  `}>
    {children}
  </div>
);

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 hover:shadow-2xl ${c.shadow} hover:scale-[1.02] transition-all duration-300 cursor-pointer group animate-fade-in-up`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={22} />
        </div>
        {badge && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor || 'bg-green-500/20 text-green-400'}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-1 tracking-tight animate-count-up">{value ?? 0}</p>
      <p className="text-gray-300 text-sm font-semibold">{label}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
};

// â”€â”€â”€ Section Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Mini Bar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MiniBarChart = ({ data, color = 'purple' }) => {
  const max = Math.max(...data, 1);
  const gradients = {
    purple: 'from-purple-500 to-blue-400',
    green:  'from-green-500 to-emerald-400',
    blue:   'from-blue-500 to-cyan-400',
  };
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 bg-gradient-to-t ${gradients[color] || gradients.purple} rounded-t opacity-80 hover:opacity-100 transition-all cursor-pointer`}
          style={{ height: `${(v / max) * 100}%`, minHeight: '4px' }}
        />
      ))}
    </div>
  );
};

// â”€â”€â”€ Main Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ArtistDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user: authUser, isLoading, logout } = useAuth('artist');

  // â”€â”€ UI State â”€â”€
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // â”€â”€ Data State â”€â”€
  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('monthly');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // â”€â”€ Calendar State â”€â”€
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [busyDates, setBusyDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', location: '', status: 'confirmed' });

  // â”€â”€ Modal State â”€â”€
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceData, setPriceData] = useState({ min: 0, max: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestSearch, setRequestSearch] = useState('');
  const [requestSort, setRequestSort] = useState('newest');

  // â”€â”€ Chat State â”€â”€
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const [conversations] = useState([
    { id: 1, from: 'Rahul Sharma', avatar: 'R', time: '10:30 AM', preview: 'Hi! Are you available for a wedding on 15th April?', unread: 2, online: true },
    { id: 2, from: 'Priya Events Co.', avatar: 'P', time: '9:15 AM', preview: 'We loved your performance! Can we book you again?', unread: 1, online: false },
    { id: 3, from: 'DJ Night Club', avatar: 'D', time: 'Yesterday', preview: 'Please confirm the set list for Saturday.', unread: 0, online: true },
    { id: 4, from: 'Meera Kapoor', avatar: 'M', time: 'Yesterday', preview: 'What is your availability in May?', unread: 0, online: false },
  ]);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'them', text: 'Hi! Are you available for a wedding on 15th April?', time: '10:28 AM' },
    { id: 2, sender: 'me', text: 'Yes, I am available! What kind of performance are you looking for?', time: '10:30 AM' },
    { id: 3, sender: 'them', text: 'We need a 2-hour live singing performance. Budget is around â‚¹40,000.', time: '10:32 AM' },
    { id: 4, sender: 'me', text: 'That works! Let me send you my full package details.', time: '10:35 AM' },
  ]);

  // â”€â”€ Content State â”€â”€
  const [contentFilter, setContentFilter] = useState('all');
  const [reels] = useState([
    { id: 1, title: 'Wedding Performance Highlights', views: 12400, likes: 890, date: '2 days ago', trending: true },
    { id: 2, title: 'Corporate Event DJ Set', views: 8700, likes: 654, date: '1 week ago', trending: false },
    { id: 3, title: 'Stand-up Comedy Clip', views: 23100, likes: 1820, date: '2 weeks ago', trending: true },
    { id: 4, title: 'Dance Choreography Reel', views: 5600, likes: 430, date: '3 weeks ago', trending: false },
    { id: 5, title: 'Anchor Showreel 2024', views: 9200, likes: 710, date: '1 month ago', trending: false },
    { id: 6, title: 'Live Concert Snippet', views: 31000, likes: 2400, date: '1 month ago', trending: true },
  ]);

  // â”€â”€ Earnings State â”€â”€
  const [earningsFilter, setEarningsFilter] = useState('monthly');
  const [paymentHistory] = useState([
    { id: 1, event: 'Wedding â€“ Sharma Family', date: '20 Mar 2026', amount: 45000, status: 'paid' },
    { id: 2, event: 'Corporate Event â€“ TechCorp', date: '15 Mar 2026', amount: 30000, status: 'paid' },
    { id: 3, event: 'Birthday Party â€“ Gupta', date: '10 Mar 2026', amount: 15000, status: 'pending' },
    { id: 4, event: 'DJ Night â€“ Club Aura', date: '5 Mar 2026', amount: 25000, status: 'paid' },
    { id: 5, event: 'Festival Show â€“ Holi Bash', date: '28 Feb 2026', amount: 60000, status: 'paid' },
  ]);

  const earningsChartData = {
    weekly:  [12000, 18000, 9000, 25000, 15000, 30000, 22000],
    monthly: [45000, 62000, 38000, 75000, 55000, 90000, 70000, 85000, 60000, 95000, 75000, 110000],
    yearly:  [320000, 450000, 380000, 520000],
  };

  // â”€â”€ Fetch â”€â”€
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || userRole !== 'artist') return;
    if (authUser?.id) fetchAllData(localStorage.getItem('artistToken'), authUser.id);
  }, [isLoading, isAuthenticated, userRole, authUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchAllData = async (token, artistId) => {
    try {
      const res = await api.get(`/api/artists/${artistId}?skipViewCount=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data;
      setArtist(d);
      setIsAvailable(d.is_available !== false);
      setPriceData({ min: d.price_min || 0, max: d.price_max || 0 });
      if (d.availability) {
        try {
          const av = JSON.parse(d.availability);
          setBusyDates(av.busyDates || []);
          setCalendarEvents(av.events || []);
        } catch { setBusyDates([]); setCalendarEvents([]); }
      }
      await Promise.all([
        fetchAnalytics(artistId, filter),
        fetchPendingRequests(artistId),
        fetchRecentEnquiries(artistId),
        fetchUpcomingEvents(artistId),
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

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      const next = !isAvailable;
      await api.patch(`/api/artist-analytics/availability/${artist.id}`, { isAvailable: next }, { headers: { Authorization: `Bearer ${token}` } });
      setIsAvailable(next);
      setToast({ message: `Status: ${next ? 'Available âœ…' : 'Unavailable ðŸ”´'}`, type: 'success' });
    } catch { setToast({ message: 'Update failed', type: 'error' }); }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('artistToken');
      await api.patch(`/api/bookings/${bookingId}/status`, { status: action }, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ message: `Booking ${action}!`, type: 'success' });
      setSelectedRequest(null);
      await Promise.all([fetchPendingRequests(artist.id), fetchAnalytics(artist.id, filter), fetchRecentEnquiries(artist.id), fetchUpcomingEvents(artist.id)]);
    } catch { setToast({ message: 'Action failed', type: 'error' }); }
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
      setNewEvent({ title: '', startTime: '', endTime: '', location: '', status: 'confirmed' });
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

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'me', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  const getProfileCompletion = () => {
    if (!artist) return 0;
    const checks = [artist.full_name, artist.stage_name, artist.email, artist.phone || artist.whatsapp, artist.city || artist.primary_city, artist.bio || artist.short_bio, artist.price_min && artist.price_max, artist.category_id];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const getFilteredRequests = () => {
    let f = [...pendingRequests];
    if (requestSearch) f = f.filter(r => [r.user_name, r.event_location, r.event_type].some(v => v?.toLowerCase().includes(requestSearch.toLowerCase())));
    f.sort((a, b) => requestSort === 'newest' ? new Date(b.created_at) - new Date(a.created_at) : requestSort === 'event_date' ? new Date(a.event_date) - new Date(b.event_date) : (b.budget || 0) - (a.budget || 0));
    return f;
  };

  // â”€â”€ Guards â”€â”€
  if (isLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 animate-pulse">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!isAuthenticated || userRole !== 'artist' || !artist) return null;

  if (artist.status === 'pending') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <GlassCard className="text-center max-w-md w-full p-8" hover={false}>
        <div className="text-6xl mb-4 animate-float">â³</div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Under Review</h2>
        <p className="text-gray-400 text-sm mb-6">Admin approval pending. Usually takes 24â€“48 hours.</p>
        <button onClick={logout} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-all">Logout</button>
      </GlassCard>
    </div>
  );

  if (artist.status === 'rejected') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <GlassCard className="text-center max-w-md w-full p-8" hover={false}>
        <div className="text-6xl mb-4">âŒ</div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Rejected</h2>
        <p className="text-gray-400 text-sm mb-6">Please contact support for more information.</p>
        <button onClick={logout} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-all">Logout</button>
      </GlassCard>
    </div>
  );

  const profileCompletion = getProfileCompletion();
  const filteredRequests = getFilteredRequests();
  const totalEarnings = paymentHistory.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingEarnings = paymentHistory.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const topReel = [...reels].sort((a, b) => b.views - a.views)[0];

  // â”€â”€ Nav Items â”€â”€
  const navItems = [
    { id: 'home',      icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'profile',   icon: User,            label: 'My Profile' },
    { id: 'content',   icon: Video,           label: 'Content' },
    { id: 'bookings',  icon: CalendarDays,    label: 'Bookings',  badge: pendingRequests.length },
    { id: 'events',    icon: Zap,             label: 'Events' },
    { id: 'earnings',  icon: IndianRupee,     label: 'Earnings' },
    { id: 'analytics', icon: BarChart3,       label: 'Analytics' },
    { id: 'messages',  icon: MessageSquare,   label: 'Messages',  badge: conversations.filter(c => c.unread > 0).length },
    { id: 'calendar',  icon: Calendar,        label: 'Calendar' },
    { id: 'settings',  icon: Settings,        label: 'Settings' },
  ];

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: HOME
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderHome = () => (
    <div className="space-y-6 animate-fade-in-up">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-blue-900/40 to-gray-900/60 border border-purple-500/20 p-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-8 bottom-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-purple-300 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Sparkles size={14} /> SpotMyStar Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Hey {artist.stage_name || artist.full_name?.split(' ')[0]} ðŸ‘‹
            </h1>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                isAvailable
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-red-500/80 hover:bg-red-600 text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-white ${isAvailable ? 'animate-pulse' : 'opacity-60'}`} />
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
            <button
              onClick={() => setShowPriceModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
            >
              â‚¹ Update Price
            </button>
            <button
              onClick={() => navigate(`/artist/${artist.unique_id || artist.id}`)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10 flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> View Profile
            </button>
          </div>
        </div>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <div className="relative mt-5 pt-4 border-t border-white/10">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-400">Profile Completion</span>
              <span className="text-xs font-bold text-purple-300">{profileCompletion}%</span>
            </div>
            <div className="h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1.5">
              Complete your profile to get more bookings
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard icon={Eye}          label="Profile Views"    value={stats?.views?.toLocaleString() || 0}          color="blue"   badge="Live"      badgeColor="bg-green-500/20 text-green-400" onClick={() => setActiveSection('analytics')} />
        <StatCard icon={CalendarDays} label="Total Bookings"   value={stats?.bookings?.toLocaleString() || 0}        color="green"  badge={`+${stats?.filteredBookings || 0}`} badgeColor="bg-green-500/20 text-green-400" onClick={() => setActiveSection('bookings')} />
        <StatCard icon={Clock}        label="Pending"          value={stats?.pendingRequests?.toLocaleString() || 0} color="yellow" badge={stats?.pendingRequests > 0 ? 'âš¡ Action' : null} badgeColor="bg-yellow-500/20 text-yellow-400" onClick={() => setActiveSection('bookings')} />
        <StatCard icon={Star}         label="Upcoming Events"  value={stats?.upcomingEvents?.toLocaleString() || 0}  color="purple" badge="Confirmed" badgeColor="bg-purple-500/20 text-purple-400" onClick={() => setActiveSection('events')} />
        <StatCard icon={Heart}        label="Wishlist Saves"   value={stats?.wishlistCount?.toLocaleString() || 0}   color="pink"   badge="Popular"  badgeColor="bg-pink-500/20 text-pink-400" />
      </div>

      {/* AI Suggestions */}
      <GlassCard className="p-5 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-yellow-500/20 rounded-xl shrink-0 animate-float">
            <Lightbulb className="text-yellow-400" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-yellow-300 font-semibold text-sm mb-3">AI Suggestions for You</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { icon: 'ðŸŽ¬', text: 'Post more reels this week â€” your engagement is 40% higher on Tuesdays' },
                { icon: 'âš¡', text: `${pendingRequests.length} pending requests â€” respond within 24h for better ranking` },
                { icon: 'ðŸ“ˆ', text: 'Add your Instagram link to get 2x more profile visits' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 bg-yellow-500/10 hover:bg-yellow-500/15 rounded-xl p-3 transition-all cursor-pointer">
                  <span className="text-base">{s.icon}</span>
                  <p className="text-gray-300 text-xs leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Earnings Snapshot + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Earnings Snapshot */}
        <GlassCard className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-300 text-sm font-semibold">This Month's Earnings</p>
            <button onClick={() => setActiveSection('earnings')} className="text-green-400 text-xs hover:underline">View all</button>
          </div>
          <p className="text-3xl font-black text-white mb-1">â‚¹{(75000).toLocaleString()}</p>
          <p className="text-green-400 text-xs flex items-center gap-1 mb-4"><ArrowUp size={12} />+18% vs last month</p>
          <div className="h-16">
            <MiniBarChart data={[30000, 45000, 28000, 60000, 42000, 75000, 55000]} color="green" />
          </div>
        </GlassCard>

        {/* Recent Enquiries */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold">Recent Enquiries</p>
            <button onClick={() => setActiveSection('bookings')} className="text-purple-400 text-xs hover:underline">View all</button>
          </div>
          <div className="space-y-2.5">
            {recentEnquiries.length === 0 ? (
              <div className="text-center py-6 text-gray-600">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No enquiries yet</p>
              </div>
            ) : recentEnquiries.slice(0, 4).map((enq, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all group">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {enq.user_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{enq.user_name}</p>
                  <p className="text-gray-400 text-xs truncate">{enq.event_type || 'Event'} â€¢ {enq.event_location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-green-400 text-sm font-bold">â‚¹{(enq.budget || 0).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    enq.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    enq.status === 'pending'   ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{enq.status || 'pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Upcoming Events */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold">Upcoming Events</p>
          <button onClick={() => setActiveSection('events')} className="text-purple-400 text-xs hover:underline">View all</button>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <Zap size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingEvents.slice(0, 3).map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-purple-300 text-[10px] font-bold uppercase">{new Date(ev.event_date).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="text-white text-lg font-black leading-none">{new Date(ev.event_date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{ev.event_type || 'Event'}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={10} />{ev.event_location}</p>
                </div>
                <span className="text-green-400 text-sm font-bold shrink-0">â‚¹{(ev.budget || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: PROFILE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderProfile = () => (
    <div className="space-y-5 animate-fade-in-up">
      {/* Cover + Avatar */}
      <GlassCard className="overflow-hidden" hover={false}>
        {/* Cover */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-800 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)' }} />
          <button className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-xl text-white transition-all backdrop-blur-sm flex items-center gap-1.5 text-xs">
            <Camera size={14} /> Change Cover
          </button>
        </div>
        {/* Info */}
        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl border-4 border-gray-800 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                {artist.stage_name?.charAt(0) || artist.full_name?.charAt(0)}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-all shadow-lg">
                <Camera size={11} />
              </button>
            </div>
            <div className="flex-1 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{artist.stage_name || artist.full_name}</h2>
                {artist.is_verified && (
                  <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{artist.category_name || 'Artist'} â€¢ {artist.city || artist.primary_city || 'Location not set'}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30">
              <Edit size={14} /> Edit Profile
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Mail,         label: 'Email',       value: artist.email || 'Not set' },
              { icon: Phone,        label: 'Phone',       value: artist.phone || artist.whatsapp || 'Not set' },
              { icon: MapPin,       label: 'Location',    value: artist.city || artist.primary_city || 'Not set' },
              { icon: IndianRupee,  label: 'Price Range', value: artist.price_min ? `â‚¹${Number(artist.price_min).toLocaleString()} â€“ â‚¹${Number(artist.price_max).toLocaleString()}` : 'Not set' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                <item.icon className="text-purple-400 shrink-0" size={15} />
                <div className="min-w-0">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide">{item.label}</p>
                  <p className="text-white text-xs font-medium truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bio */}
        <GlassCard className="p-5">
          <SectionHeader icon={User} title="About Me" action={
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all border border-purple-500/20">
              <Edit size={12} /> Edit
            </button>
          } />
          <p className="text-gray-300 text-sm leading-relaxed">
            {artist.bio || artist.short_bio || 'No bio added yet. Add your story to attract more bookings!'}
          </p>
          {artist.languages && (
            <div className="mt-4">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(artist.languages) ? artist.languages : String(artist.languages).split(',')).map((lang, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/20">{lang.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Portfolio */}
        <GlassCard className="p-5">
          <SectionHeader icon={ImageIcon} title="Portfolio" action={
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all border border-purple-500/20">
              <Plus size={12} /> Add
            </button>
          } />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-700/40 rounded-xl flex items-center justify-center border border-gray-600/30 hover:border-purple-500/40 hover:bg-gray-700/60 transition-all cursor-pointer group">
                <ImageIcon className="text-gray-600 group-hover:text-purple-400 transition-colors" size={18} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Social Links */}
      <GlassCard className="p-5">
        <SectionHeader icon={Globe} title="Social Links" subtitle="Connect your social profiles" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: 'ðŸ“¸', label: 'Instagram', color: 'border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/5' },
            { icon: 'â–¶ï¸', label: 'YouTube',   color: 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5' },
            { icon: 'ðŸ¦', label: 'Twitter/X', color: 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5' },
            { icon: 'ðŸŒ', label: 'Website',   color: 'border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5' },
          ].map((s, i) => (
            <button key={i} className={`flex items-center gap-2.5 p-3 bg-gray-700/20 border ${s.color} rounded-xl transition-all text-left`}>
              <span className="text-xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-sm font-medium">{s.label}</p>
                <p className="text-gray-600 text-xs">Not connected</p>
              </div>
              <Plus className="text-gray-600 shrink-0" size={14} />
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: CONTENT
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderContent = () => (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">My Content</h2>
          <p className="text-gray-400 text-sm">{reels.length} videos â€¢ {reels.reduce((s, r) => s + r.views, 0).toLocaleString()} total views</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <div className="flex bg-gray-700/50 border border-gray-600/50 rounded-xl p-1">
            {['all', 'trending', 'recent'].map(f => (
              <button key={f} onClick={() => setContentFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${contentFilter === f ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
            <Upload size={15} /> Upload
          </button>
        </div>
      </div>

      {/* Top Performing */}
      <GlassCard className="p-4 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="text-yellow-400" size={16} />
          <span className="text-yellow-300 font-semibold text-sm">Top Performing Reel</span>
          <span className="ml-auto text-xs text-gray-500">{topReel.date}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700/60 rounded-xl flex items-center justify-center border border-yellow-500/20 shrink-0 hover:border-yellow-500/40 transition-all cursor-pointer group">
            <Play className="text-yellow-400 group-hover:scale-110 transition-transform" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{topReel.title}</p>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="text-gray-400 text-xs flex items-center gap-1"><Eye size={12} />{topReel.views.toLocaleString()}</span>
              <span className="text-gray-400 text-xs flex items-center gap-1"><ThumbsUp size={12} />{topReel.likes.toLocaleString()}</span>
              <span className="text-gray-400 text-xs flex items-center gap-1"><Share2 size={12} />Share</span>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-xs font-medium border border-yellow-500/20 transition-all shrink-0">
            ðŸš€ Boost
          </button>
        </div>
      </GlassCard>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-600/50 hover:border-purple-500/50 rounded-2xl p-8 text-center transition-all cursor-pointer group">
        <div className="p-4 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-2xl w-fit mx-auto mb-3 transition-all">
          <Upload className="text-purple-400 group-hover:scale-110 transition-transform" size={28} />
        </div>
        <p className="text-white font-semibold mb-1">Drag & drop your video here</p>
        <p className="text-gray-500 text-sm">or click to browse â€¢ MP4, MOV up to 500MB</p>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {reels
          .filter(r => contentFilter === 'all' || (contentFilter === 'trending' && r.trending) || contentFilter === 'recent')
          .map((reel) => (
          <GlassCard key={reel.id} className="overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative flex items-center justify-center">
              <Play className="text-white/40 group-hover:text-white/80 group-hover:scale-110 transition-all duration-200" size={32} />
              {reel.trending && (
                <span className="absolute top-2 left-2 bg-orange-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  ðŸ”¥ Trending
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-end p-2 gap-1">
                <button className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-all"><Edit size={12} /></button>
                <button className="p-1.5 bg-red-500/60 hover:bg-red-500/80 rounded-lg text-white transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-semibold truncate mb-1.5">{reel.title}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Eye size={10} />{reel.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><ThumbsUp size={10} />{reel.likes.toLocaleString()}</span>
                <span>{reel.date}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: BOOKINGS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderBookings = () => (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Booking Requests</h2>
          <p className="text-gray-400 text-sm">{filteredRequests.length} requests</p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input value={requestSearch} onChange={e => setRequestSearch(e.target.value)}
              placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50 w-44" />
          </div>
          <select value={requestSort} onChange={e => setRequestSort(e.target.value)}
            className="bg-gray-700/50 border border-gray-600/50 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none">
            <option value="newest">Newest</option>
            <option value="event_date">Event Date</option>
            <option value="budget_high">Highest Budget</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={44} className="mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400 font-medium">No booking requests yet</p>
          <p className="text-gray-600 text-sm mt-1">When users book you, requests will appear here</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <GlassCard key={req.id} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {req.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{req.user_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        req.status === 'rejected'  ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{req.status || 'pending'}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-gray-400 text-xs flex items-center gap-1"><Zap size={10} />{req.event_type || 'Event'}</span>
                      <span className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={10} />{req.event_location}</span>
                      <span className="text-gray-400 text-xs flex items-center gap-1"><CalendarDays size={10} />{req.event_date ? new Date(req.event_date).toLocaleDateString('en-IN') : 'TBD'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className="text-green-400 font-black text-lg">â‚¹{(req.budget || 0).toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">Offered</p>
                  </div>
                  {(!req.status || req.status === 'pending') && (
                    <div className="flex gap-2">
                      <button onClick={() => handleBookingAction(req.id, 'confirmed')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-green-500/20">
                        <CheckCircle size={13} /> Accept
                      </button>
                      <button onClick={() => handleBookingAction(req.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-all border border-red-500/30">
                        <XCircle size={13} /> Reject
                      </button>
                      <button onClick={() => setSelectedRequest(req)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold transition-all border border-blue-500/30">
                        <MessageSquare size={13} /> Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {req.message && (
                <div className="mt-3 pt-3 border-t border-gray-700/40">
                  <p className="text-gray-400 text-xs italic">"{req.message}"</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: EVENTS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderEvents = () => (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Events Management</h2>
          <p className="text-gray-400 text-sm">Create and manage your events</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
          <Plus size={15} /> Create Event
        </button>
      </div>

      {upcomingEvents.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Zap size={44} className="mx-auto mb-3 text-gray-700 animate-float" />
          <p className="text-gray-400 font-medium">No events yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first event to start selling tickets</p>
          <button className="mt-5 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
            Create Event
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((ev, i) => (
            <GlassCard key={i} className="overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{ev.event_type || 'Event'}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><MapPin size={11} />{ev.event_location}</p>
                  </div>
                  <button className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all">
                    <MoreVertical className="text-gray-500" size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-700/30 rounded-xl">
                  <CalendarDays className="text-purple-400" size={14} />
                  <span className="text-gray-300 text-sm">{new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/40">
                  <span className="text-green-400 font-bold">â‚¹{(ev.budget || 0).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"><Edit size={13} /></button>
                    <button className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: EARNINGS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderEarnings = () => {
    const chartData = earningsChartData[earningsFilter];
    const labels = {
      weekly:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      monthly: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      yearly:  ['2023','2024','2025','2026'],
    }[earningsFilter];

    return (
      <div className="space-y-5 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-white">Earnings Dashboard</h2>
          <p className="text-gray-400 text-sm">Track your income and payouts</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-500/20 rounded-xl"><Wallet className="text-green-400" size={20} /></div>
              <span className="text-gray-400 text-sm">Total Earned</span>
            </div>
            <p className="text-3xl font-black text-white">â‚¹{totalEarnings.toLocaleString()}</p>
            <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1"><ArrowUp size={11} />+12% this month</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-yellow-500/20 rounded-xl"><Clock className="text-yellow-400" size={20} /></div>
              <span className="text-gray-400 text-sm">Pending Payout</span>
            </div>
            <p className="text-3xl font-black text-white">â‚¹{pendingEarnings.toLocaleString()}</p>
            <p className="text-yellow-400 text-xs mt-1.5">Processing in 3â€“5 days</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl"><CreditCard className="text-purple-400" size={20} /></div>
              <span className="text-gray-400 text-sm">This Month</span>
            </div>
            <p className="text-3xl font-black text-white">â‚¹75,000</p>
            <button className="mt-2.5 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all">
              Withdraw
            </button>
          </div>
        </div>

        {/* Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white font-bold">Earnings Overview</p>
            <div className="flex gap-1 bg-gray-700/50 p-1 rounded-xl">
              {['weekly','monthly','yearly'].map(f => (
                <button key={f} onClick={() => setEarningsFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${earningsFilter === f ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-36 mb-2">
            {chartData.map((v, i) => {
              const max = Math.max(...chartData, 1);
              const pct = (v / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-blue-400 rounded-t-lg hover:from-purple-400 hover:to-blue-300 transition-all cursor-pointer relative"
                    style={{ height: `${pct}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      â‚¹{v.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between">
            {labels.map(l => <span key={l} className="flex-1 text-center text-gray-600 text-[10px]">{l}</span>)}
          </div>
        </GlassCard>

        {/* Payment History */}
        <GlassCard className="overflow-hidden">
          <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
            <p className="text-white font-bold">Payment History</p>
            <button className="text-purple-400 text-xs hover:underline flex items-center gap-1"><Award size={12} /> Export</button>
          </div>
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/40">
                  {['Event','Date','Amount','Status'].map(h => (
                    <th key={h} className={`text-gray-500 text-xs font-medium px-5 py-3 ${h === 'Amount' ? 'text-right' : h === 'Status' ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700/20 hover:bg-gray-700/20 transition-all">
                    <td className="px-5 py-3 text-white text-sm">{p.event}</td>
                    <td className="px-5 py-3 text-gray-400 text-sm">{p.date}</td>
                    <td className="px-5 py-3 text-right text-green-400 font-bold text-sm">â‚¹{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: ANALYTICS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderAnalytics = () => (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-gray-400 text-sm">Deep dive into your performance</p>
        </div>
        <div className="sm:ml-auto flex gap-1 bg-gray-700/50 border border-gray-600/50 p-1 rounded-xl">
          {['daily','weekly','monthly'].map(f => (
            <button key={f} onClick={() => { setFilter(f); if (artist) fetchAnalytics(artist.id, f); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Eye}      label="Profile Views"   value={stats?.views?.toLocaleString() || 0}  color="blue"   />
        <StatCard icon={Target}   label="Booking Rate"    value={`${stats?.bookings ? Math.round((stats.bookings / Math.max(stats.views || 1, 1)) * 100) : 0}%`} color="green" />
        <StatCard icon={Users}    label="Followers Growth" value="+124"                                 color="purple" />
        <StatCard icon={Activity} label="Engagement Rate" value="8.4%"                                  color="pink"   />
      </div>

      {/* Profile Views Graph */}
      <GlassCard className="p-5">
        <p className="text-white font-bold mb-4">Profile Views Over Time</p>
        <div className="flex items-end gap-1 h-40 mb-2">
          {[30,55,40,70,45,85,60,90,50,75,65,95,80,100,70,88,55,92,78,85,60,95,72,88,65,90,75,100,82,95].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-purple-500/70 to-blue-400/70 rounded-t hover:from-purple-500 hover:to-blue-400 transition-all cursor-pointer" style={{ height: `${h}%`, minHeight: '3px' }} />
          ))}
        </div>
        <div className="flex justify-between text-gray-600 text-[10px]">
          {['1','5','10','15','20','25','30'].map(d => <span key={d}>{d}</span>)}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reel Engagement */}
        <GlassCard className="p-5">
          <p className="text-white font-bold mb-4">Reel Engagement</p>
          <div className="space-y-3">
            {reels.slice(0, 5).map((reel, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center shrink-0">
                  <Play className="text-purple-400" size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{reel.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full transition-all duration-700"
                        style={{ width: `${(reel.views / 31000) * 100}%` }} />
                    </div>
                    <span className="text-gray-500 text-[10px] shrink-0">{reel.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Conversion Funnel */}
        <GlassCard className="p-5">
          <p className="text-white font-bold mb-4">Booking Conversion Funnel</p>
          <div className="space-y-4">
            {[
              { label: 'Profile Views â†’ Enquiries', value: 12, color: 'from-blue-500 to-blue-400' },
              { label: 'Enquiries â†’ Bookings',      value: 68, color: 'from-green-500 to-green-400' },
              { label: 'Bookings â†’ Completed',      value: 94, color: 'from-purple-500 to-purple-400' },
              { label: 'Repeat Clients',            value: 35, color: 'from-pink-500 to-pink-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-400 text-xs">{item.label}</span>
                  <span className="text-white text-xs font-bold">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: MESSAGES
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderMessages = () => (
    <div className="animate-fade-in-up" style={{ height: 'calc(100vh - 180px)' }}>
      <div className="flex gap-4 h-full">
        {/* Conversations */}
        <GlassCard className={`flex flex-col overflow-hidden shrink-0 ${activeChat ? 'hidden sm:flex w-72' : 'flex w-full sm:w-72'}`}>
          <div className="p-4 border-b border-gray-700/50 shrink-0">
            <p className="text-white font-bold mb-3">Messages</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll">
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => setActiveChat(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-700/30 transition-all border-b border-gray-700/20 ${activeChat?.id === conv.id ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {conv.avatar}
                  </div>
                  {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-semibold truncate">{conv.from}</p>
                    <span className="text-gray-500 text-[10px] shrink-0 ml-1">{conv.time}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{conv.preview}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Chat Window */}
        {activeChat ? (
          <GlassCard className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-700/50 shrink-0">
              <button onClick={() => setActiveChat(null)} className="sm:hidden p-1.5 hover:bg-gray-700/50 rounded-lg transition-all">
                <ChevronLeft className="text-gray-400" size={18} />
              </button>
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {activeChat.avatar}
                </div>
                {activeChat.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-800" />}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{activeChat.from}</p>
                <p className={`text-xs ${activeChat.online ? 'text-green-400' : 'text-gray-500'}`}>
                  {activeChat.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-700/60 text-gray-200 rounded-bl-sm'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/50' : 'text-gray-500'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scroll shrink-0">
              {[`Yes, I'm available!`, `My price starts at â‚¹${Number(artist.price_min || 0).toLocaleString()}`, 'Let me check my schedule', 'Can we discuss further?'].map((r, i) => (
                <button key={i} onClick={() => setChatInput(r)}
                  className="shrink-0 px-3 py-1.5 bg-gray-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 rounded-full text-xs border border-gray-600/50 hover:border-purple-500/30 transition-all">
                  {r}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50 flex gap-2 shrink-0">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50" />
              <button onClick={sendMessage}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
                <Send size={17} />
              </button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="hidden sm:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare size={44} className="mx-auto mb-3 text-gray-700 animate-float" />
              <p className="text-gray-400 font-medium">Select a conversation</p>
              <p className="text-gray-600 text-sm mt-1">Choose from the left to start chatting</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: CALENDAR
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderCalendar = () => {
    const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(<div key={`e${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const ds = date.toISOString().split('T')[0];
      const isBusy = busyDates.includes(ds);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const events = calendarEvents.filter(e => e.date === ds);

      days.push(
        <div key={day}
          onClick={() => { if (!isPast) { setSelectedDate(date); setShowEventModal(true); } }}
          onContextMenu={e => { e.preventDefault(); if (!isPast) toggleBusyDate(date); }}
          className={`aspect-square rounded-xl p-1.5 cursor-pointer transition-all flex flex-col text-xs border select-none ${
            isPast   ? 'opacity-25 cursor-not-allowed border-transparent bg-transparent' :
            isBusy   ? 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30' :
            isToday  ? 'bg-purple-500/20 border-purple-500/60 ring-2 ring-purple-500/30' :
            'bg-gray-700/20 border-gray-700/30 hover:bg-gray-700/40 hover:border-purple-500/30'
          }`}
        >
          <span className={`font-bold leading-none ${isToday ? 'text-purple-300' : isBusy ? 'text-red-300' : 'text-gray-300'}`}>{day}</span>
          {events.slice(0, 1).map((ev, idx) => (
            <div key={idx} className={`mt-0.5 px-1 py-0.5 rounded text-[9px] truncate ${
              ev.status === 'confirmed' ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'
            }`}>{ev.title}</div>
          ))}
          {events.length > 1 && <span className="text-[9px] text-gray-500">+{events.length - 1}</span>}
        </div>
      );
    }

    return (
      <div className="space-y-5 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-white">Availability Calendar</h2>
          <p className="text-gray-400 text-sm">Left-click to add event â€¢ Right-click to mark busy/free</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <GlassCard className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1))}
                className="p-2 hover:bg-gray-700/50 rounded-xl transition-all">
                <ChevronLeft className="text-gray-400" size={18} />
              </button>
              <h3 className="text-white font-bold text-lg">
                {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1))}
                className="p-2 hover:bg-gray-700/50 rounded-xl transition-all">
                <ChevronRight className="text-gray-400" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-gray-600 text-xs font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{days}</div>

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-700/40">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500/40 border border-purple-500/60 rounded" /><span className="text-gray-400 text-xs">Today</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/30 border border-red-500/40 rounded" /><span className="text-gray-400 text-xs">Busy</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500/30 rounded" /><span className="text-gray-400 text-xs">Event</span></div>
            </div>
          </GlassCard>

          {/* Upcoming Events List */}
          <GlassCard className="p-5">
            <p className="text-white font-bold mb-4">Scheduled Events</p>
            {calendarEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No events scheduled</p>
                <p className="text-xs mt-1">Click on a date to add</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto custom-scroll max-h-80">
                {calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map((ev, i) => (
                  <div key={i} className="p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all">
                    <div className="flex items-start justify-between">
                      <p className="text-white text-sm font-semibold">{ev.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        ev.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{ev.status}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    {ev.location && <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><MapPin size={10} />{ev.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  SECTION: SETTINGS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const renderSettings = () => (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm">Manage your account preferences</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          { title: 'ðŸ” Account', items: ['Change Password', 'Update Email', 'Phone Number', 'Two-Factor Auth'] },
          { title: 'ðŸ”” Notifications', items: ['Booking Alerts', 'Payment Alerts', 'New Followers', 'Marketing Emails'] },
          { title: 'ðŸ”’ Privacy', items: ['Profile Visibility', 'Contact Info', 'Block Users', 'Data Export'] },
          { title: 'ðŸŽ¨ Appearance', items: ['Theme', 'Language', 'Currency', 'Timezone'] },
        ].map((section, i) => (
          <GlassCard key={i} className="p-5">
            <p className="text-white font-bold mb-4">{section.title}</p>
            <div className="space-y-1.5">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl cursor-pointer transition-all group">
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{item}</span>
                  <ChevronRight className="text-gray-600 group-hover:text-gray-400 transition-colors" size={15} />
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="p-5 border-red-500/20 bg-red-500/5">
        <p className="text-white font-bold mb-1">Danger Zone</p>
        <p className="text-gray-500 text-xs mb-4">These actions are irreversible. Please be careful.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium border border-red-500/20 transition-all">
            Deactivate Account
          </button>
          <button className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium border border-red-500/20 transition-all">
            Delete Account Permanently
          </button>
        </div>
      </GlassCard>
    </div>
  );

  const sectionMap = {
    home: renderHome, profile: renderProfile, content: renderContent,
    bookings: renderBookings, events: renderEvents, earnings: renderEarnings,
    analytics: renderAnalytics, messages: renderMessages, calendar: renderCalendar,
    settings: renderSettings,
  };


  // MAIN RENDER
  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={['fixed top-0 left-0 h-full z-50 flex flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl transition-all duration-300',sidebarOpen?'translate-x-0 w-64':'-translate-x-full w-64 lg:translate-x-0',sidebarCollapsed?'lg:w-[72px]':'lg:w-64'].join(' ')}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700/50 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
            <Star className="text-white" size={18} />
          </div>
          {!sidebarCollapsed && <span className="text-white font-black text-lg tracking-tight">SpotMyStar</span>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="ml-auto hidden lg:flex p-1.5 hover:bg-gray-700/50 rounded-lg transition-all text-gray-500 hover:text-white">
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(artist.stage_name || artist.full_name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{artist.stage_name || artist.full_name}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <span className={`text-xs ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} title={sidebarCollapsed ? item.label : undefined}
              className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',activeSection===item.id?'bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-white border border-purple-500/30':'text-gray-400 hover:text-white hover:bg-gray-700/40'].join(' ')}>
              {activeSection === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-500 rounded-r-full" />}
              <item.icon size={19} className={`shrink-0 transition-transform group-hover:scale-110 ${activeSection===item.id?'text-purple-400':''}`} />
              {!sidebarCollapsed && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
              {!sidebarCollapsed && item.badge > 0 && <span className="bg-purple-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">{item.badge > 9 ? '9+' : item.badge}</span>}
              {sidebarCollapsed && item.badge > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />}
            </button>
          ))}
        </nav>
        <div className="px-2 py-3 border-t border-gray-700/50 shrink-0 space-y-0.5">
          <button onClick={toggleAvailability} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isAvailable?'text-green-400 hover:bg-green-500/10':'text-red-400 hover:bg-red-500/10'}`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${isAvailable?'bg-green-400 animate-pulse':'bg-red-400'}`} />
            {!sidebarCollapsed && (isAvailable ? 'Available' : 'Unavailable')}
          </button>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <LogOut size={18} className="shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed?'lg:ml-[72px]':'lg:ml-64'}`}>
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-4 sm:px-6 py-3.5 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-700/50 rounded-xl transition-all text-gray-400 hover:text-white"><Menu size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight capitalize">{navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}</h1>
            <p className="text-gray-500 text-xs hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input placeholder="Search..." className="pl-8 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50 w-36 focus:w-48 transition-all" />
            </div>
            <div className="relative z-[100]"><NotificationBell userType="artist" userId={artist.id} /></div>
            <button onClick={() => setActiveSection('profile')} className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-all">
              {(artist.stage_name || artist.full_name || 'A').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">
          {(sectionMap[activeSection] || renderHome)()}
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-1 py-2">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative ${activeSection===item.id?'text-purple-400':'text-gray-500 hover:text-gray-300'}`}>
              {activeSection === item.id && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-purple-500 rounded-full" />}
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge > 0 && <span className="absolute top-0.5 right-1 bg-purple-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.badge > 9 ? '9+' : item.badge}</span>}
            </button>
          ))}
          <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all">
            <Menu size={20} /><span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Update Pricing</h3>
              <button onClick={() => setShowPriceModal(false)} className="p-1.5 hover:bg-gray-700/50 rounded-lg"><X className="text-gray-400" size={18} /></button>
            </div>
            <div className="space-y-4">
              {[{label:'Minimum Price (Rs)',key:'min'},{label:'Maximum Price (Rs)',key:'max'}].map(f => (
                <div key={f.key}>
                  <label className="text-gray-400 text-sm mb-1.5 block">{f.label}</label>
                  <input type="number" value={priceData[f.key]} onChange={e => setPriceData({...priceData,[f.key]:e.target.value})} className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl focus:outline-none focus:border-purple-500/50" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPriceModal(false)} className="flex-1 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={updatePrice} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90">Save</button>
            </div>
          </GlassCard>
        </div>
      )}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6" hover={false}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-lg">Add Event</h3>
              <button onClick={() => setShowEventModal(false)} className="p-1.5 hover:bg-gray-700/50 rounded-lg"><X className="text-gray-400" size={18} /></button>
            </div>
            <p className="text-purple-300 text-sm mb-4">{selectedDate.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
            <div className="space-y-3">
              {[{label:'Event Title',key:'title',type:'text',placeholder:'e.g. Wedding Performance'},{label:'Start Time',key:'startTime',type:'time',placeholder:''},{label:'End Time',key:'endTime',type:'time',placeholder:''},{label:'Location',key:'location',type:'text',placeholder:'Venue name or city'}].map(f => (
                <div key={f.key}>
                  <label className="text-gray-400 text-xs mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={newEvent[f.key]} onChange={e => setNewEvent({...newEvent,[f.key]:e.target.value})} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Status</label>
                <select value={newEvent.status} onChange={e => setNewEvent({...newEvent,status:e.target.value})} className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white text-sm rounded-xl focus:outline-none focus:border-purple-500/50">
                  <option value="confirmed">Confirmed</option>
                  <option value="tentative">Tentative</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEventModal(false)} className="flex-1 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={addCalendarEvent} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90">Add Event</button>
            </div>
          </GlassCard>
        </div>
      )}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Booking Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1.5 hover:bg-gray-700/50 rounded-lg"><X className="text-gray-400" size={18} /></button>
            </div>
            <div className="space-y-2.5 mb-5">
              {[{label:'Client',value:selectedRequest.user_name},{label:'Event Type',value:selectedRequest.event_type||'Not specified'},{label:'Location',value:selectedRequest.event_location},{label:'Date',value:selectedRequest.event_date?new Date(selectedRequest.event_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'TBD'},{label:'Offered Budget',value:'Rs '+Number(selectedRequest.budget||0).toLocaleString()}].map((item,i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl">
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-semibold">{item.value}</span>
                </div>
              ))}
              {selectedRequest.message && (
                <div className="p-3 bg-gray-700/30 rounded-xl">
                  <p className="text-gray-500 text-xs mb-1">Client Message</p>
                  <p className="text-gray-200 text-sm italic">"{selectedRequest.message}"</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleBookingAction(selectedRequest.id,'confirmed')} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle size={15} /> Accept
              </button>
              <button onClick={() => handleBookingAction(selectedRequest.id,'rejected')} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-semibold border border-red-500/30 flex items-center justify-center gap-1.5">
                <XCircle size={15} /> Reject
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}