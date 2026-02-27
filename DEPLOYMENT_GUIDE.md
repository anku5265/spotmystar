# 🚀 SpotMyStar - Deployment Guide

## Option 1: Backend on Render + Frontend on Vercel (Recommended)

### Step 1: Deploy Backend on Render

1. **Go to [render.com](https://render.com)** and sign up with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repo: `anku5265/spotmystar`
   - Select repository

3. **Configure Service:**
   ```
   Name: spotmystar-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables:**
   ```
   PORT=5000
   NODE_ENV=production
   SUPABASE_URL=https://vwshclfigoocrjybigg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3c2hjbGZpZ29vY3JqeWJpZ2ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDk1NzU5NiwiZXhwIjoyMDUwNTMzNTk2fQ.KHEwT7_vYqxLZxQGJLxvYqxLZxQGJLxvYqxLZxQGJLw
   DATABASE_URL=postgresql://postgres.vwshclfigeocytjybigg:ankushankush%401904@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   JWT_SECRET=spotmystar_jwt_secret_key_2024_secure
   FRONTEND_URL=https://spotmystar.vercel.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes
   - Copy your backend URL: `https://spotmystar-backend.onrender.com`

### Step 2: Update Frontend on Vercel

1. **Update vercel.json:**
   - Already created in `frontend/vercel.json`
   - Update the backend URL if different

2. **Redeploy on Vercel:**
   - Go to Vercel dashboard
   - Select your project
   - Click "Redeploy"
   - Or push to GitHub (auto-deploys)

3. **Done!** Your site should work now.

---

## Option 2: Both on Vercel

### Backend on Vercel:

1. **Create New Project on Vercel:**
   - Import `anku5265/spotmystar`
   - Root Directory: `backend`
   - Framework Preset: Other

2. **Environment Variables:**
   Add all the same variables as above

3. **Deploy**

### Frontend on Vercel:

1. **Update vercel.json** with your backend Vercel URL
2. **Redeploy**

---

## Testing Deployment

### Test Backend:
```
https://your-backend-url.onrender.com/api/categories
```

Should return JSON with categories.

### Test Frontend:
```
https://spotmystar.vercel.app
```

Should load the website.

---

## Troubleshooting

### Backend not working?
- Check Render logs
- Verify environment variables
- Make sure DATABASE_URL is correct

### Frontend not connecting to backend?
- Check vercel.json has correct backend URL
- Check browser console for errors
- Verify CORS is enabled (already done in backend)

### Database connection error?
- Verify Supabase is active
- Check DATABASE_URL format
- Make sure password is URL-encoded

---

## Important Notes

1. **Render Free Tier:** Backend sleeps after 15 min of inactivity. First request takes 30-60 seconds.

2. **Vercel:** Frontend is always fast, no sleep.

3. **Database:** Supabase is always active.

4. **Cost:** Everything is FREE!

---

## URLs After Deployment

- **Frontend:** https://spotmystar.vercel.app
- **Backend:** https://spotmystar-backend.vercel.app
- **Admin Panel:** https://spotmystar-admin.vercel.app (separate deployment)
- **Database:** Supabase (already setup)

---

## Admin Panel Deployment (Separate)

The admin panel is a completely separate application that shares the same backend and database.

### Deploy Admin Panel on Vercel:

1. **Create New Project on Vercel:**
   - Import `anku5265/spotmystar` repository
   - Project Name: `spotmystar-admin`
   - Root Directory: `admin-panel`
   - Framework Preset: Vite

2. **Environment Variables:**
   ```
   VITE_API_URL=https://spotmystar-backend.vercel.app
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your admin panel will be live at: `https://spotmystar-admin.vercel.app`

4. **Login:**
   - Email: admin@spotmystar.com
   - Password: admin123

### Admin Panel Features:
- View total users and artists
- See pending artist registrations
- Accept/Reject/Ignore artist applications
- View all artists and their status
- Monitor booking statistics
- Manage platform data

---

## Quick Deploy Commands

```bash
# Commit changes
git add .
git commit -m "Added deployment configs"
git push

# Vercel will auto-deploy frontend
# Render will auto-deploy backend
```

Done! 🎉
