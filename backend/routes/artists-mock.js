import express from 'express';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Mock data
let mockArtists = [
  {
    id: '1',
    full_name: 'Rahul Sharma',
    stage_name: 'DJ Rahul',
    category_id: '1',
    category_name: 'DJ',
    bio: 'Professional DJ with 5+ years experience. Specializing in Bollywood, EDM, and House music.',
    city: 'Delhi',
    price_min: 15000,
    price_max: 50000,
    email: 'djrahul@example.com',
    whatsapp: '9876543210',
    instagram: 'djrahul',
    profile_image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
    ],
    is_verified: true,
    status: 'active',
    rating: 4.8,
    total_bookings: 45,
    views: 234,
    password: '$2a$10$rKvVPZqGhf5vZ5qZ5qZ5qeX5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q'
  },
  {
    id: '2',
    full_name: 'Priya Mehta',
    stage_name: 'Anchor Priya',
    category_id: '2',
    category_name: 'Anchor',
    bio: 'Experienced event anchor and MC. Perfect for corporate events, weddings, and parties.',
    city: 'Mumbai',
    price_min: 10000,
    price_max: 30000,
    email: 'priya@example.com',
    whatsapp: '9876543211',
    instagram: 'anchorpriya',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400'
    ],
    is_verified: true,
    status: 'active',
    rating: 4.9,
    total_bookings: 67,
    views: 456
  },
  {
    id: '3',
    full_name: 'Amit Kumar',
    stage_name: 'The Vibes Band',
    category_id: '3',
    category_name: 'Band',
    bio: '5-piece live band playing Bollywood, Rock, and Pop covers. Perfect for weddings and events.',
    city: 'Bangalore',
    price_min: 25000,
    price_max: 75000,
    email: 'vibesband@example.com',
    whatsapp: '9876543212',
    instagram: 'thevibesband',
    profile_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    ],
    is_verified: true,
    status: 'active',
    rating: 4.7,
    total_bookings: 32,
    views: 189
  }
];

let mockCategories = [
  { id: '1', name: 'DJ', icon: '🎧' },
  { id: '2', name: 'Anchor', icon: '🎤' },
  { id: '3', name: 'Band', icon: '🎸' },
  { id: '4', name: 'Singer', icon: '🎵' },
  { id: '5', name: 'Dancer', icon: '💃' },
  { id: '6', name: 'Comedian', icon: '😂' }
];

let mockBookings = [];

// Search artists
router.get('/search', (req, res) => {
  const { city, category, minPrice, maxPrice, search } = req.query;
  
  let filtered = mockArtists.filter(a => a.status === 'active' && a.is_verified);
  
  if (city) {
    filtered = filtered.filter(a => a.city.toLowerCase().includes(city.toLowerCase()));
  }
  
  if (category) {
    filtered = filtered.filter(a => a.category_id === category);
  }
  
  if (minPrice) {
    filtered = filtered.filter(a => a.price_min >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filtered = filtered.filter(a => a.price_max <= parseInt(maxPrice));
  }
  
  if (search) {
    filtered = filtered.filter(a => 
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.stage_name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filtered);
});

// Featured artists
router.get('/featured', (req, res) => {
  res.json(mockArtists.slice(0, 6));
});

// Get artist by ID or stage name
router.get('/:identifier', (req, res) => {
  const artist = mockArtists.find(a => 
    a.id === req.params.identifier || a.stage_name === req.params.identifier
  );
  
  if (!artist) {
    return res.status(404).json({ message: 'Artist not found' });
  }
  
  artist.views += 1;
  res.json(artist);
});

// Register artist
router.post('/register', async (req, res) => {
  const { fullName, stageName, category, bio, city, priceMin, priceMax, email, whatsapp, instagram, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newArtist = {
    id: String(mockArtists.length + 1),
    full_name: fullName,
    stage_name: stageName,
    category_id: category,
    bio,
    city,
    price_min: parseInt(priceMin),
    price_max: parseInt(priceMax),
    email,
    whatsapp,
    instagram,
    profile_image: 'https://via.placeholder.com/400',
    gallery: [],
    is_verified: false,
    status: 'pending',
    rating: 0,
    total_bookings: 0,
    views: 0,
    password: hashedPassword
  };
  
  mockArtists.push(newArtist);
  
  res.status(201).json({ 
    message: 'Registration successful! Awaiting admin approval.', 
    artistId: newArtist.id 
  });
});

export default router;
export { mockArtists, mockCategories, mockBookings };
