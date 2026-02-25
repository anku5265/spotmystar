import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import artistRoutes, { mockArtists, mockCategories, mockBookings } from './routes/artists-mock.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Running in MOCK MODE (no database required)');

// Middleware
app.use(cors());
app.use(express.json());

// Mock admin user
const mockAdmin = {
  id: '1',
  email: 'admin@spotmystar.com',
  name: 'Admin',
  password: '$2a$10$rKvVPZqGhf5vZ5qZ5qZ5qeX5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', // admin123
  role: 'admin'
};

// Routes
app.use('/api/artists', artistRoutes);

// Categories
app.get('/api/categories', (req, res) => {
  res.json(mockCategories);
});

// Bookings
app.post('/api/bookings', (req, res) => {
  const booking = {
    id: String(mockBookings.length + 1),
    ...req.body,
    status: 'pending',
    created_at: new Date()
  };
  mockBookings.push(booking);
  res.status(201).json({ message: 'Booking request sent!', bookingId: booking.id });
});

app.get('/api/bookings/artist/:artistId', (req, res) => {
  const bookings = mockBookings.filter(b => b.artistId === req.params.artistId);
  res.json(bookings);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const booking = mockBookings.find(b => b.id === req.params.id);
  if (booking) {
    booking.status = req.body.status;
    res.json(booking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

// Auth
app.post('/api/auth/artist/login', async (req, res) => {
  const { email, password } = req.body;
  const artist = mockArtists.find(a => a.email === email);
  
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }
  
  const isMatch = await bcrypt.compare(password, artist.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: artist.id, role: 'artist' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  
  res.json({
    token,
    artist: {
      id: artist.id,
      fullName: artist.full_name,
      stageName: artist.stage_name,
      email: artist.email,
      isVerified: artist.is_verified,
      status: artist.status,
      views: artist.views
    }
  });
});

app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email !== mockAdmin.email) {
    return res.status(404).json({ message: 'Admin not found' });
  }
  
  const isMatch = await bcrypt.compare(password, mockAdmin.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: mockAdmin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  
  res.json({ token, user: { id: mockAdmin.id, email: mockAdmin.email, name: mockAdmin.name } });
});

// Admin
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalArtists: mockArtists.filter(a => a.status === 'active').length,
    pendingApprovals: mockArtists.filter(a => a.status === 'pending').length,
    totalBookings: mockBookings.length,
    todayBookings: 0
  });
});

app.get('/api/admin/artists', (req, res) => {
  res.json(mockArtists);
});

app.patch('/api/admin/artists/:id/verify', (req, res) => {
  const artist = mockArtists.find(a => a.id === req.params.id);
  if (artist) {
    artist.is_verified = req.body.isVerified;
    artist.status = req.body.status;
    res.json(artist);
  } else {
    res.status(404).json({ message: 'Artist not found' });
  }
});

app.get('/api/admin/bookings', (req, res) => {
  const bookingsWithArtist = mockBookings.map(b => {
    const artist = mockArtists.find(a => a.id === b.artistId);
    return {
      ...b,
      full_name: artist?.full_name,
      stage_name: artist?.stage_name
    };
  });
  res.json(bookingsWithArtist);
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'SpotMyStar API - MOCK MODE',
    note: 'Using in-memory data. Connect Supabase for production.',
    admin: 'admin@spotmystar.com / admin123'
  });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Frontend: http://localhost:5173`);
  console.log(`✓ Admin: admin@spotmystar.com / admin123`);
});
