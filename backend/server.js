import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import artistRoutes from './routes/artists.js';
import categoryRoutes from './routes/categories.js';
import bookingRoutes from './routes/bookings.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import adminAdvancedRoutes from './routes/admin-advanced.js';
import userMgmtRoutes from './routes/user-mgmt.js';
import artistAnalyticsRoutes from './routes/artist-analytics.js';
import seedRoutes from './routes/seed.js';
import permissionsRoutes from './routes/permissions.js';
import messagesRoutes from './routes/messages.js';
import wishlistRoutes from './routes/wishlist.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    process.env.ARTIST_PANEL_URL,
    process.env.ADMIN_PANEL_URL,
    // Production Vercel URLs — hardcoded as fallback
    'https://spotmystar-user.vercel.app',
    'https://spotmystar-artist.vercel.app',
    'https://spotmystar-admin.vercel.app',
    'https://spotmystar.vercel.app',
    'https://artist-spotmystar.vercel.app',
    'https://admin-spotmystar.vercel.app',
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/artists', artistRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-advanced', adminAdvancedRoutes);
app.use('/api/user-management', userMgmtRoutes);
app.use('/api/artist-analytics', artistAnalyticsRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SpotMyStar API - Role-Based Access Control System' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'SpotMyStar API is running with role-based protection!' });
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
