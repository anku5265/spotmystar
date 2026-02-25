# 🚀 Quick Run Guide

## MongoDB Setup (Choose One)

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artisthub
   ```

### Option 2: Install MongoDB Locally
**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs automatically
4. Keep default URI in `.env`: `mongodb://localhost:27017/artist-discovery`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Run the App

### Step 1: Start Backend
```bash
cd backend
npm run seed    # Seed database (creates admin + categories)
npm run dev     # Start backend server
```

Backend runs on: http://localhost:5000

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## Test the App

1. **Open**: http://localhost:5173
2. **Register Artist**: Click "Join as Artist"
3. **Admin Login**: http://localhost:5173/admin/login
   - Email: `admin@artisthub.com`
   - Password: `admin123`
4. **Approve Artist**: Go to Artists Management → Approve
5. **Artist Login**: http://localhost:5173/artist/login
6. **Test Booking**: Search artists → Send request

## Troubleshooting

**MongoDB Connection Error?**
- Use MongoDB Atlas (cloud) - easier!
- Or install MongoDB locally

**Port 5000 Already in Use?**
- Change PORT in `backend/.env` to 5001
- Update proxy in `frontend/vite.config.js`

**Email Not Working?**
- Skip for now - emails are optional
- Booking requests still work without email

## Next Steps

✅ App is running!
- Test all features
- Add real artists
- Deploy to production (see DEPLOYMENT.md)

---

**Need Help?**
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Node.js: https://nodejs.org/
