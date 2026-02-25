# 🎯 START HERE - Complete Setup in 10 Minutes

## What You're Building
Artist discovery platform with 500MB+ free database (Supabase)

## Quick Setup Steps

### 1️⃣ Create Supabase Account (2 min)
1. Visit: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** (fastest)

### 2️⃣ Create Project (3 min)
1. Click **"New Project"**
2. Fill:
   - Name: `ArtistHub`
   - Password: Create strong password (**SAVE IT!**)
   - Region: **Southeast Asia (Singapore)**
   - Plan: **Free**
3. Click **"Create"**
4. Wait 2-3 minutes

### 3️⃣ Setup Database (2 min)
1. In Supabase dashboard → **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open file: `backend/database/schema.sql` (in VS Code)
4. **Copy ALL content** (Ctrl+A, Ctrl+C)
5. **Paste** in Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. Should see: ✅ "Success. No rows returned"

### 4️⃣ Get Connection Details (1 min)
1. Go to **Settings** (gear icon) → **Database**
2. Find **"Connection string"** → **URI**
3. Copy it (looks like):
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```
4. Replace `YOUR_PASSWORD` with your actual password

### 5️⃣ Configure Backend (1 min)
Open `backend/.env` and paste:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

JWT_SECRET=mysupersecretkey123456789

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@example.com
EMAIL_PASS=test

FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `YOUR_PASSWORD` with your Supabase password
- `db.xxxxx.supabase.co` with your actual Supabase URL

### 6️⃣ Run Backend (1 min)
```bash
cd backend
npm run seed
npm run dev
```

Should see:
```
✓ PostgreSQL connected
✓ Admin user created
✓ Server running on port 5000
```

### 7️⃣ Run Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

### 8️⃣ Test App
1. Open: **http://localhost:5173**
2. Click **"Join as Artist"** → Register
3. Login as admin: **admin@artisthub.com** / **admin123**
4. Approve artist
5. Test booking! 🎉

## ✅ What You Get
- 500 MB Database (20,000+ artists)
- 1 GB File Storage
- Free forever
- Auto backups
- Fast performance

## 🆘 Need Help?
Read: `SUPABASE_SETUP.md` for detailed guide

## 🚀 Next Steps
- Add real artists
- Customize UI
- Deploy to production

---

**Total Time: 10 minutes**
**Cost: ₹0 (Free forever)**
