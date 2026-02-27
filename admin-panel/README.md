# 🎛️ SpotMyStar Admin Panel

Separate admin dashboard for managing the SpotMyStar platform.

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
http://localhost:5174
```

## 🔑 Default Login Credentials

- Email: `admin@spotmystar.com`
- Password: `admin123`

## ✨ Features

### Dashboard Overview
- Total users count
- Active artists count
- Pending approvals count
- Total bookings count
- Artists breakdown by category

### Pending Approvals
- View all pending artist registrations
- See complete artist information (name, email, WhatsApp, city, price range)
- Accept artist (activates profile and makes visible to users)
- Reject artist (artist can re-register later)
- Ignore (keeps in pending status for later review)

### All Artists
- View all registered artists
- Filter by status (active, pending, rejected)
- See verification status
- Monitor profile views

### All Users
- View all registered users
- See registration dates
- Monitor user activity

## 🛠️ Tech Stack

- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icons)

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   └── Toast.jsx          # Toast notification component
│   ├── config/
│   │   └── api.js             # Axios configuration
│   ├── pages/
│   │   ├── Login.jsx          # Admin login page
│   │   └── Dashboard.jsx      # Main dashboard
│   ├── App.jsx                # App router
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── .env                       # Local environment variables
├── .env.production            # Production environment variables
├── vercel.json                # Vercel deployment config
└── package.json
```

## 🌐 Environment Variables

### Local (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Production (.env.production)
```env
VITE_API_URL=https://spotmystar-backend.vercel.app
```

## 🚀 Deployment on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Project Name: `spotmystar-admin`
   - Root Directory: `admin-panel`
   - Framework Preset: Vite
4. Add Environment Variable:
   - `VITE_API_URL=https://spotmystar-backend.vercel.app`
5. Deploy!

## 🔐 Security Notes

- Admin panel is completely separate from main user/artist app
- Uses JWT token authentication
- Token stored in localStorage
- Protected routes redirect to login if not authenticated
- Shares same backend and database as main app

## 📝 API Endpoints Used

- `POST /api/auth/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/artists` - Get all artists
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/artists/:id/verify` - Accept/reject artist

## 🎨 UI Features

- Dark theme with gradient accents
- Responsive design (mobile-friendly)
- Toast notifications for user feedback
- Tab-based navigation
- Real-time data updates
- Clean and modern interface

## 🔄 Workflow

1. Admin logs in with credentials
2. Views dashboard overview with statistics
3. Checks pending artist approvals
4. Reviews artist information
5. Accepts/rejects/ignores applications
6. Monitors all artists and users
7. Logs out when done

## 📞 Support

For issues or questions, contact: [@anku5265](https://github.com/anku5265)
