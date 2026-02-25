# 🎵 SpotMyStar - Artist Discovery & Booking Platform

A modern platform to discover and book talented artists (DJs, Singers, Dancers, Bands, Anchors, Comedians) for your events.

## ✨ Features

- 🎭 **Browse Artists** - Search by category, city, and price range
- 📅 **Easy Booking** - Book artists directly through the platform
- ✅ **Verified Artists** - Admin-approved artists with verified badges
- 👤 **User Accounts** - Save favorites and manage bookings
- 🎨 **Artist Profiles** - Showcase photos, videos, and experience
- 📊 **Admin Dashboard** - Manage artists, users, and bookings
- 🔐 **Secure Authentication** - JWT-based auth with encrypted passwords

## 🚀 Quick Start

### For New Developers

**📖 Complete Setup Guide:** See [SETUP_FOR_OTHERS.md](./SETUP_FOR_OTHERS.md)

### Quick Summary

1. **Clone the repo**
   ```bash
   git clone https://github.com/anku5265/spotmystar.git
   cd spotmystar
   ```

2. **Setup Supabase**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Run `backend/database/schema.sql` in SQL Editor
   - Get connection string and API keys

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file (see SETUP_FOR_OTHERS.md)
   npm run seed
   npm start
   ```

4. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open** http://localhost:5173

## 🔑 Default Credentials

### Admin Panel
- URL: http://localhost:5173/admin/login
- Email: `admin@spotmystar.com`
- Password: `admin123`

## 📁 Project Structure

```
spotmystar/
├── backend/              # Express.js API
│   ├── config/          # Database configuration
│   ├── database/        # SQL schema
│   ├── routes/          # API endpoints
│   ├── models/          # Data models
│   └── server.js        # Entry point
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app
│   └── vite.config.js
│
└── docs/                # Documentation
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- React Router

### Backend
- Node.js
- Express.js
- PostgreSQL (Supabase)
- JWT Authentication
- Bcrypt

## 📚 Documentation

- **[SETUP_FOR_OTHERS.md](./SETUP_FOR_OTHERS.md)** - Complete setup guide
- **[SYSTEM_FLOW_COMPLETE.md](./SYSTEM_FLOW_COMPLETE.md)** - System architecture
- **[NAVBAR_IMPROVEMENTS.md](./NAVBAR_IMPROVEMENTS.md)** - UI/UX improvements
- **[SUPABASE_COMPLETE_GUIDE.md](./SUPABASE_COMPLETE_GUIDE.md)** - Database guide

## 🎯 User Flows

### For Users (Booking Artists)
1. Browse artists by category/city
2. View artist profiles
3. Send booking request
4. Contact via WhatsApp/Instagram

### For Artists (Getting Bookings)
1. Register with profile details
2. Wait for admin approval
3. Get verified badge
4. Receive booking requests
5. Accept/reject bookings

### For Admin (Platform Management)
1. Review artist registrations
2. Approve/reject artists
3. Monitor bookings
4. View platform statistics

## 🔒 Environment Variables

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_database_connection_string

# Security
JWT_SECRET=your_jwt_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

### Test Admin Login
```
URL: http://localhost:5173/admin/login
Email: admin@spotmystar.com
Password: admin123
```

### Test User Registration
1. Click "Book Artists"
2. Click "Register here"
3. Fill form and submit

### Test Artist Registration
1. Click "For Artists"
2. Click "Register here"
3. Fill form and submit
4. Admin approval required

## 🐛 Troubleshooting

### Database Connection Error
- Verify `.env` file has correct `DATABASE_URL`
- Use Session Pooler connection string (not Direct)
- Check Supabase project is active

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID [PID]

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

### Public
- `GET /api/categories` - Get all categories
- `GET /api/artists/search` - Search artists
- `GET /api/artists/:id` - Get artist profile
- `POST /api/bookings` - Create booking

### Authentication
- `POST /api/auth/user/register` - User registration
- `POST /api/auth/user/login` - User login
- `POST /api/auth/artist/login` - Artist login
- `POST /api/auth/admin/login` - Admin login

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/artists` - All artists
- `GET /api/admin/users` - All users
- `GET /api/admin/bookings` - All bookings
- `PATCH /api/admin/artists/:id/verify` - Approve/reject artist

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Set environment variables
2. Deploy from GitHub
3. Run seed script

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`

### Database (Supabase)
- Already hosted
- Just use connection string

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Ankush Kumar**
- GitHub: [@anku5265](https://github.com/anku5265)

## 🙏 Acknowledgments

- Supabase for database hosting
- Tailwind CSS for styling
- Framer Motion for animations

---

**⭐ Star this repo if you find it helpful!**

For detailed setup instructions, see [SETUP_FOR_OTHERS.md](./SETUP_FOR_OTHERS.md)
