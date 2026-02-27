# 🏗️ SpotMyStar - System Architecture

## 📊 Overview

SpotMyStar consists of THREE separate applications sharing ONE backend and ONE database:

```
┌─────────────────────────────────────────────────────────────┐
│                     SPOTMYSTAR PLATFORM                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   FRONTEND APP   │  │   ADMIN PANEL    │  │   BACKEND API    │
│  (User/Artist)   │  │   (Management)   │  │   (Shared)       │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Port: 5173       │  │ Port: 5174       │  │ Port: 5000       │
│ React + Vite     │  │ React + Vite     │  │ Node + Express   │
│ Tailwind CSS     │  │ Tailwind CSS     │  │ PostgreSQL       │
│                  │  │                  │  │                  │
│ Features:        │  │ Features:        │  │ Features:        │
│ • Browse Artists │  │ • View Stats     │  │ • REST API       │
│ • Search/Filter  │  │ • Approve Artists│  │ • Authentication │
│ • Book Artists   │  │ • Manage Users   │  │ • CRUD Ops       │
│ • User Login     │  │ • View Bookings  │  │ • JWT Tokens     │
│ • Artist Login   │  │ • Admin Login    │  │ • CORS Enabled   │
│ • Wishlist       │  │ • Accept/Reject  │  │                  │
│ • Profiles       │  │ • Monitor Data   │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   SUPABASE DATABASE  │
                    │   (PostgreSQL)       │
                    ├──────────────────────┤
                    │ Tables:              │
                    │ • users              │
                    │ • artists            │
                    │ • categories         │
                    │ • bookings           │
                    │ • wishlists          │
                    └──────────────────────┘
```

## 🌐 Deployment Architecture

### Production URLs:
- **Frontend**: https://spotmystar.vercel.app
- **Admin Panel**: https://spotmystar-admin.vercel.app
- **Backend**: https://spotmystar-backend.vercel.app
- **Database**: Supabase (managed PostgreSQL)

### Local Development URLs:
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend**: http://localhost:5000

## 📁 Repository Structure

```
spotmystar/
├── frontend/              # Main user/artist application
│   ├── src/
│   │   ├── components/   # Navbar, Footer, Toast
│   │   ├── pages/        # Home, Search, Login, Register, etc.
│   │   ├── config/       # API configuration
│   │   └── App.jsx       # Main app router
│   ├── .env
│   ├── .env.production
│   ├── vercel.json
│   └── package.json
│
├── admin-panel/          # Separate admin dashboard
│   ├── src/
│   │   ├── components/   # Toast
│   │   ├── pages/        # Login, Dashboard
│   │   ├── config/       # API configuration
│   │   └── App.jsx       # Admin router
│   ├── .env
│   ├── .env.production
│   ├── vercel.json
│   └── package.json
│
├── backend/              # Shared API server
│   ├── config/          # Database, Supabase config
│   ├── models/          # Data models
│   ├── routes/          # API endpoints
│   │   ├── auth.js      # User/Artist/Admin login
│   │   ├── artists.js   # Artist CRUD
│   │   ├── admin.js     # Admin operations
│   │   ├── bookings.js  # Booking operations
│   │   └── categories.js
│   ├── database/
│   │   └── schema.sql   # Database schema
│   ├── .env
│   ├── vercel.json
│   ├── server.js        # Main server file
│   └── package.json
│
├── README.md
├── DEPLOYMENT_GUIDE.md
└── SYSTEM_ARCHITECTURE.md (this file)
```

## 🔐 Authentication Flow

### User/Artist Authentication:
```
User → Frontend → POST /api/auth/user/login → Backend
                                            ↓
                                    Verify credentials
                                            ↓
                                    Generate JWT token
                                            ↓
Frontend ← Token + User data ← Backend
    ↓
Store in localStorage
    ↓
Include in API requests
```

### Admin Authentication:
```
Admin → Admin Panel → POST /api/auth/admin/login → Backend
                                                  ↓
                                          Verify admin role
                                                  ↓
                                          Generate JWT token
                                                  ↓
Admin Panel ← Token + Admin data ← Backend
    ↓
Store in localStorage
    ↓
Include in admin API requests
```

## 🔄 Artist Approval Workflow

```
1. Artist Registration
   Artist → Frontend → POST /api/auth/artist/register → Backend
                                                       ↓
                                               Create artist record
                                               Status: "pending"
                                               is_verified: false
                                                       ↓
                                               Artist profile hidden

2. Admin Review
   Admin → Admin Panel → GET /api/admin/artists?status=pending
                                                       ↓
                                               View pending artists
                                                       ↓
                                               Review details

3. Admin Decision
   
   A) ACCEPT:
      Admin → PATCH /api/admin/artists/:id/verify
              { isVerified: true, status: "active" }
                                                       ↓
                                               Update artist record
                                               Status: "active"
                                               is_verified: true
                                                       ↓
                                               Artist visible on frontend
                                               Users can book

   B) REJECT:
      Admin → PATCH /api/admin/artists/:id/verify
              { isVerified: false, status: "rejected" }
                                                       ↓
                                               Update artist record
                                               Status: "rejected"
                                               Artist can re-register

   C) IGNORE:
      No action taken
      Artist remains in "pending" status
      Admin can review later
```

## 📊 Data Flow Examples

### User Books an Artist:
```
User → Frontend → POST /api/bookings
                  { artistId, date, eventType, ... }
                                    ↓
                            Backend validates
                                    ↓
                            Create booking record
                                    ↓
                            Save to database
                                    ↓
Frontend ← Booking confirmation ← Backend
    ↓
Show success message
Redirect to success page
```

### Admin Views Statistics:
```
Admin → Admin Panel → GET /api/admin/stats
                                    ↓
                            Backend queries:
                            • Count users
                            • Count artists by status
                            • Count bookings
                            • Group by category
                                    ↓
Admin Panel ← Statistics data ← Backend
    ↓
Display in dashboard cards
Show category breakdown
```

## 🗄️ Database Schema

### Users Table:
```sql
users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255),
  role VARCHAR(50), -- 'user' or 'admin'
  created_at TIMESTAMP
)
```

### Artists Table:
```sql
artists (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  stage_name VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  whatsapp VARCHAR(20),
  password VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  city VARCHAR(100),
  price_min INTEGER,
  price_max INTEGER,
  bio TEXT,
  profile_image TEXT,
  status VARCHAR(50), -- 'pending', 'active', 'rejected'
  is_verified BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP
)
```

### Categories Table:
```sql
categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  icon VARCHAR(50)
)
```

### Bookings Table:
```sql
bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  artist_id INTEGER REFERENCES artists(id),
  event_date DATE,
  event_type VARCHAR(100),
  venue VARCHAR(255),
  status VARCHAR(50), -- 'pending', 'confirmed', 'completed', 'cancelled'
  created_at TIMESTAMP
)
```

## 🚀 Deployment Strategy

### Three Separate Vercel Projects:

1. **Frontend Project**
   - Name: `spotmystar`
   - Root: `frontend/`
   - Framework: Vite
   - Env: `VITE_API_URL`

2. **Admin Panel Project**
   - Name: `spotmystar-admin`
   - Root: `admin-panel/`
   - Framework: Vite
   - Env: `VITE_API_URL`

3. **Backend Project**
   - Name: `spotmystar-backend`
   - Root: `backend/`
   - Framework: Other (Node.js)
   - Env: `DATABASE_URL`, `JWT_SECRET`, etc.

### Why Separate Deployments?

✅ **Security**: Admin panel isolated from public app
✅ **Scalability**: Each can scale independently
✅ **Maintenance**: Update one without affecting others
✅ **Performance**: Optimized builds for each app
✅ **Access Control**: Different domains for different users

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt for password storage
3. **Role-Based Access**: Admin vs User vs Artist
4. **CORS Configuration**: Controlled API access
5. **Environment Variables**: Sensitive data protected
6. **Separate Admin Domain**: Admin panel isolated
7. **Token Expiration**: 7-day expiry for security

## 📈 Scalability Considerations

- **Stateless Backend**: Easy horizontal scaling
- **Database Connection Pooling**: Efficient DB usage
- **CDN for Static Assets**: Fast global delivery
- **Serverless Functions**: Auto-scaling on Vercel
- **Separate Services**: Independent scaling per app

## 🎯 Key Benefits of This Architecture

1. **Separation of Concerns**: Each app has single responsibility
2. **Independent Deployment**: Deploy without affecting others
3. **Shared Resources**: One backend, one database
4. **Cost Effective**: Free tier on Vercel + Supabase
5. **Easy Maintenance**: Clear structure, easy to debug
6. **Professional**: Industry-standard architecture
7. **Secure**: Admin isolated from public access

## 🔄 Development Workflow

```bash
# Start all services locally
Terminal 1: cd backend && npm run dev       # Port 5000
Terminal 2: cd frontend && npm run dev      # Port 5173
Terminal 3: cd admin-panel && npm run dev   # Port 5174

# Make changes
# Test locally
# Commit and push

# Automatic deployment
git push → GitHub → Vercel auto-deploys all three projects
```

## 📞 Support & Documentation

- Main README: `/README.md`
- Deployment Guide: `/DEPLOYMENT_GUIDE.md`
- Admin Panel Guide: `/admin-panel/README.md`
- Setup Complete: `/admin-panel/SETUP_COMPLETE.md`

---

**Built with ❤️ by [@anku5265](https://github.com/anku5265)**
