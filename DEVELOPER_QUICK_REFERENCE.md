# Developer Quick Reference - Analytics Dashboard

## API Endpoint

```javascript
GET /api/artist-analytics/stats/:artistId?filter={daily|weekly|monthly}
```

**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "views": 1234,
  "bookings": 45,
  "filteredBookings": 8,
  "pendingRequests": 3,
  "wishlistCount": 67,
  "upcomingEvents": 5,
  "filter": "weekly"
}
```

---

## Frontend Component Structure

```jsx
<div className="mb-6">
  {/* Header with title and filters */}
  <div className="flex justify-between">
    <h2>Performance Dashboard</h2>
    <FilterTabs />
  </div>

  {/* 5 Analytics Cards */}
  <div className="grid lg:grid-cols-5 gap-5">
    <ProfileViewsCard />
    <TotalBookingsCard />
    <PendingRequestsCard />
    <UpcomingEventsCard />
    <WishlistCountCard />
  </div>
</div>
```

---

## Card Template

```jsx
<div className="bg-gradient-to-br from-{color}-500/20 border border-{color}-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
  {/* Icon and Badge */}
  <div className="flex justify-between mb-4">
    <div className="p-3 bg-{color}-500/20 rounded-xl">
      <Icon className="text-{color}-400" size={28} />
    </div>
    <Badge />
  </div>
  
  {/* Main Number */}
  <p className="text-4xl font-black text-white mb-2">
    {stats.metric?.toLocaleString() || 0}
  </p>
  
  {/* Title and Subtitle */}
  <p className="text-gray-400 text-sm font-semibold">Title</p>
  <p className="text-gray-500 text-xs">Subtitle</p>
</div>
```

---

## State Management

```javascript
// State
const [stats, setStats] = useState(null);
const [filter, setFilter] = useState('daily');

// Fetch on mount and filter change
useEffect(() => {
  if (artist?.id) {
    fetchAnalytics(artist.id, filter);
  }
}, [filter, artist?.id]);

// Fetch function
const fetchAnalytics = async (artistId, filterType) => {
  const res = await api.get(
    `/api/artist-analytics/stats/${artistId}?filter=${filterType}`,
    { headers: { Authorization: `Bearer ${token}` }}
  );
  setStats(res.data);
};
```

---

## Filter Logic

```javascript
const handleFilterChange = async (newFilter) => {
  setFilter(newFilter);
  if (artist) {
    await fetchAnalytics(artist.id, newFilter);
  }
};
```

---

## Conditional Badge Rendering

```jsx
{/* Show badge only when count > 0 */}
{stats.pendingRequests > 0 && (
  <div className="bg-yellow-500/20 px-2 py-1 rounded-full animate-pulse">
    <AlertCircle size={12} />
    Action
  </div>
)}
```

---

## Number Formatting

```javascript
// Always use toLocaleString() for numbers
{stats.views?.toLocaleString() || 0}

// Examples:
// 1234 → "1,234"
// 1234567 → "1,234,567"
// 0 → "0"
// undefined → "0"
```

---

## Responsive Grid Classes

```jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5"
```

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 5 columns

---

## Color Scheme

| Metric | Color | Gradient | Border | Icon |
|--------|-------|----------|--------|------|
| Views | Blue | from-blue-500/20 | border-blue-500/30 | text-blue-400 |
| Bookings | Green | from-green-500/20 | border-green-500/30 | text-green-400 |
| Pending | Yellow | from-yellow-500/20 | border-yellow-500/30 | text-yellow-400 |
| Upcoming | Purple | from-purple-500/20 | border-purple-500/30 | text-purple-400 |
| Wishlist | Pink | from-pink-500/20 | border-pink-500/30 | text-pink-400 |

---

## Icons Used

```javascript
import {
  Eye,           // Profile Views
  Calendar,      // Total Bookings
  Clock,         // Pending Requests
  Star,          // Upcoming Events
  Heart,         // Wishlist Count
  TrendingUp,    // Badge icon
  ArrowUp,       // Badge icon
  AlertCircle,   // Badge icon
  CheckCircle,   // Badge icon
  Sparkles       // Badge icon
} from 'lucide-react';
```

---

## Database Queries (Backend)

```javascript
// Profile Views
const viewsResult = await pool.query(
  'SELECT views FROM artists WHERE id = $1',
  [artistId]
);

// Total Bookings
const bookingsResult = await pool.query(
  'SELECT COUNT(*) FROM bookings WHERE artist_id = $1',
  [artistId]
);

// Filtered Bookings
const filteredResult = await pool.query(
  'SELECT COUNT(*) FROM bookings WHERE artist_id = $1 AND created_at >= $2',
  [artistId, filterDate]
);

// Pending Requests
const pendingResult = await pool.query(
  'SELECT COUNT(*) FROM bookings WHERE artist_id = $1 AND status = $2',
  [artistId, 'pending']
);

// Upcoming Events
const upcomingResult = await pool.query(
  'SELECT COUNT(*) FROM bookings WHERE artist_id = $1 AND status = $2 AND event_date >= NOW()',
  [artistId, 'accepted']
);

// Wishlist Count
const wishlistResult = await pool.query(
  'SELECT COUNT(*) FROM wishlist WHERE artist_id = $1',
  [artistId]
);
```

---

## Date Filter Calculation

```javascript
const now = new Date();
let dateCondition = '';

if (filter === 'daily') {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  dateCondition = `AND created_at >= '${today.toISOString()}'`;
} else if (filter === 'weekly') {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  dateCondition = `AND created_at >= '${weekAgo.toISOString()}'`;
} else if (filter === 'monthly') {
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  dateCondition = `AND created_at >= '${monthAgo.toISOString()}'`;
}
```

---

## Refresh Data After Actions

```javascript
const handleBookingAction = async (bookingId, action) => {
  // Update booking status
  await api.patch(`/api/bookings/${bookingId}/status`, { status: action });
  
  // Refresh all analytics
  await Promise.all([
    fetchAnalytics(artist.id, filter),
    fetchPendingRequests(artist.id),
    fetchUpcomingEvents(artist.id)
  ]);
};
```

---

## Error Handling

```javascript
try {
  const res = await api.get(`/api/artist-analytics/stats/${artistId}`);
  setStats(res.data);
} catch (error) {
  console.error('Analytics error:', error);
  setToast({ message: 'Failed to load analytics', type: 'error' });
}
```

---

## Authentication Check

```javascript
// Backend middleware
if (req.user.id !== parseInt(artistId)) {
  return res.status(403).json({ message: 'Access denied' });
}
```

---

## Tailwind Classes Reference

### Card Container
```
bg-gradient-to-br from-{color}-500/20 via-{color}-500/10 to-transparent
border border-{color}-500/30
rounded-2xl p-6
hover:shadow-2xl hover:shadow-{color}-500/20
transition-all hover:scale-105 hover:border-{color}-400/50
cursor-pointer group
```

### Icon Container
```
p-3 bg-{color}-500/20 rounded-xl
group-hover:bg-{color}-500/30 transition-all
```

### Badge
```
flex items-center gap-1
text-{color}-400 text-xs font-bold
bg-{color}-500/10 px-2 py-1 rounded-full
```

### Main Number
```
text-4xl font-black text-white mb-2 tracking-tight
```

### Title
```
text-gray-400 text-sm font-semibold mb-1
```

### Subtitle
```
text-gray-500 text-xs
```

---

## Testing Commands

```bash
# Run backend
cd backend
npm start

# Run frontend
cd frontend
npm run dev

# Check diagnostics
# Use getDiagnostics tool in IDE

# Database query
psql -d spotmystar -c "SELECT * FROM artists WHERE id = 1;"
```

---

## Common Pitfalls

❌ **Don't**: Use hardcoded values
```javascript
<p>{1234}</p>
```

✅ **Do**: Use state with fallback
```javascript
<p>{stats.views?.toLocaleString() || 0}</p>
```

---

❌ **Don't**: Forget to format numbers
```javascript
<p>{stats.views}</p>
```

✅ **Do**: Always use toLocaleString()
```javascript
<p>{stats.views?.toLocaleString() || 0}</p>
```

---

❌ **Don't**: Show badges unconditionally
```javascript
<div className="badge">Action</div>
```

✅ **Do**: Conditional rendering
```javascript
{stats.pendingRequests > 0 && <div className="badge">Action</div>}
```

---

❌ **Don't**: Forget authentication
```javascript
const res = await api.get('/api/artist-analytics/stats/1');
```

✅ **Do**: Include auth header
```javascript
const res = await api.get('/api/artist-analytics/stats/1', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Performance Tips

1. Use `Promise.all()` for parallel API calls
2. Memoize expensive calculations
3. Avoid unnecessary re-renders
4. Use proper React keys in lists
5. Optimize images and icons
6. Lazy load heavy components
7. Cache API responses when appropriate

---

## Accessibility

```jsx
// Add ARIA labels
<div role="region" aria-label="Performance Analytics">
  {/* Cards */}
</div>

// Ensure keyboard navigation
<button 
  onClick={handleFilterChange}
  onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
>
  Daily
</button>

// Use semantic HTML
<main>
  <section aria-labelledby="analytics-heading">
    <h2 id="analytics-heading">Performance Dashboard</h2>
  </section>
</main>
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security headers set
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup

---

## Support & Documentation

- Main docs: `ANALYTICS_ENHANCEMENT_SUMMARY.md`
- Visual guide: `ANALYTICS_CARDS_VISUAL_GUIDE.md`
- Testing: `TESTING_GUIDE.md`
- This file: `DEVELOPER_QUICK_REFERENCE.md`
