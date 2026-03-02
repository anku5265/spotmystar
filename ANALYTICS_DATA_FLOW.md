# Analytics Dashboard Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARTIST DASHBOARD                         │
│                     (ArtistDashboard.jsx)                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ useEffect on mount
                                 │ & filter change
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      fetchAnalytics()                            │
│                   fetchPendingRequests()                         │
│                   fetchRecentEnquiries()                         │
│                   fetchUpcomingEvents()                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ API Calls with JWT
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API ROUTES                            │
│              (artist-analytics.js)                               │
│                                                                   │
│  GET /api/artist-analytics/stats/:artistId?filter={period}      │
│  GET /api/artist-analytics/pending-requests/:artistId           │
│  GET /api/artist-analytics/recent-enquiries/:artistId           │
│  GET /api/artist-analytics/upcoming-events/:artistId            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ SQL Queries
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                         │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ artists  │  │ bookings │  │ wishlist │  │  users   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Query Results
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      JSON RESPONSE                               │
│  {                                                               │
│    views: 1234,                                                  │
│    bookings: 45,                                                 │
│    filteredBookings: 8,                                          │
│    pendingRequests: 3,                                           │
│    wishlistCount: 67,                                            │
│    upcomingEvents: 5                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ setState()
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT STATE UPDATE                            │
│                   setStats(response.data)                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Re-render
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS CARDS DISPLAY                       │
│                                                                   │
│  [Profile Views] [Bookings] [Pending] [Upcoming] [Wishlist]    │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Flow

### 1. Initial Load Sequence

```
User Login
    │
    ├─> Navigate to Dashboard
    │       │
    │       ├─> useAuth() validates token
    │       │       │
    │       │       ├─> Token valid? → Continue
    │       │       └─> Token invalid? → Redirect to login
    │       │
    │       ├─> useEffect() triggers
    │       │       │
    │       │       └─> fetchAllData(token, artistId)
    │       │               │
    │       │               ├─> Fetch artist profile
    │       │               ├─> Fetch analytics (parallel)
    │       │               ├─> Fetch pending requests
    │       │               ├─> Fetch recent enquiries
    │       │               └─> Fetch upcoming events
    │       │
    │       └─> Render dashboard with data
    │
    └─> Display analytics cards
```

### 2. Filter Change Flow

```
User clicks filter button (Daily/Weekly/Monthly)
    │
    ├─> handleFilterChange(newFilter)
    │       │
    │       ├─> setFilter(newFilter)
    │       │       │
    │       │       └─> State updates
    │       │
    │       └─> fetchAnalytics(artistId, newFilter)
    │               │
    │               ├─> API call with filter parameter
    │               │       │
    │               │       └─> Backend calculates date range
    │               │               │
    │               │               ├─> Daily: today's date
    │               │               ├─> Weekly: 7 days ago
    │               │               └─> Monthly: 30 days ago
    │               │
    │               ├─> Database queries with date filter
    │               │
    │               └─> Return filtered results
    │
    ├─> setStats(response.data)
    │
    └─> Cards re-render with new data
```

### 3. Booking Action Flow

```
User accepts/rejects booking
    │
    ├─> handleBookingAction(bookingId, action)
    │       │
    │       ├─> API call to update booking status
    │       │       │
    │       │       └─> PATCH /api/bookings/:id/status
    │       │               │
    │       │               └─> Database UPDATE
    │       │
    │       └─> Promise.all([
    │               fetchAnalytics(),
    │               fetchPendingRequests(),
    │               fetchUpcomingEvents()
    │           ])
    │               │
    │               └─> All data refreshes in parallel
    │
    ├─> Stats update automatically
    │       │
    │       ├─> Pending count decreases
    │       ├─> Bookings count increases (if accepted)
    │       └─> Upcoming count increases (if accepted + future)
    │
    └─> Cards display updated numbers
```

## Database Query Flow

### Profile Views Query

```
Frontend Request
    │
    └─> GET /api/artist-analytics/stats/:artistId
            │
            └─> Backend Query:
                    │
                    └─> SELECT views FROM artists WHERE id = $1
                            │
                            ├─> Returns: { views: 1234 }
                            │
                            └─> Frontend displays: "1,234"
```

### Total Bookings Query

```
Frontend Request
    │
    └─> GET /api/artist-analytics/stats/:artistId?filter=weekly
            │
            └─> Backend Queries:
                    │
                    ├─> Total: SELECT COUNT(*) FROM bookings 
                    │          WHERE artist_id = $1
                    │          Returns: 45
                    │
                    └─> Filtered: SELECT COUNT(*) FROM bookings 
                               WHERE artist_id = $1 
                               AND created_at >= [7 days ago]
                               Returns: 8
                    │
                    └─> Response: { bookings: 45, filteredBookings: 8 }
                            │
                            └─> Frontend displays: 
                                Main: "45"
                                Badge: "↑ 8"
                                Subtitle: "8 this week"
```

### Pending Requests Query

```
Frontend Request
    │
    └─> GET /api/artist-analytics/stats/:artistId
            │
            └─> Backend Query:
                    │
                    └─> SELECT COUNT(*) FROM bookings 
                        WHERE artist_id = $1 AND status = 'pending'
                            │
                            ├─> Returns: { pendingRequests: 3 }
                            │
                            └─> Frontend displays: "3"
                                    │
                                    └─> If > 0: Show "Action" badge (pulse)
```

### Upcoming Events Query

```
Frontend Request
    │
    └─> GET /api/artist-analytics/stats/:artistId
            │
            └─> Backend Query:
                    │
                    └─> SELECT COUNT(*) FROM bookings 
                        WHERE artist_id = $1 
                        AND status = 'accepted' 
                        AND event_date >= NOW()
                            │
                            ├─> Returns: { upcomingEvents: 5 }
                            │
                            └─> Frontend displays: "5"
                                    │
                                    └─> If > 0: Show "Confirmed" badge
```

### Wishlist Count Query

```
Frontend Request
    │
    └─> GET /api/artist-analytics/stats/:artistId
            │
            └─> Backend Query:
                    │
                    └─> SELECT COUNT(*) FROM wishlist 
                        WHERE artist_id = $1
                            │
                            ├─> Returns: { wishlistCount: 67 }
                            │
                            └─> Frontend displays: "67"
```

## Authentication Flow

```
Frontend Request
    │
    ├─> Retrieve token from localStorage
    │       │
    │       └─> const token = localStorage.getItem('artistToken')
    │
    ├─> Add to request headers
    │       │
    │       └─> headers: { Authorization: `Bearer ${token}` }
    │
    └─> Backend receives request
            │
            ├─> verifyToken middleware
            │       │
            │       ├─> Decode JWT
            │       ├─> Verify signature
            │       └─> Extract user ID
            │
            ├─> requireArtist middleware
            │       │
            │       └─> Verify role === 'artist'
            │
            ├─> Check ownership
            │       │
            │       └─> if (req.user.id !== parseInt(artistId))
            │               return 403 Forbidden
            │
            └─> Execute query and return data
```

## Error Handling Flow

```
API Call
    │
    ├─> Network Error?
    │       │
    │       ├─> Yes → catch block
    │       │       │
    │       │       ├─> console.error()
    │       │       └─> setToast({ message: 'Error', type: 'error' })
    │       │
    │       └─> No → Continue
    │
    ├─> Authentication Error?
    │       │
    │       ├─> Yes (401/403) → Redirect to login
    │       │
    │       └─> No → Continue
    │
    ├─> Server Error?
    │       │
    │       ├─> Yes (500) → Show error toast
    │       │
    │       └─> No → Continue
    │
    └─> Success → Update state and render
```

## State Management Flow

```
Component State
    │
    ├─> stats: null | StatsObject
    │       │
    │       └─> {
    │             views: number,
    │             bookings: number,
    │             filteredBookings: number,
    │             pendingRequests: number,
    │             wishlistCount: number,
    │             upcomingEvents: number
    │           }
    │
    ├─> filter: 'daily' | 'weekly' | 'monthly'
    │       │
    │       └─> Default: 'daily'
    │
    ├─> loading: boolean
    │       │
    │       ├─> true → Show loading spinner
    │       └─> false → Show dashboard
    │
    └─> toast: null | ToastObject
            │
            └─> { message: string, type: 'success' | 'error' }
```

## Real-Time Update Triggers

```
Trigger Events
    │
    ├─> Dashboard Mount
    │       └─> Fetch all data
    │
    ├─> Filter Change
    │       └─> Fetch analytics with new filter
    │
    ├─> Booking Accept/Reject
    │       └─> Refresh analytics, pending, upcoming
    │
    ├─> Availability Toggle
    │       └─> Update artist status
    │
    ├─> Price Update
    │       └─> Update artist pricing
    │
    └─> Calendar Event Add
            └─> Update artist availability
```

## Performance Optimization

```
Optimization Strategy
    │
    ├─> Parallel API Calls
    │       │
    │       └─> Promise.all([
    │               fetchAnalytics(),
    │               fetchPendingRequests(),
    │               fetchRecentEnquiries(),
    │               fetchUpcomingEvents()
    │           ])
    │
    ├─> Efficient Database Queries
    │       │
    │       ├─> Indexed columns (artist_id, status, event_date)
    │       └─> COUNT(*) instead of SELECT *
    │
    ├─> Conditional Rendering
    │       │
    │       └─> {stats && <AnalyticsCards />}
    │
    ├─> Memoization (future)
    │       │
    │       └─> useMemo for expensive calculations
    │
    └─> Debouncing (future)
            │
            └─> Debounce filter changes
```

## Data Consistency

```
Consistency Checks
    │
    ├─> Database Level
    │       │
    │       ├─> Foreign key constraints
    │       ├─> Transaction isolation
    │       └─> Atomic operations
    │
    ├─> Backend Level
    │       │
    │       ├─> Ownership validation
    │       ├─> Status checks
    │       └─> Date validation
    │
    └─> Frontend Level
            │
            ├─> Optimistic updates
            ├─> Error rollback
            └─> Automatic refresh
```

## Caching Strategy (Future)

```
Cache Layers
    │
    ├─> Browser Cache
    │       │
    │       └─> localStorage for token
    │
    ├─> React State
    │       │
    │       └─> In-memory stats cache
    │
    ├─> API Cache (future)
    │       │
    │       └─> Redis for frequent queries
    │
    └─> Database Cache
            │
            └─> PostgreSQL query cache
```

---

This data flow ensures:
- ✅ Real-time accuracy
- ✅ Secure access control
- ✅ Efficient performance
- ✅ Consistent state
- ✅ Error resilience
