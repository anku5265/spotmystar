# Artist Discovery Platform - Complete Overview

## 🎯 Concept
Location-based artist discovery and booking platform for India. Users can search DJs, Anchors, Bands, and other performers by city, view profiles, and send booking requests directly. No payment processing in MVP - focus on discovery and connection.

## 🎨 Design Philosophy
- **Premium Dark Theme**: Glassmorphism effects, gradients, smooth animations
- **Mobile-First**: Responsive design, PWA ready
- **Simple UX**: 3 clicks to book, clear CTAs, minimal forms
- **India-Focused**: City search, WhatsApp integration, ₹ pricing

## 📊 Database Schema

### Artists Table
```javascript
{
  fullName: String,
  stageName: String (unique, for vanity URLs),
  category: ObjectId (ref: Category),
  bio: String (max 500 chars),
  city: String,
  priceMin: Number,
  priceMax: Number,
  email: String,
  whatsapp: String,
  instagram: String,
  profileImage: String,
  gallery: [String],
  videos: [String],
  isVerified: Boolean (admin approval),
  status: 'pending' | 'active' | 'inactive',
  rating: Number,
  totalBookings: Number,
  views: Number,
  password: String (hashed)
}
```

### Bookings Table
```javascript
{
  artist: ObjectId (ref: Artist),
  userName: String,
  phone: String,
  email: String,
  eventDate: Date,
  eventLocation: String,
  budget: Number,
  message: String,
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
}
```

### Categories Table
```javascript
{
  name: String (DJ, Anchor, Band, etc.),
  icon: String (emoji),
  description: String
}
```

### Users Table
```javascript
{
  email: String,
  name: String,
  password: String,
  wishlist: [ObjectId] (ref: Artist),
  role: 'user' | 'admin'
}
```

## 🗺️ User Flows

### User Journey (Booking)
1. Land on homepage → See featured artists + search bar
2. Enter city OR click "Near Me" → Search results
3. Apply filters (category, budget) → Refined results
4. Click artist card → Full profile page
5. View gallery, bio, price → Click "Send Request"
6. Fill booking form → Submit
7. Email sent to artist → Success page

### Artist Journey (Registration → First Booking)
1. Click "Join as Artist" → Registration form
2. Fill profile details → Submit (status: pending)
3. Admin approves → Status: active
4. Artist shares vanity URL on Instagram bio
5. User sends booking request → Email notification
6. Artist logs in → Dashboard → View request
7. Accept/Reject → User notified

### Admin Journey
1. Login → Dashboard with stats
2. See pending artists → Review profiles
3. Approve/Reject → Artist notified
4. View all bookings → Monitor activity
5. Manage categories → Add new types

## 🎨 UI Components

### Homepage
- Hero with gradient background
- Search bar with city autocomplete
- "Near Me" geolocation button
- Category grid (6 cards with icons)
- Featured artists carousel (6 cards)

### Search Page
- Sidebar filters (city, category, budget slider)
- Grid/List toggle
- Artist cards with:
  - Hover scale effect
  - Verified badge
  - Heart icon (wishlist)
  - Price range
  - Rating stars

### Artist Profile
- Cover banner (full width)
- Profile card (sticky sidebar):
  - Profile pic with border
  - Name + badges
  - City + price
  - CTA buttons (Book, WhatsApp, Instagram)
- Main content:
  - Bio section
  - Gallery grid (3 columns)
  - Stats cards (views, bookings, rating)

### Booking Modal
- Overlay with glassmorphism
- Form fields:
  - Name, phone, email
  - Date picker
  - Location input
  - Budget input
  - Message textarea
- Submit button with loading state

### Artist Dashboard
- Stats cards (views, requests, accepted)
- Tabs: Bookings | Profile
- Bookings table:
  - Client details
  - Event info
  - Accept/Reject buttons
  - Status badges

### Admin Dashboard
- Stats overview (4 cards)
- Tabs: Artists | Bookings
- Artists table:
  - Search/filter
  - Approve/Reject actions
  - Status indicators
- Bookings table:
  - All requests
  - Filter by status

## 🔌 API Endpoints

### Public APIs
```
GET    /api/categories                    # All categories
GET    /api/artists/search                # Search with filters
GET    /api/artists/featured              # Top 6 artists
GET    /api/artists/:identifier           # Profile by ID/stageName
POST   /api/artists/register              # Artist signup
POST   /api/bookings                      # Create booking
```

### Artist APIs (Auth Required)
```
POST   /api/auth/artist/login             # Login
GET    /api/bookings/artist/:artistId     # Artist's bookings
PATCH  /api/bookings/:id/status           # Accept/Reject
```

### Admin APIs (Auth Required)
```
POST   /api/auth/admin/login              # Login
GET    /api/admin/stats                   # Dashboard stats
GET    /api/admin/artists                 # All artists
PATCH  /api/admin/artists/:id/verify      # Approve/Reject
GET    /api/admin/bookings                # All bookings
```

## 🎯 Key Features

### MVP (Current)
✅ City-based search
✅ Category filters
✅ Budget range filter
✅ Artist profiles with gallery
✅ Direct booking requests
✅ Email notifications
✅ Artist dashboard
✅ Admin approval system
✅ Vanity URLs (yourapp.com/stagename)
✅ WhatsApp/Instagram integration
✅ Responsive design
✅ Dark theme UI

### Post-MVP (Future)
- Payment integration (Razorpay)
- Reviews & ratings system
- Artist availability calendar
- Advanced search (date, event type)
- Wishlist with comparison
- Push notifications
- Chat system
- Analytics dashboard
- Multi-language support
- Mobile app (React Native)

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build**: Vite (fast HMR)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + Bcrypt
- **Email**: Nodemailer
- **Validation**: Express validators
- **Security**: CORS, Helmet

### DevOps
- **Frontend Host**: Vercel (free)
- **Backend Host**: Render (free)
- **Database**: MongoDB Atlas (free 512MB)
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel auto-deploy

## 💰 Cost Breakdown

### MVP (Free Tier)
- MongoDB Atlas: Free (512MB)
- Render: Free (sleeps after 15min)
- Vercel: Free (100GB bandwidth)
- **Total: ₹0/month**

### Production (Paid)
- MongoDB Atlas: $9/month (2GB)
- Render: $7/month (24/7 uptime)
- Vercel: Free (sufficient)
- Cloudinary: Free (25GB)
- **Total: ~₹1,200/month**

## 📈 Scalability

### Current Capacity (Free Tier)
- 512MB database = ~5,000 artists
- Render free tier = 750 hours/month
- Vercel = Unlimited requests

### Scaling Strategy
1. **Phase 1** (0-1K users): Free tier
2. **Phase 2** (1K-10K users): Paid hosting ($16/month)
3. **Phase 3** (10K+ users): 
   - Dedicated server
   - CDN for images
   - Redis caching
   - Load balancer

## 🔒 Security

### Implemented
- Password hashing (bcrypt, 10 rounds)
- JWT tokens (7-day expiry)
- CORS protection
- Input sanitization
- MongoDB injection prevention

### TODO (Production)
- Rate limiting
- HTTPS enforcement
- Helmet.js headers
- Input validation middleware
- File upload restrictions
- SQL injection prevention

## 📱 Mobile Strategy

### Current (PWA)
- Responsive design
- Mobile-first UI
- Add to home screen
- Offline support (future)

### Future (Native App)
- React Native app
- Push notifications
- Camera integration
- Location services
- Deep linking

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack MERN development
- RESTful API design
- JWT authentication
- Email integration
- File uploads (future)
- Payment gateway (future)
- Admin panel patterns
- Responsive design
- State management
- Form handling
- Search & filters
- Real-time updates (future)

## 📝 Documentation Files

- **README.md**: Project overview
- **START.md**: Quick start guide (1 minute)
- **SETUP.md**: Detailed setup instructions
- **FEATURES.md**: Complete feature list
- **DEPLOYMENT.md**: Production deployment
- **PROJECT_OVERVIEW.md**: This file

## 🎉 Unique Selling Points

1. **India-Focused**: Cities, WhatsApp, ₹ pricing
2. **No Commission**: Direct artist-client connection
3. **Vanity URLs**: Shareable Instagram bio links
4. **Premium UI**: Dark theme, glassmorphism
5. **Simple Flow**: 3 clicks to book
6. **Free MVP**: Zero hosting cost
7. **Scalable**: Can handle 10K+ users

## 🏆 Success Metrics

### MVP Goals
- 50+ artists registered
- 100+ bookings in first month
- 80% artist approval rate
- <3 second page load

### Growth Goals
- 500+ artists in 6 months
- 1,000+ bookings/month
- 4.5+ star rating
- 50% repeat booking rate

---

**Built with ❤️ for Indian artists and event organizers**
