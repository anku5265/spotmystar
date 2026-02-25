# 🎵 SpotMyStar

Artist Discovery & Booking Platform - Find and book DJs, Singers, Dancers, Bands, Anchors, and Comedians for your events.

## ✨ Features

- 🎭 Browse artists by category, city, and price
- 📅 Easy booking system
- ✅ Admin-verified artists with badges
- 👤 User accounts and wishlists
- 🎨 Artist profiles with photos/videos
- 📊 Admin dashboard

## 🚀 Quick Setup

See [SETUP.md](./SETUP.md) for complete installation instructions.

### Quick Start

```bash
# 1. Clone
git clone https://github.com/anku5265/spotmystar.git
cd spotmystar

# 2. Setup Supabase (see SETUP.md)

# 3. Backend
cd backend
npm install
# Create .env file (see SETUP.md)
npm run seed
npm start

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Open http://localhost:5173
```

## 🔑 Default Admin

- URL: http://localhost:5173/admin/login
- Email: admin@spotmystar.com
- Password: admin123

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express, PostgreSQL (Supabase)  
**Auth:** JWT, Bcrypt

## 📁 Structure

```
spotmystar/
├── backend/          # Express API
│   ├── config/      # Database config
│   ├── database/    # SQL schema
│   ├── routes/      # API endpoints
│   └── .env         # Environment variables (create this!)
├── frontend/         # React app
│   └── src/
└── SETUP.md         # Setup instructions
```

## 📝 Environment Variables

Create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

See [SETUP.md](./SETUP.md) for details.

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) troubleshooting section.

## 👨‍💻 Author

Ankush Kumar - [@anku5265](https://github.com/anku5265)

---

⭐ Star this repo if you find it helpful!
