import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import artistRoutes from './routes/artists.js';
import categoryRoutes from './routes/categories.js';
import bookingRoutes from './routes/bookings.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userMgmtRoutes from './routes/user-mgmt.js';
import artistAnalyticsRoutes from './routes/artist-analytics.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/artists', artistRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user-management', userMgmtRoutes);
app.use('/api/artist-analytics', artistAnalyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SpotMyStar API - PostgreSQL/Supabase' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'SpotMyStar API is running!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
