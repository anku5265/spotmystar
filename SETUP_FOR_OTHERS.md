# 🚀 SpotMyStar - Complete Setup Guide for New Developers

## 📋 Prerequisites

Before starting, make sure you have:
- Node.js (v16 or higher)
- npm or yarn
- Git
- A Supabase account (free tier works)

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/anku5265/spotmystar.git
cd spotmystar
```

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill details:
   - Project Name: `spotmystar` (or any name)
   - Database Password: Create a strong password (SAVE THIS!)
   - Region: Choose closest to you (e.g., Mumbai for India)
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire content from `backend/database/schema.sql` file
4. Paste it in the SQL Editor
5. Click **"Run"** button
6. You should see: "Success. No rows returned"

This will create all tables:
- categories
- artists
- users
- bookings
- wishlist

### 2.3 Get Database Connection Details

1. In Supabase Dashboard, go to **Project Settings** (gear icon, bottom left)
2. Click **"Database"** in the left menu
3. Scroll down to **"Connection string"**
4. Select **"Session Pooler"** (NOT Direct connection)
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password

### 2.4 Get API Keys

1. Go to **Project Settings** > **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## ⚙️ Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Create .env File

Create a file named `.env` in the `backend` folder:

```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

### 3.3 Edit .env File

Open `backend/.env` and fill in these values:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# JWT Secret (create any random string)
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Important:**
- Replace `SUPABASE_URL` with your Project URL from Step 2.4
- Replace `SUPABASE_ANON_KEY` with your anon public key from Step 2.4
- Replace `DATABASE_URL` with your connection string from Step 2.3
- For `JWT_SECRET`, use any random long string (e.g., `spotmystar_secret_2024_xyz123abc`)

### 3.4 Seed the Database

This will create admin user and categories:

```bash
npm run seed
```

You should see:
```
✓ PostgreSQL connected
✓ Admin user created (email: admin@spotmystar.com, password: admin123)
✓ Categories seeded
✅ Database seeded successfully!
```

### 3.5 Start Backend Server

```bash
npm start
```

You should see:
```
✓ Server running on port 5000
✓ PostgreSQL connected
✓ Database connected at: [timestamp]
```

**Keep this terminal open!**

---

## 🎨 Step 4: Frontend Setup

Open a **NEW terminal** (keep backend running):

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Start Frontend Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.21  ready in [time] ms
➜  Local:   http://localhost:5173/
```

---

## ✅ Step 5: Verify Everything Works

### 5.1 Open the Website

Open browser and go to: **http://localhost:5173**

You should see the SpotMyStar homepage!

### 5.2 Test Admin Login

1. Go to: **http://localhost:5173/admin/login**
2. Login with:
   - Email: `admin@spotmystar.com`
   - Password: `admin123`
3. You should see the Admin Dashboard!

### 5.3 Test User Registration

1. Click "Book Artists" button
2. Click "Register here"
3. Fill the form and submit
4. You should be logged in!

### 5.4 Test Artist Registration

1. Click "For Artists" button
2. Click "Register here"
3. Fill the form and submit
4. You should see "Awaiting admin approval" message

---

## 🔧 Troubleshooting

### Problem 1: "Database connection error"

**Solution:**
- Check if your `DATABASE_URL` in `.env` is correct
- Make sure you're using **Session Pooler** connection string (NOT Direct connection)
- Verify your database password is correct
- Check if you ran the schema.sql file in Supabase

### Problem 2: "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Problem 3: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem 4: Frontend can't connect to backend

**Solution:**
- Make sure backend is running on port 5000
- Check `frontend/vite.config.js` has correct proxy settings
- Restart both frontend and backend

---

## 📝 Important Files

### Backend .env (NEVER commit this!)
```
backend/.env
```

### Database Schema
```
backend/database/schema.sql
```

### Frontend Config
```
frontend/vite.config.js
```

---

## 🎯 Default Credentials

### Admin
- URL: http://localhost:5173/admin/login
- Email: admin@spotmystar.com
- Password: admin123

### Test User (after registration)
- Create your own account via "Book Artists" button

### Test Artist (after registration)
- Create your own account via "For Artists" button
- Wait for admin approval

---

## 🚀 Running the Project (After Initial Setup)

Every time you want to run the project:

### Terminal 1 (Backend):
```bash
cd backend
npm start
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## 📦 Project Structure

```
spotmystar/
├── backend/
│   ├── config/          # Database & Supabase config
│   ├── database/        # SQL schema
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── .env            # Environment variables (CREATE THIS!)
│   ├── .env.example    # Example env file
│   ├── server.js       # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── vite.config.js   # Vite configuration
│   └── package.json
│
└── README.md
```

---

## 🔐 Security Notes

1. **NEVER commit `.env` file to Git**
2. **Change default admin password** after first login
3. **Use strong JWT_SECRET** in production
4. **Enable RLS (Row Level Security)** in Supabase for production

---

## 📞 Need Help?

If you face any issues:
1. Check the troubleshooting section above
2. Make sure all steps are followed correctly
3. Verify your Supabase project is active
4. Check if both servers are running

---

## ✅ Checklist

- [ ] Cloned repository
- [ ] Created Supabase project
- [ ] Ran schema.sql in Supabase
- [ ] Got connection string and API keys
- [ ] Created backend/.env file
- [ ] Filled all values in .env
- [ ] Ran `npm install` in backend
- [ ] Ran `npm run seed` in backend
- [ ] Started backend server (port 5000)
- [ ] Ran `npm install` in frontend
- [ ] Started frontend server (port 5173)
- [ ] Tested admin login
- [ ] Tested user registration
- [ ] Tested artist registration

---

## 🎉 Success!

If all steps are completed, you should have:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Database connected to Supabase
- ✅ Admin panel accessible
- ✅ User registration working
- ✅ Artist registration working

**Happy Coding! 🚀**
