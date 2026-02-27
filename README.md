# 🎵 SpotMyStar

Artist Discovery & Booking Platform

## 🚀 Quick Setup (Clone & Run)

```bash
# 1. Clone
git clone https://github.com/anku5265/spotmystar.git
cd spotmystar

# 2. Backend
cd backend
npm install
npm start

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Admin Panel (new terminal)
cd admin-panel
npm install
npm run dev

# 5. Open
Frontend: http://localhost:5173
Admin Panel: http://localhost:5174
```

## 🔑 Admin Login
- URL: http://localhost:5174 (separate admin panel)
- Email: admin@spotmystar.com
- Password: admin123

## 📁 Project Structure
- `backend/` - Node.js/Express API server
- `frontend/` - Main user/artist application (React + Vite)
- `admin-panel/` - Separate admin dashboard (React + Vite)

## 🐛 Troubleshooting

### Error: "DATABASE_URL not found"
Make sure `backend/.env` file exists. If not, create it with:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://vwshclfigoocrjybigg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3c2hjbGZpZ29vY3JqeWJpZ2ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDk1NzU5NiwiZXhwIjoyMDUwNTMzNTk2fQ.KHEwT7_vYqxLZxQGJLxvYqxLZxQGJLxvYqxLZxQGJLw
DATABASE_URL=postgresql://postgres.vwshclfigeocytjybigg:ankushankush%401904@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=spotmystar_jwt_secret_key_2024_secure
FRONTEND_URL=http://localhost:5173
```

### Error: "connect ECONNREFUSED"
- Make sure you ran `npm install` in backend folder
- Check if `backend/.env` file exists
- Restart the backend server

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID [PID]
```

## ✨ Features
- Browse artists by category, city, price
- Easy booking system
- Admin-verified artists
- User accounts & wishlists
- Artist profiles with photos/videos

## 🛠️ Tech Stack
React, Node.js, Express, PostgreSQL (Supabase), Tailwind CSS

## 👨‍💻 Author
Ankush Kumar - [@anku5265](https://github.com/anku5265)
