# Supabase Reconnection Guide

## Current Status: DISCONNECTED ⚠️

The project has been disconnected from Supabase. Follow these steps to reconnect with a new Supabase project.

---

## Step-by-Step Reconnection Process

### 1. Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: SpotMyStar (or any name you prefer)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
5. Click "Create new project"
6. Wait for project to be created (takes 1-2 minutes)

---

### 2. Get Database Connection String

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **Database**
3. Scroll down to **Connection String**
4. Select **Session Pooler** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:your-password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

---

### 3. Get API Credentials

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **API**
3. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

### 4. Update Backend .env File

1. Open `backend/.env` file
2. Uncomment and update these lines:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

3. Save the file

---

### 5. Run Database Schema

Open terminal in `backend` folder and run:

```bash
# Install dependencies (if not already done)
npm install

# Run the schema to create tables
node -e "import('./database/schema.sql').then()"
```

Or manually:
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy content from `backend/database/schema.sql`
3. Paste and click **Run**

---

### 6. Seed Initial Data

Run this command to populate categories and sample data:

```bash
npm run seed
```

Or manually:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run the seed script

---

### 7. Test Connection

1. Start the backend server:
   ```bash
   npm start
   ```

2. You should see:
   ```
   ✓ Supabase connected
   ✓ Server running on port 5000
   ```

3. Test the API:
   ```bash
   curl http://localhost:5000/api/categories
   ```

---

### 8. Update Frontend (if needed)

The frontend should automatically connect to the backend. No changes needed unless you're deploying to production.

---

## Troubleshooting

### Connection Error
- Double-check DATABASE_URL is correct
- Ensure password doesn't have special characters (or URL encode them)
- Verify Supabase project is active

### Tables Not Found
- Run the schema.sql file in Supabase SQL Editor
- Check if tables were created in Supabase Dashboard → Table Editor

### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check SUPABASE_ANON_KEY is correct

---

## Quick Reference

**Files to Update:**
- `backend/.env` - Main configuration file

**Important Commands:**
```bash
# Start backend
cd backend
npm start

# Run seed data
npm run seed

# Start frontend
cd frontend
npm run dev
```

---

## Need Help?

If you encounter any issues:
1. Check Supabase project is active
2. Verify all credentials are correct
3. Check server logs for specific errors
4. Ensure all dependencies are installed

---

**Last Updated:** December 2024
**Status:** Ready for reconnection
