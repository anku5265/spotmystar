# 🚀 SpotMyStar - Setup Guide

## Step 1: Clone Repository

```bash
git clone https://github.com/anku5265/spotmystar.git
cd spotmystar
```

## Step 2: Setup Supabase Database

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (save your database password!)
3. Go to SQL Editor and run `backend/database/schema.sql`
4. Go to Settings > Database > Connection String
5. Select "Session Pooler" and copy the connection string
6. Go to Settings > API and copy:
   - Project URL
   - anon public key

## Step 3: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

JWT_SECRET=any_random_long_string_here

FRONTEND_URL=http://localhost:5173
```

**Important:** Replace with your actual values from Supabase!

Seed the database:

```bash
npm run seed
```

Start backend:

```bash
npm start
```

## Step 4: Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

## Step 5: Open Browser

Go to: http://localhost:5173

## Default Admin Login

- URL: http://localhost:5173/admin/login
- Email: admin@spotmystar.com
- Password: admin123

## Troubleshooting

### Database connection error?
- Check your DATABASE_URL in .env
- Make sure you used "Session Pooler" connection string
- Verify your database password is correct

### Port 5000 already in use?
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]
```

### Module not found?
```bash
rm -rf node_modules package-lock.json
npm install
```

That's it! 🎉
