# 🚀 Quick Start

## Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account

## 1-Minute Setup

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/artist-discovery
JWT_SECRET=mysecretkey123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### Step 3: Seed Database
```bash
cd backend
npm run seed
```

Output:
```
✓ Categories seeded
✓ Admin user created (email: admin@artisthub.com, password: admin123)
✅ Database seeded successfully!
```

### Step 4: Start Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 5: Open App
Visit: http://localhost:5173

## Test the App

### 1. Register as Artist
- Click "Join as Artist"
- Fill form (use any email/password)
- Submit → Status: Pending

### 2. Admin Approval
- Go to http://localhost:5173/admin/login
- Login: `admin@artisthub.com` / `admin123`
- Click "Artists Management"
- Click "Approve" on your artist

### 3. Artist Login
- Go to http://localhost:5173/artist/login
- Login with your artist email/password
- View dashboard & bookings

### 4. Book an Artist
- Go to homepage
- Search artists
- Click artist profile
- Click "Send Booking Request"
- Fill form & submit

## Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas (free): mongodb.com/cloud/atlas

**Port Already in Use?**
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.js`

**Email Not Sending?**
- Get Gmail App Password: myaccount.google.com/apppasswords
- Enable 2FA first
- Use app password in EMAIL_PASS

## What's Next?

1. ✅ Test all features
2. 📝 Read FEATURES.md for full feature list
3. 🚀 Read DEPLOYMENT.md to deploy
4. 🎨 Customize UI colors in `tailwind.config.js`
5. 📧 Setup real email credentials

## Default Accounts

**Admin:**
- Email: admin@artisthub.com
- Password: admin123

**Categories Created:**
- DJ 🎧
- Anchor 🎤
- Band 🎸
- Singer 🎵
- Dancer 💃
- Comedian 😂

## Project URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api

Enjoy building! 🎉
