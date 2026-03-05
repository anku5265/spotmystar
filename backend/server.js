import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import artistRoutes from './routes/artists.js';
import categoryRoutes from './routes/categories.js';
import bookingRoutes from './routes/bookings.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import adminAdvancedRoutes from './routes/admin-advanced.js';
import userMgmtRoutes from './routes/user-mgmt.js';
import artistAnalyticsRoutes from './routes/artist-analytics.js';
// New role-specific routes
import userRoutes from './routes/user-routes.js';
import artistSpecificRoutes from './routes/artist-routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no authentication required)
app.use('/api/artists', artistRoutes); // Public artist search/view
app.use('/api/categories', categoryRoutes); // Public categories
app.use('/api/auth', authRoutes); // Login/register

// Role-specific protected routes
app.use('/api/user', userRoutes); // User-only routes
app.use('/api/artist', artistSpecificRoutes); // Artist-only routes
app.use('/api/bookings', bookingRoutes); // User-only booking creation

// Admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin-advanced', adminAdvancedRoutes);
app.use('/api/user-management', userMgmtRoutes);
app.use('/api/artist-analytics', artistAnalyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SpotMyStar API - Role-Based Access Control Enabled' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'SpotMyStar API is running with strict role isolation!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Role-based access control enabled`);
  });
}

// Export for Vercel serverless
export default app;
