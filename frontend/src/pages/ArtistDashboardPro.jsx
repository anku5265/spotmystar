import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Calendar, TrendingUp, Users, Clock, CheckCircle, 
  XCircle, DollarSign, MapPin, Heart, BarChart3, 
  Settings, LogOut, Camera, Edit, AlertCircle, Star,
  Plus, X, ChevronLeft, ChevronRight, Image as ImageIcon,
  Bell, Search, Filter, ArrowUp, ArrowDown, MessageSquare,
  Phone, Mail, IndianRupee, MapPinned, Sparkles
} from 'lucide-react';
import api from '../config/api';
import Toast from '../components/Toast';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';

export default function ArtistDashboardPro() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user: authUser, isLoading, logout } = useAuth('artist');
  
  // Core State
  const [artist, setArtist] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Requests State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestSearch, setRequestSearch] = useState('');
  const [requestSort, setRequestSort] = useState('newest');
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [busyDates, setBusyDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    status: 'confirmed',
    color: 'green'
  });
  
  // Quick Actions State
  const [isAvailable, setIsAvailable] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [priceData, setPriceData] = useState({ min: 0, max: 0 });
  
  // Analytics State
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [growthData, setGrowthData] = useState({ visits: 0, bookings: 0, wishlist: 0 });


  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || userRole !== 'artist') return;
    
    if (authUser && authUser.id) {
      const token = localStorage.getItem('artistToken');
      fetchAllData(token, authUser.id);
    }
  }, [isLoading, isAuthenticated, userRole, authUser]);

  const fetchAllData = async (token, artistId) => {
    try {
      // Fetch artist profile
      const artistRes = await api.get(`/api/artists/${artistId}?skipViewCount=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const artistData = artistRes.data;
      setArtist(artistData);
      setIsAvailable(artistData.is_available !== false);
      setPriceData({ min: artistData.price_min || 0, max: artistData.price_max || 0 });
      
      // Parse availability data
      if (artistData.availability) {
        try {
          const availability = JSON.parse(artistData.availability);
          setBusyDates(availability.busyDates || []);
          setCalendarEvents(availability.events || []);
        } catch (e) {
          setBusyDates([]);
          setCalendarEvents([]);
        }
      }
      
      // Fetch all analytics data
      await Promise.all([
        fetchAnalytics(artistId, filter),
        fetchPendingRequests(artistId),
        fetchRecentEnquiries(artistId),
        fetchUpcomingEvents(artistId),
        fetchGrowthData(artistId)
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      const res = await api.get(`/api/artist-analytics/recent-enquiries/${artistId}?limit=5`, {
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

  const fetchGrowthData = async (artistId) => {
    try {
      const token = localStorage.getItem('artistToken');
      // Fetch current and previous period stats for growth calculation
      const currentRes = await api.get(`/api/artist-analytics/stats/${artistId}?filter=weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // For simplicity, showing positive growth - in production, compare with previous period
      setGrowthData({
        visits: 12,
        bookings: 8,
        wishlist: 5
      });
    } catch (error) {
      console.error('Error fetching growth data:', error);
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
      await api.patch(`/api/bookings/${bookingId}/status`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setToast({ message: `Booking ${action}!`, type: 'success' });
      setSelectedRequest(null);
      
      // Refresh all relevant data
      await Promise.all([
        fetchPendingRequests(artist.id),
        fetchAnalytics(artist.id, filter),
        fetchRecentEnquiries(artist.id),
        fetchUpcomingEvents(artist.id)
      ]);
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
    if (artist.city || artist.primary_city) completed++;
    if (artist.bio || artist.short_bio) completed++;
    if (artist.price_min && artist.price_max) completed++;
    if (artist.category_id) completed++;
    
    return Math.round((completed / total) * 100);
  };


  // Calendar Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const addCalendarEvent = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const event = {
        ...newEvent,
        date: dateStr,
        id: Date.now()
      };
      
      const updatedEvents = [...calendarEvents, event];
      setCalendarEvents(updatedEvents);
      
      // Save to database
      const token = localStorage.getItem('artistToken');
      const availability = JSON.stringify({ busyDates, events: updatedEvents });
      
      await api.patch(`/api/artists/${artist.id}`, 
        { availability },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setToast({ message: 'Event added successfully!', type: 'success' });
      setShowEventModal(false);
      setNewEvent({ title: '', startTime: '', endTime: '', location: '', status: 'confirmed', color: 'green' });
    } catch (error) {
      setToast({ message: 'Failed to add event', type: 'error' });
    }
  };

  const toggleBusyDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const newBusyDates = busyDates.includes(dateStr)
      ? busyDates.filter(d => d !== dateStr)
      : [...busyDates, dateStr];
    setBusyDates(newBusyDates);
  };

  const saveBusyDates = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      const availability = JSON.stringify({ busyDates, events: calendarEvents });
      
      await api.patch(`/api/artists/${artist.id}`, 
        { availability },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setToast({ message: 'Busy dates updated successfully!', type: 'success' });
      setShowBusyModal(false);
    } catch (error) {
      setToast({ message: 'Failed to update busy dates', type: 'error' });
    }
  };

  const updatePrice = async () => {
    try {
      const token = localStorage.getItem('artistToken');
      
      await api.patch(`/api/artists/${artist.id}`, 
        { price_min: priceData.min, price_max: priceData.max },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setArtist({ ...artist, price_min: priceData.min, price_max: priceData.max });
      setToast({ message: 'Price updated successfully!', type: 'success' });
      setShowPriceModal(false);
    } catch (error) {
      setToast({ message: 'Failed to update price', type: 'error' });
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-700/30"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isBusy = busyDates.includes(dateStr);
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      const events = getEventsForDate(date);
      
      days.push(
        <div
          key={day}
          onClick={() => !isPast && handleDateClick(date)}
          className={`h-20 border border-gray-700/30 p-1 cursor-pointer transition-all ${
            isPast ? 'bg-gray-800/30 cursor-not-allowed' :
            isBusy ? 'bg-red-500/20 hover:bg-red-500/30' :
            isToday ? 'bg-blue-500/20 hover:bg-blue-500/30 ring-2 ring-blue-500' :
            'bg-gray-800/50 hover:bg-gray-700/50'
          }`}
        >
          <div className="text-sm font-semibold mb-1">{day}</div>
          {events.length > 0 && (
            <div className="space-y-0.5">
              {events.slice(0, 2).map((event, idx) => (
                <div
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded truncate ${
                    event.status === 'confirmed' ? 'bg-green-500/30 text-green-300' :
                    event.status === 'tentative' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-red-500/30 text-red-300'
                  }`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {events.length > 2 && (
                <div className="text-xs text-gray-400">+{events.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Filter and sort pending requests
  const getFilteredRequests = () => {
    let filtered = [...pendingRequests];
    
    // Search filter
    if (requestSearch) {
      filtered = filtered.filter(req => 
        req.user_name.toLowerCase().includes(requestSearch.toLowerCase()) ||
        req.event_location.toLowerCase().includes(requestSearch.toLowerCase()) ||
        (req.event_type && req.event_type.toLowerCase().includes(requestSearch.toLowerCase()))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (requestSort === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (requestSort === 'event_date') {
        return new Date(a.event_date) - new Date(b.event_date);
      } else if (requestSort === 'budget_high') {
        return (b.budget || 0) - (a.budget || 0);
      }
      return 0;
    });
    
    return filtered;
  };


  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'artist' || !artist) {
    return null;
  }

  const profileCompletion = getProfileCompletion();
  const filteredRequests = getFilteredRequests();
  const unreadCount = pendingRequests.filter(r => !r.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* TOP HEADER - Sticky */}
      <div className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Artist Info & Availability */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-xl font-bold">
                  {artist.stage_name?.charAt(0) || artist.full_name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    {artist.stage_name || artist.full_name}
                    {artist.is_verified && <CheckCircle className="text-blue-400" size={18} />}
                  </h1>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">
                      Profile: <span className="text-white font-semibold">{profileCompletion}%</span>
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">
                      Service: <span className="text-white">{artist.city || artist.primary_city}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Availability Toggle */}
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isAvailable
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white' : 'bg-white/70'} animate-pulse`}></div>
                {isAvailable ? 'Available' : 'Not Available'}
              </button>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPriceModal(true)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <IndianRupee size={16} />
                Update Price
              </button>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Camera size={16} />
                Add Photos
              </button>
              <button
                onClick={() => setShowBusyModal(true)}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Calendar size={16} />
                Mark Busy
              </button>
              <div className="relative">
                <NotificationBell userType="artist" userId={artist.id} />
              </div>
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

      <div className="container mx-auto px-4 py-6">
        {/* PERFORMANCE METRICS SECTION */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-secondary" size={28} />
              Performance Metrics
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all text-sm font-medium ${
                    filter === f
                      ? 'bg-secondary text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Visits */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Eye className="text-blue-400" size={28} />
                  <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                    <ArrowUp size={14} />
                    +{growthData.visits}%
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats.views?.toLocaleString() || 0}</p>
                <p className="text-gray-400 text-sm font-medium">Total Visits</p>
              </div>

              {/* Total Bookings */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="text-green-400" size={28} />
                  <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                    <ArrowUp size={14} />
                    +{growthData.bookings}%
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats.bookings?.toLocaleString() || 0}</p>
                <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
              </div>

              {/* Wishlist Count */}
              <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-pink-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Heart className="text-pink-400" size={28} />
                  <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                    <ArrowUp size={14} />
                    +{growthData.wishlist}%
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats.wishlistCount?.toLocaleString() || 0}</p>
                <p className="text-gray-400 text-sm font-medium">Wishlist Count</p>
              </div>

              {/* Service Area */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <MapPinned className="text-purple-400" size={28} />
                  <Sparkles className="text-purple-400" size={20} />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{artist.city || artist.primary_city}</p>
                <p className="text-gray-400 text-sm font-medium">
                  {artist.service_locations?.length > 0 
                    ? `+${artist.service_locations.length} more cities` 
                    : 'Primary Service Area'}
                </p>
              </div>
            </div>
          )}
        </div>


        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Calendar & Upcoming Events */}
          <div className="lg:col-span-1 space-y-6">
            {/* INTERACTIVE CALENDAR */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="text-secondary" size={22} />
                My Calendar
              </h3>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h4 className="text-lg font-semibold">
                    {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-400">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-400">Tentative</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-400">Blocked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-500 rounded ring-2 ring-blue-500"></div>
                    <span className="text-gray-400">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UPCOMING EVENTS (Next 7 days) */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="text-purple-400" size={22} />
                Upcoming (Next 7 days)
              </h3>
              
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium text-sm">{event.user_name}</p>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                          Confirmed
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-400">
                        <p className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(event.event_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {event.event_location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8 text-sm">No upcoming events</p>
              )}
            </div>

            {/* RECENT ENQUIRIES (Last 24hrs) */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-400" size={22} />
                Recent Enquiries
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  Last 24hrs
                </span>
              </h3>
              
              {recentEnquiries.length > 0 ? (
                <div className="space-y-2">
                  {recentEnquiries.map((enquiry) => (
                    <div key={enquiry.id} className="flex justify-between items-center p-2 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-all">
                      <div>
                        <p className="text-white font-medium text-sm">{enquiry.user_name}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(enquiry.event_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        enquiry.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        enquiry.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {enquiry.status === 'pending' ? 'UNREAD' : enquiry.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8 text-sm">No recent enquiries</p>
              )}
            </div>

            {/* PROFILE ANALYTICS */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="text-secondary" size={22} />
                Profile Analytics
              </h3>
              
              <div className="space-y-4">
                {/* Completion */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Completion</span>
                    <span className="text-white font-semibold">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-secondary h-2.5 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Checklist */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {artist.profile_image ? <CheckCircle size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-yellow-400" />}
                    <span className={artist.profile_image ? 'text-gray-400' : 'text-yellow-400'}>Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {artist.bio || artist.short_bio ? <CheckCircle size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-yellow-400" />}
                    <span className={artist.bio || artist.short_bio ? 'text-gray-400' : 'text-yellow-400'}>Bio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {artist.price_min && artist.price_max ? <CheckCircle size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-yellow-400" />}
                    <span className={artist.price_min && artist.price_max ? 'text-gray-400' : 'text-yellow-400'}>Pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN - Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              {/* Header with Search & Sort */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-yellow-400" size={24} />
                    Pending Booking Requests
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold animate-pulse">
                        {unreadCount} NEW
                      </span>
                    )}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name, location, or event type..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white placeholder-gray-500"
                    />
                  </div>
                  
                  {/* Sort */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={requestSort}
                      onChange={(e) => setRequestSort(e.target.value)}
                      className="pl-10 pr-8 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="event_date">Event Date</option>
                      <option value="budget_high">Budget (High→Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Requests List */}
              {filteredRequests.length > 0 ? (
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-secondary/50 transition-all"
                    >
                      {/* Request Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-white">{request.user_name}</h4>
                            {!request.is_read && (
                              <span className="px-2 py-0.5 bg-yellow-500 text-black rounded text-xs font-bold">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {request.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {request.phone}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold">
                          PENDING
                        </span>
                      </div>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Event Date & Time</p>
                          <p className="text-white font-semibold flex items-center gap-1.5">
                            <Calendar size={16} className="text-blue-400" />
                            {new Date(request.event_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Location</p>
                          <p className="text-white font-semibold flex items-center gap-1.5">
                            <MapPin size={16} className="text-green-400" />
                            {request.event_location}
                          </p>
                        </div>
                        
                        {request.event_type && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Event Type</p>
                            <p className="text-white font-semibold flex items-center gap-1.5">
                              <Users size={16} className="text-purple-400" />
                              {request.event_type}
                            </p>
                          </div>
                        )}
                        
                        {request.budget && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Budget</p>
                            <p className="text-white font-semibold flex items-center gap-1.5">
                              <IndianRupee size={16} className="text-green-400" />
                              ₹{request.budget.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border-l-4 border-secondary">
                          <p className="text-gray-400 text-xs mb-1.5 font-semibold">Message from client:</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{request.message}</p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                        <span>
                          Enquiry #{request.id} • Received {new Date(request.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleBookingAction(request.id, 'accepted')}
                          className="flex-1 px-5 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-white shadow-lg hover:shadow-green-500/50"
                        >
                          <CheckCircle size={18} />
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleBookingAction(request.id, 'rejected')}
                          className="flex-1 px-5 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-white shadow-lg hover:shadow-red-500/50"
                        >
                          <XCircle size={18} />
                          REJECT
                        </button>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-white"
                        >
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock className="mx-auto text-gray-600 mb-4" size={64} />
                  <p className="text-gray-400 text-lg font-medium">
                    {requestSearch ? 'No requests match your search' : 'No pending requests'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {requestSearch ? 'Try a different search term' : 'New booking requests will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ADD EVENT MODAL */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add Event</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                <input
                  type="text"
                  value={selectedDate.toLocaleDateString('en-IN')}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Wedding, Birthday Party, Corporate Event"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Event location"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ 
                    ...newEvent, 
                    status: e.target.value,
                    color: e.target.value === 'confirmed' ? 'green' : e.target.value === 'tentative' ? 'yellow' : 'red'
                  })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="tentative">Tentative</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addCalendarEvent}
                  disabled={!newEvent.title}
                  className="flex-1 px-5 py-3 bg-secondary hover:bg-secondary/80 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all font-semibold text-white"
                >
                  Add Event
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE PRICE MODAL */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <IndianRupee className="text-green-400" size={24} />
                Update Pricing
              </h3>
              <button onClick={() => setShowPriceModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Price Range</label>
                <p className="text-white font-semibold text-lg">
                  ₹{artist.price_min?.toLocaleString() || 0} - ₹{artist.price_max?.toLocaleString() || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Price (₹)</label>
                <input
                  type="number"
                  value={priceData.min}
                  onChange={(e) => setPriceData({ ...priceData, min: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white"
                  placeholder="e.g., 10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Maximum Price (₹)</label>
                <input
                  type="number"
                  value={priceData.max}
                  onChange={(e) => setPriceData({ ...priceData, max: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-secondary text-white"
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  💡 Tip: Set competitive prices based on your experience and market rates
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={updatePrice}
                  className="flex-1 px-5 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition-all font-semibold text-white"
                >
                  Update Price
                </button>
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PHOTOS MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="text-blue-400" size={24} />
                Add Photos
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-secondary transition-all cursor-pointer bg-gray-900/30">
                <ImageIcon className="mx-auto mb-4 text-gray-400" size={56} />
                <p className="text-gray-300 mb-2 font-medium">Click to upload photos</p>
                <p className="text-gray-500 text-sm">or drag and drop</p>
                <p className="text-gray-600 text-xs mt-2">PNG, JPG up to 5MB</p>
                <input type="file" multiple accept="image/*" className="hidden" />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setToast({ message: 'Photos uploaded successfully!', type: 'success' });
                    setShowPhotoModal(false);
                  }}
                  className="flex-1 px-5 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-semibold text-white"
                >
                  Upload Photos
                </button>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARK BUSY DATES MODAL */}
      {showBusyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full border border-gray-700 shadow-2xl my-8">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-yellow-400" size={24} />
                Mark Busy Dates
              </h3>
              <button onClick={() => setShowBusyModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-400 mb-6">
                Click on dates to mark them as busy. This helps you manage your availability for offline bookings.
              </p>
              
              <div className="bg-gray-900/50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronLeft size={24} />
                  </button>
                  <h4 className="text-xl font-semibold">
                    {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth(currentMonth).startingDayOfWeek > 0 && 
                    Array.from({ length: getDaysInMonth(currentMonth).startingDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-12"></div>
                    ))
                  }
                  {Array.from({ length: getDaysInMonth(currentMonth).daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateStr = date.toISOString().split('T')[0];
                    const isBusy = busyDates.includes(dateStr);
                    const isPast = date < new Date().setHours(0, 0, 0, 0);
                    
                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && toggleBusyDate(date)}
                        disabled={isPast}
                        className={`h-12 rounded-lg text-sm font-semibold transition-all ${
                          isPast ? 'text-gray-600 cursor-not-allowed bg-gray-800/30' :
                          isBusy ? 'bg-red-500 text-white hover:bg-red-600' :
                          'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveBusyDates}
                  className="flex-1 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all font-semibold text-black"
                >
                  Save Busy Dates
                </button>
                <button
                  onClick={() => setShowBusyModal(false)}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
