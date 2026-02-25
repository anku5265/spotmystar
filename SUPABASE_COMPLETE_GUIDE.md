# 🎯 Complete Supabase Setup Guide - Step by Step

## Supabase Kya Hai?

Supabase = **PostgreSQL Database** + **File Storage** + **Authentication**

### Tumhare Project Mein:
1. **Database (PostgreSQL)** - Artist data, bookings, categories store karne ke liye
2. **Storage** - Images aur videos store karne ke liye (future)
3. **Free Tier** - 500MB database + 1GB file storage

---

## 📋 Step-by-Step Setup

### STEP 1: Account Banao (2 minutes)

1. **Browser mein open karo:** https://supabase.com
2. Click: **"Start your project"** (green button)
3. **Sign up with GitHub** (recommended) ya email se
4. GitHub authorize karo

---

### STEP 2: New Project Banao (3 minutes)

1. Dashboard mein **"New Project"** button click karo
2. **Organization select karo** (default organization)
3. Fill karo:

   **Project Name:** `ArtistHub`
   
   **Database Password:** 
   - Strong password banao (example: `MyArtist@2024`)
   - **IMPORTANT:** Is password ko save kar lo (notepad mein)
   
   **Region:** 
   - Select: **Southeast Asia (Singapore)** 
   - (India ke liye fastest)
   
   **Pricing Plan:** 
   - **Free** (already selected)

4. Click: **"Create new project"**
5. **Wait 2-3 minutes** - Project setup ho raha hai

---

### STEP 3: Database Schema Setup (2 minutes)

Jab project ready ho jaye:

1. **Left sidebar** mein **"SQL Editor"** click karo
2. Click: **"New query"** button (top right)
3. Ab do options:

   **Option A - Copy/Paste:**
   - Open file: `backend/database/schema.sql` (VS Code mein)
   - **Select All** (Ctrl+A)
   - **Copy** (Ctrl+C)
   - Supabase SQL Editor mein **Paste** (Ctrl+V)
   - Click: **"Run"** button (bottom right, ya F5)
   
   **Option B - Upload:**
   - SQL Editor mein **"Upload SQL"** option
   - Select: `backend/database/schema.sql`
   - Click: **"Run"**

4. **Success Message:**
   - Dekho: ✅ "Success. No rows returned"
   - Ya: "Success. Rows affected: X"

5. **Verify:**
   - Left sidebar → **"Table Editor"**
   - Dekhoge: `artists`, `categories`, `bookings`, `users` tables

---

### STEP 4: Connection Details Copy Karo (2 minutes)

#### A. Database URL (PostgreSQL Connection)

1. Left sidebar → **Settings** (gear icon)
2. Click: **"Database"** tab
3. Scroll down to **"Connection string"**
4. Select: **"URI"** tab
5. Copy karo (looks like):
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with your actual password

#### B. API Keys (Optional - future use)

1. Settings → **"API"** tab
2. Copy karo:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### STEP 5: Backend Configure Karo (1 minute)

1. Open: `backend/.env` file
2. Paste karo:

```env
PORT=5000
NODE_ENV=development

# Supabase Database URL
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# JWT Secret
JWT_SECRET=mysupersecretkey123456789

# Email Config (Optional - skip for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=test@example.com
EMAIL_PASS=test

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

3. **Replace:**
   - `YOUR_PASSWORD` → Your Supabase password
   - `xxxxxxxxxxxxx` → Your project ID (from URL)

---

### STEP 6: Test Connection (1 minute)

```bash
cd backend
npm run seed
```

**Success Output:**
```
✓ PostgreSQL connected
✓ Admin user created (email: admin@artisthub.com, password: admin123)
✓ Categories seeded
✅ Database seeded successfully!
```

**Error?**
- Check DATABASE_URL format
- Verify password is correct
- Make sure schema.sql ran successfully

---

### STEP 7: Run App

```bash
# Backend (already in backend folder)
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

**Open:** http://localhost:5173

---

## 🗂️ Supabase Features Explained

### 1. **Database (PostgreSQL)** ✅ USING THIS

**Kya hai:** Traditional SQL database
**Kahan use ho raha:** Artist profiles, bookings, categories, users
**Storage:** 500 MB free
**Tables:**
- `artists` - Artist profiles
- `categories` - DJ, Anchor, etc.
- `bookings` - Booking requests
- `users` - Admin users

**Access:**
- Dashboard → **Table Editor** (view/edit data)
- Dashboard → **SQL Editor** (run queries)

---

### 2. **Storage (File Storage)** 🔜 FUTURE USE

**Kya hai:** S3-like file storage for images/videos
**Kab use karenge:** Jab artist images upload karenge
**Storage:** 1 GB free

**Setup (Future):**
1. Dashboard → **Storage**
2. Create bucket: `artist-images`
3. Upload images via API
4. Get public URLs

**Current:** Abhi external URLs use kar rahe (Unsplash, etc.)

---

### 3. **Authentication** ❌ NOT USING

**Kya hai:** Built-in user auth (Google, email, etc.)
**Why not using:** Humne custom JWT auth banaya hai
**Future:** Agar chahiye toh integrate kar sakte hain

---

### 4. **Realtime** ❌ NOT USING

**Kya hai:** Live data updates (like Firebase)
**Example:** Jab booking aaye toh artist ko instant notification
**Future:** Implement kar sakte hain

---

### 5. **Edge Functions** ❌ NOT USING

**Kya hai:** Serverless functions (like AWS Lambda)
**Why not using:** Humara Express backend hai
**Future:** Agar scale karna ho toh use kar sakte hain

---

## 📊 Database Structure

### Artists Table
```sql
- id (UUID)
- full_name (text)
- stage_name (text, unique)
- category_id (UUID, foreign key)
- bio (text)
- city (text)
- price_min, price_max (integer)
- email, whatsapp, instagram (text)
- profile_image (text URL)
- gallery (text array) - Multiple image URLs
- videos (text array) - Multiple video URLs
- is_verified (boolean)
- status (pending/active/inactive)
- rating, total_bookings, views (numbers)
- password (hashed)
```

### Categories Table
```sql
- id (UUID)
- name (DJ, Anchor, etc.)
- icon (emoji)
- description (text)
```

### Bookings Table
```sql
- id (UUID)
- artist_id (foreign key)
- user_name, phone, email (text)
- event_date (date)
- event_location (text)
- budget (integer)
- message (text)
- status (pending/accepted/rejected)
```

### Users Table
```sql
- id (UUID)
- email (text)
- name (text)
- password (hashed)
- role (user/admin)
```

---

## 🎨 Image/Video Storage Strategy

### Current (MVP):
**Text Data:** Supabase PostgreSQL ✅
**Images:** External URLs (Unsplash, artist's Instagram) ✅
**Videos:** YouTube/Vimeo embed URLs ✅

### Future (Production):
**Profile Images:** Supabase Storage
**Gallery Images:** Supabase Storage
**Videos:** Supabase Storage or YouTube

**Migration Steps:**
1. Create Storage bucket
2. Update upload API
3. Generate public URLs
4. Store URLs in database

---

## 🔍 How to View Data

### Option 1: Supabase Dashboard
1. Go to: **Table Editor**
2. Select table (artists, bookings, etc.)
3. View/edit rows

### Option 2: SQL Editor
```sql
-- View all artists
SELECT * FROM artists;

-- View bookings with artist names
SELECT b.*, a.stage_name 
FROM bookings b 
JOIN artists a ON b.artist_id = a.id;

-- Count artists by city
SELECT city, COUNT(*) 
FROM artists 
GROUP BY city;
```

---

## 💰 Free Tier Limits

| Feature | Free Tier | Enough For |
|---------|-----------|------------|
| Database | 500 MB | 20,000+ artists |
| Storage | 1 GB | 5,000+ images |
| Bandwidth | 5 GB/month | 50,000+ requests |
| API Requests | Unlimited | ∞ |

---

## 🚀 Quick Commands

```bash
# Run with Supabase (real database)
cd backend
npm run dev

# Run without database (mock data)
npm run dev:mock

# Seed database
npm run seed

# Check connection
node -e "require('./config/db.js')"
```

---

## ✅ Checklist

- [ ] Supabase account created
- [ ] Project created (ArtistHub)
- [ ] Password saved
- [ ] schema.sql executed
- [ ] Tables visible in Table Editor
- [ ] DATABASE_URL copied to .env
- [ ] npm run seed successful
- [ ] App running on localhost:5173

---

## 🆘 Common Issues

**Error: "Connection refused"**
- Check DATABASE_URL format
- Verify password is correct

**Error: "relation does not exist"**
- Run schema.sql in SQL Editor first

**Error: "password authentication failed"**
- Check password in DATABASE_URL
- No special characters causing issues

**Tables not showing?**
- Refresh Table Editor
- Check SQL Editor for errors

---

**Need Help?** Check: `SUPABASE_SETUP.md` or ask me!
