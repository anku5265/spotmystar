# SpotMyStar - Artist Discovery Platform

Location-based artist booking platform for India - DJs, Anchors, Performers.

**Discover. Connect. Book Your Star.** ⭐

## Tech Stack
- **Frontend**: React + Tailwind CSS + Vite (PWA ready)
- **Backend**: Node.js + Express + MongoDB
- **Auth**: JWT
- **Email**: Nodemailer
- **Deploy**: Vercel (frontend) + Render (backend)

## Features
- 🔍 City/category search with filters
- 📍 Location-based "Near Me" discovery
- 💼 Artist profiles with gallery & booking
- 📱 Direct WhatsApp/Instagram integration
- ⭐ Wishlist & comparison
- 🎨 Artist dashboard (edit profile, manage requests)
- 🛡️ Admin panel (approve artists, manage bookings)

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add MongoDB URI, JWT secret, email config
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Database Schema
- **artists**: Profiles with city, category, pricing, verification
- **categories**: DJ, Anchor, Band, etc.
- **bookings**: User requests with status tracking
- **users**: Optional login for wishlist

## Deployment
- Frontend: `vercel --prod`
- Backend: Connect GitHub to Render
