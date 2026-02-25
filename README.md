# 🎵 SpotMyStar

Artist Discovery & Booking Platform

## Setup

### 1. Clone
```bash
git clone https://github.com/anku5265/spotmystar.git
cd spotmystar
```

### 2. Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create new project (save database password!)
3. SQL Editor → Run `backend/database/schema.sql`
4. Settings → Database → Connection String → Select "Session Pooler"
5. Settings → API → Copy Project URL and anon key

### 3. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
JWT_SECRET=any_random_string
FRONTEND_URL=http://localhost:5173
```

```bash
npm run seed
npm start
```

### 4. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 5. Open
http://localhost:5173

## Admin Login
- URL: http://localhost:5173/admin/login
- Email: admin@spotmystar.com
- Password: admin123

## Tech Stack
React, Node.js, Express, PostgreSQL (Supabase), Tailwind CSS

## Author
Ankush Kumar - [@anku5265](https://github.com/anku5265)
