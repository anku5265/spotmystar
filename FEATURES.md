# Artist Discovery Platform - Features

## User Features

### 1. Homepage
- Hero section with city search
- "Near Me" geolocation button
- Featured artists carousel
- Category grid (DJ, Anchor, Band, etc.)
- Premium dark theme UI with glassmorphism

### 2. Search & Discovery
- City-based search
- Category filters
- Budget range slider
- Grid/List view toggle
- Artist cards with:
  - Profile image with hover effects
  - Verified badge
  - Price range
  - Rating & booking count
  - Wishlist heart icon

### 3. Artist Profile
- Cover banner + profile picture
- Bio and description
- Category badges
- Price range display
- Contact buttons (WhatsApp, Instagram)
- Image/video gallery carousel
- Stats (views, bookings, rating)
- Booking request modal

### 4. Booking Flow
- Modal form with:
  - Name, phone, email
  - Event date picker
  - Location
  - Budget
  - Message
- Email notification to artist
- Success confirmation page

### 5. Wishlist
- Save favorite artists
- Comparison table
- Quick access to profiles

## Artist Features

### 1. Registration
- Self-signup form
- Profile details (name, bio, city)
- Category selection
- Price range
- Contact info (email, WhatsApp, Instagram)
- Pending status until admin approval

### 2. Artist Dashboard
- Login with email/password
- Stats cards:
  - Profile views
  - Total requests
  - Accepted bookings
- Booking requests table:
  - Client details
  - Event info
  - Accept/Reject buttons
- Profile edit (coming soon)

### 3. Vanity URLs
- Custom URLs: `yourapp.com/stagename`
- Shareable on Instagram bio

## Admin Features

### 1. Admin Dashboard
- Stats overview:
  - Total artists
  - Pending approvals
  - Total bookings
  - Today's bookings

### 2. Artist Management
- View all artists
- Filter by status (pending/active/inactive)
- Search by name/email
- Approve/Reject pending artists
- Edit artist profiles

### 3. Booking Management
- View all booking requests
- Filter by status
- View client & event details
- Track booking lifecycle

### 4. Category Management
- Add/edit categories
- Assign icons

## Technical Features

### Frontend
- React 18 + Vite
- Tailwind CSS (dark theme)
- Framer Motion animations
- Lucide React icons
- Responsive design (mobile-first)
- PWA ready

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Nodemailer for emails
- RESTful API
- CORS enabled

### Database Schema
- **artists**: Full profile with verification
- **categories**: DJ, Anchor, etc.
- **bookings**: Request tracking
- **users**: Admin & wishlist

### Security
- Password hashing (bcrypt)
- JWT tokens
- Input validation
- CORS protection

## Premium UI Elements
- Glassmorphism cards
- Gradient buttons
- Smooth transitions
- Hover effects
- Dark theme
- Responsive grid layouts

## Future Enhancements (Post-MVP)
- Payment integration (Razorpay)
- Reviews & ratings
- Artist availability calendar
- Advanced search filters
- Push notifications
- Chat system
- Multi-language support
- Analytics dashboard
