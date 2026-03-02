# Vercel Deployment Guide - Analytics Dashboard

## Issue: Changes Not Showing on Vercel

Your analytics dashboard changes are committed locally but not deployed to Vercel. Here's how to fix it:

## Step 1: Push Changes to Your Repository

You currently only have `upstream` remote (the original repo). You need to push to YOUR repository.

### Option A: If you have your own GitHub repository

```bash
# Add your repository as origin
git remote add origin https://github.com/YOUR_USERNAME/spotmystar.git

# Push changes
git push origin main
```

### Option B: If you forked the repository

```bash
# Check your fork URL
git remote -v

# If you see your fork, push to it
git push origin main
```

### Option C: If you cloned directly

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Verify Vercel is Connected

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Check "Git" settings
4. Ensure it's connected to YOUR repository (not upstream)

## Step 3: Trigger Deployment

### Automatic (Recommended)
Once you push to your repository, Vercel will automatically deploy.

### Manual
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" button

## Step 4: Check Deployment Logs

If deployment fails:
1. Go to Vercel Dashboard
2. Click on the failed deployment
3. Check "Build Logs" and "Function Logs"
4. Look for errors

## Common Issues & Solutions

### Issue 1: "Module not found" errors

**Solution**: Ensure all dependencies are in package.json

```bash
# In backend folder
cd backend
npm install

# In frontend folder
cd frontend
npm install
```

### Issue 2: Environment variables missing

**Solution**: Add environment variables in Vercel Dashboard
1. Go to Project Settings
2. Click "Environment Variables"
3. Add all variables from your .env files

**Required Backend Variables:**
- `DATABASE_URL` or Supabase credentials
- `JWT_SECRET`
- `PORT` (optional, Vercel sets this)

**Required Frontend Variables:**
- `VITE_API_URL` (should point to your backend URL)

### Issue 3: API routes returning 404

**Solution**: Check vercel.json configuration

Backend should have:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

Frontend should have:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND.vercel.app/api/:path*"
    }
  ]
}
```

### Issue 4: Database connection fails

**Solution**: 
1. Verify DATABASE_URL in Vercel environment variables
2. Check if Supabase allows connections from Vercel IPs
3. Test connection with a simple endpoint

## Step 5: Verify Analytics Dashboard

After successful deployment:

1. **Login as Artist**
   - Go to your deployed frontend URL
   - Login with artist credentials

2. **Check Dashboard**
   - Navigate to artist dashboard
   - Verify 5 analytics cards appear:
     - Profile Views (Blue)
     - Total Bookings (Green)
     - Pending Requests (Yellow)
     - Upcoming Events (Purple)
     - Wishlist Count (Pink)

3. **Test Filters**
   - Click Daily/Weekly/Monthly filters
   - Verify numbers update

4. **Check Browser Console**
   - Press F12
   - Look for any errors
   - Check Network tab for failed API calls

## Debugging Steps

### 1. Check if backend is deployed
```bash
curl https://YOUR-BACKEND.vercel.app/api
```

Should return: `{"message":"SpotMyStar API is running!"}`

### 2. Check analytics endpoint
```bash
curl https://YOUR-BACKEND.vercel.app/api/artist-analytics/stats/1?filter=daily \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check frontend build
Look for build errors in Vercel logs:
- Missing dependencies
- TypeScript errors
- Environment variable issues

## Quick Fix Commands

```bash
# 1. Ensure you're on the right branch
git branch

# 2. Check what's committed
git log --oneline -5

# 3. Check remote repositories
git remote -v

# 4. Add your repository if missing
git remote add origin https://github.com/YOUR_USERNAME/spotmystar.git

# 5. Push changes
git push origin main

# 6. If push is rejected, pull first
git pull origin main --rebase
git push origin main
```

## Vercel CLI Alternative

If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd ../frontend
vercel --prod
```

## Files Changed in This Update

**Backend:**
- `backend/routes/artist-analytics.js` - Enhanced with filtered bookings

**Frontend:**
- `frontend/src/pages/ArtistDashboard.jsx` - New analytics cards

**Documentation:**
- Multiple .md files (don't affect deployment)

## Expected Result

After successful deployment, artists should see:

```
┌─────────────────────────────────────────────────────┐
│  Performance Dashboard    [Daily][Weekly][Monthly]  │
└─────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ 👁️ 1,234 │ 📅 45    │ ⏰ 3     │ ⭐ 5     │ ❤️ 67    │
│ Profile  │ Total    │ Pending  │ Upcoming │ Wishlist │
│ Views    │ Bookings │ Requests │ Events   │ Count    │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

## Still Not Working?

1. **Check Vercel Status**: https://vercel-status.com
2. **Clear Browser Cache**: Ctrl+Shift+Delete
3. **Try Incognito Mode**: Rule out caching issues
4. **Check Vercel Logs**: Real-time function logs
5. **Contact Support**: Share deployment URL and error logs

## Need Help?

Provide these details:
- Vercel deployment URL
- Error messages from browser console
- Vercel deployment logs
- Git repository URL
- Which step you're stuck on
