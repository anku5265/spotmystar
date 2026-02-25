# 🚀 Supabase Setup Guide (5 Minutes)

## Step 1: Create Supabase Account

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)

## Step 2: Create New Project

1. Click "New Project"
2. Fill details:
   - **Name**: ArtistHub
   - **Database Password**: Create strong password (SAVE THIS!)
   - **Region**: Southeast Asia (Singapore) - closest to India
   - **Pricing Plan**: Free

3. Click "Create new project"
4. Wait 2-3 minutes for setup

## Step 3: Get Connection Details

1. Go to **Project Settings** (gear icon)
2. Click **Database** tab
3. Scroll to **Connection string**
4. Copy **URI** (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

5. Go to **API** tab
6. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

## Step 4: Setup Database Schema

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**
3. Copy entire content from `backend/database/schema.sql`
4. Paste in SQL Editor
5. Click **Run** (bottom right)
6. You should see: "Success. No rows returned"

## Step 5: Configure Backend

1. Open `backend/.env` file
2. Update with your Supabase details:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=mysupersecretkey123456789

# Email Config (Optional - skip for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Step 6: Install Dependencies & Run

```bash
cd backend
npm install
npm run seed
npm run dev
```

You should see:
```
✓ PostgreSQL connected
✓ Database connected at: [timestamp]
✓ Server running on port 5000
```

## Step 7: Start Frontend

```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## ✅ Verification

1. Open http://localhost:5173
2. Click "Join as Artist" - register
3. Login as admin: admin@artisthub.com / admin123
4. Approve artist
5. Test booking flow

## 🎉 What You Get with Supabase Free Tier

- ✅ 500 MB Database (20,000+ artists)
- ✅ 1 GB File Storage (for images)
- ✅ Unlimited API requests
- ✅ Auto backups
- ✅ Real-time features
- ✅ Built-in authentication
- ✅ Free forever!

## Troubleshooting

**Connection Error?**
- Check DATABASE_URL is correct
- Verify password has no special characters
- Make sure you ran schema.sql

**Seed Script Fails?**
- Run schema.sql first in Supabase SQL Editor
- Check DATABASE_URL format

**Port 5000 in use?**
- Change PORT in .env to 5001

## Next Steps

✅ App is running with Supabase!
- Add real artists
- Test all features
- Deploy to production

---

**Supabase Dashboard**: https://app.supabase.com
**Docs**: https://supabase.com/docs
