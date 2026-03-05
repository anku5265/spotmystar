import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Seed basic data endpoint
router.post('/basic-data', async (req, res) => {
  try {
    console.log('🌱 Seeding basic data...');

    // Check if categories exist
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
    const categoryCount = parseInt(categoriesResult.rows[0].count);

    if (categoryCount === 0) {
      console.log('📂 Seeding categories...');
      
      const categories = [
        { name: 'DJ', icon: '🎧', description: 'Professional DJs for parties and events' },
        { name: 'Band', icon: '🎸', description: 'Live bands for concerts and events' },
        { name: 'Anchor', icon: '🎤', description: 'Event hosts and anchors' },
        { name: 'Dancer', icon: '💃', description: 'Professional dancers and choreographers' },
        { name: 'Singer', icon: '🎵', description: 'Vocalists for events and performances' },
        { name: 'Comedian', icon: '😂', description: 'Stand-up comedians and entertainers' }
      ];

      for (const cat of categories) {
        await pool.query(`
          INSERT INTO categories (name, icon, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO NOTHING
        `, [cat.name, cat.icon, cat.description]);
      }
      
      console.log('✅ Categories seeded successfully');
    }

    // Check if artists exist
    const artistsResult = await pool.query('SELECT COUNT(*) FROM artists WHERE is_verified = true');
    const artistCount = parseInt(artistsResult.rows[0].count);

    if (artistCount < 3) {
      console.log('🎭 Seeding sample artists...');
      
      // Get category IDs
      const catResult = await pool.query('SELECT id, name FROM categories LIMIT 6');
      const categories = catResult.rows;

      const sampleArtists = [
        {
          full_name: 'Rajesh Kumar',
          stage_name: 'DJ_Raj_' + Date.now(),
          email: 'djraj' + Date.now() + '@example.com',
          phone: '9876543210',
          whatsapp: '9876543210',
          city: 'Mumbai',
          bio: 'Professional DJ with 5+ years experience in Bollywood and EDM',
          price_min: 15000,
          price_max: 50000,
          category: 'DJ',
          password: 'password123'
        },
        {
          full_name: 'Priya Sharma',
          stage_name: 'Priya_Live_' + Date.now(),
          email: 'priya' + Date.now() + '@example.com',
          phone: '9876543211',
          whatsapp: '9876543211',
          city: 'Delhi',
          bio: 'Versatile singer specializing in Bollywood and classical music',
          price_min: 20000,
          price_max: 75000,
          category: 'Singer',
          password: 'password123'
        },
        {
          full_name: 'Amit Patel',
          stage_name: 'The_Rockers_' + Date.now(),
          email: 'rockers' + Date.now() + '@example.com',
          phone: '9876543212',
          whatsapp: '9876543212',
          city: 'Bangalore',
          bio: 'Rock band with original compositions and cover songs',
          price_min: 30000,
          price_max: 100000,
          category: 'Band',
          password: 'password123'
        },
        {
          full_name: 'Neha Gupta',
          stage_name: 'Neha_Anchor_' + Date.now(),
          email: 'neha' + Date.now() + '@example.com',
          phone: '9876543213',
          whatsapp: '9876543213',
          city: 'Pune',
          bio: 'Professional event anchor and host for corporate events',
          price_min: 10000,
          price_max: 40000,
          category: 'Anchor',
          password: 'password123'
        },
        {
          full_name: 'Rohit Singh',
          stage_name: 'Dance_Fusion_' + Date.now(),
          email: 'rohit' + Date.now() + '@example.com',
          phone: '9876543214',
          whatsapp: '9876543214',
          city: 'Hyderabad',
          bio: 'Contemporary and Bollywood dance choreographer',
          price_min: 12000,
          price_max: 45000,
          category: 'Dancer',
          password: 'password123'
        },
        {
          full_name: 'Vikram Joshi',
          stage_name: 'Comedy_King_' + Date.now(),
          email: 'vikram' + Date.now() + '@example.com',
          phone: '9876543215',
          whatsapp: '9876543215',
          city: 'Chennai',
          bio: 'Stand-up comedian with clean humor for all audiences',
          price_min: 8000,
          price_max: 35000,
          category: 'Comedian',
          password: 'password123'
        }
      ];

      for (const artist of sampleArtists) {
        // Find category ID
        const category = categories.find(c => c.name === artist.category);
        const categoryId = category ? category.id : categories[0]?.id;

        if (!categoryId) continue;

        const hashedPassword = await bcrypt.hash(artist.password, 10);

        await pool.query(`
          INSERT INTO artists (
            full_name, stage_name, email, phone, whatsapp, city, bio,
            price_min, price_max, category_id, status, is_verified,
            profile_image, password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved', true, $11, $12)
          ON CONFLICT (email) DO NOTHING
        `, [
          artist.full_name,
          artist.stage_name,
          artist.email,
          artist.phone,
          artist.whatsapp,
          artist.city,
          artist.bio,
          artist.price_min,
          artist.price_max,
          categoryId,
          'https://via.placeholder.com/400x300/1a1a2e/ffffff?text=' + encodeURIComponent(artist.stage_name),
          hashedPassword
        ]);
      }
      
      console.log('✅ Sample artists seeded successfully');
    }

    res.json({ 
      message: 'Basic data seeded successfully!',
      categoriesCount: categoryCount,
      artistsCount: artistCount
    });
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

export default router;