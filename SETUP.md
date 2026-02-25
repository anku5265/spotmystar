# Quick Setup Guide

## Installation

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/artist-discovery
JWT_SECRET=your_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

Seed database:
```bash
npm run seed
```

Start backend:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Default Admin Credentials
- Email: `admin@artisthub.com`
- Password: `admin123`

## Testing Flow

1. **Register as Artist**
   - Go to http://localhost:5173/artist/register
   - Fill form and submit
   - Status will be "Pending"

2. **Admin Approval**
   - Login at http://localhost:5173/admin/login
   - Use admin credentials above
   - Go to Artists Management
   - Approve the pending artist

3. **Artist Login**
   - Go to http://localhost:5173/artist/dashboard
   - Login with artist email/password
   - View dashboard

4. **User Booking**
   - Search artists on homepage
   - Click artist profile
   - Send booking request
   - Artist receives email

## Project Structure

```
artist-discovery/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Artist.js          # Artist schema
│   │   ├── Booking.js         # Booking schema
│   │   ├── Category.js        # Category schema
│   │   └── User.js            # User/Admin schema
│   ├── routes/
│   │   ├── admin.js           # Admin APIs
│   │   ├── artists.js         # Artist APIs
│   │   ├── auth.js            # Authentication
│   │   ├── bookings.js        # Booking APIs
│   │   └── categories.js      # Category APIs
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                # Database seeder
│   └── server.js              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── ArtistDashboard.jsx
│   │   │   ├── ArtistProfile.jsx
│   │   │   ├── ArtistRegister.jsx
│   │   │   ├── BookingSuccess.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── App.jsx            # Routes
│   │   ├── index.css          # Tailwind styles
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── DEPLOYMENT.md              # Deployment guide
├── FEATURES.md                # Feature list
├── README.md                  # Overview
└── SETUP.md                   # This file
```

## API Endpoints

### Public
- `GET /api/categories` - Get all categories
- `GET /api/artists/search?city=Delhi&category=...` - Search artists
- `GET /api/artists/featured` - Featured artists
- `GET /api/artists/:identifier` - Artist profile
- `POST /api/artists/register` - Artist registration
- `POST /api/bookings` - Create booking request

### Artist (Auth Required)
- `POST /api/auth/artist/login` - Artist login
- `GET /api/bookings/artist/:artistId` - Get artist bookings
- `PATCH /api/bookings/:id/status` - Update booking status

### Admin (Auth Required)
- `POST /api/auth/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/artists` - All artists
- `PATCH /api/admin/artists/:id/verify` - Approve/reject artist
- `GET /api/admin/bookings` - All bookings

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Bcrypt
- Nodemailer
- CORS

## Next Steps

1. Add image upload (Cloudinary)
2. Implement wishlist functionality
3. Add reviews & ratings
4. Payment integration
5. Artist availability calendar
6. Advanced filters
7. Mobile app (React Native)

## Support

For issues or questions, check:
- README.md for overview
- FEATURES.md for feature details
- DEPLOYMENT.md for production setup
