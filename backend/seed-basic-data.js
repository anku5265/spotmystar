import pool from './config/db.js';

async function seedBasicData() {
  try {
    console.log('🌱 Seeding basic data...');

    // Check if categories exist
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
    const categoryCount = parseInt(categoriesResult.rows[0].count);

    if (categoryCount === 0) {
      console.log('📂 Seeding categories...');
      
      const categories = [
        { name: 'DJ', icon: '🎧', slug: 'dj', description: 'Professional DJs for parties and events' },
        { name: 'Band', icon: '🎸', slug: 'band', description: 'Live bands for concerts and events' },
        { name: 'Anchor', icon: '🎤', slug: 'anchor', description: 'Event hosts and anchors' },
        { name: 'Dancer', icon: '💃', slug: 'dancer', description: 'Professional dancers and choreographers' },
        { name: 'Singer', icon: '🎵', slug: 'singer', description: 'Vocalists for events and performances' },
        { name: 'Comedian', icon: '😂', slug: 'comedian', description: 'Stand-up comedians and entertainers' }
      ];

      for (const cat of categories) {
        await pool.query(`
          INSERT INTO categories (name, icon, slug, description, is_active, display_order)
          VALUES ($1, $2, $3, $4, true, 0)
          ON CONFLICT (slug) DO NOTHING
        `, [cat.name, cat.icon, cat.slug, cat.description]);
      }
      
      console.log('✅ Categories seeded successfully');
    } else {
      console.log('📂 Categories already exist, skipping...');
    }

    // Check if artists exist
    const artistsResult = await pool.query('SELECT COUNT(*) FROM artists WHERE is_verified = true');
    const artistCount = parseInt(artistsResult.rows[0].count);

    if (artistCount === 0) {
      console.log('🎭 Seeding sample artists...');
      
      // Get category IDs
      const catResult = await pool.query('SELECT id, name FROM categories LIMIT 6');
      const categories = catResult.rows;

      const sampleArtists = [
        {
          full_name: 'Rajesh Kumar',
          stage_name: 'DJ Raj',
          email: 'djraj@example.com',
          phone: '9876543210',
          city: 'Mumbai',
          description: 'Professional DJ with 5+ years experience in Bollywood and EDM',
          price_min: 15000,
          price_max: 50000,
          category: 'DJ'
        },
        {
          full_name: 'Priya Sharma',
          stage_name: 'Priya Live',
          email: 'priya@example.com',
          phone: '9876543211',
          city: 'Delhi',
          description: 'Versatile singer specializing in Bollywood and classical music',
          price_min: 20000,
          price_max: 75000,
          category: 'Singer'
        },
        {
          full_name: 'Amit Patel',
          stage_name: 'The Rockers',
          email: 'rockers@example.com',
          phone: '9876543212',
          city: 'Bangalore',
          description: 'Rock band with original compositions and cover songs',
          price_min: 30000,
          price_max: 100000,
          category: 'Band'
        },
        {
          full_name: 'Neha Gupta',
          stage_name: 'Neha Anchor',
          email: 'neha@example.com',
          phone: '9876543213',
          city: 'Pune',
          description: 'Professional event anchor and host for corporate events',
          price_min: 10000,
          price_max: 40000,
          category: 'Anchor'
        },
        {
          full_name: 'Rohit Singh',
          stage_name: 'Dance Fusion',
          email: 'rohit@example.com',
          phone: '9876543214',
          city: 'Hyderabad',
          description: 'Contemporary and Bollywood dance choreographer',
          price_min: 12000,
          price_max: 45000,
          category: 'Dancer'
        },
        {
          full_name: 'Vikram Joshi',
          stage_name: 'Comedy King',
          email: 'vikram@example.com',
          phone: '9876543215',
          city: 'Chennai',
          description: 'Stand-up comedian with clean humor for all audiences',
          price_min: 8000,
          price_max: 35000,
          category: 'Comedian'
        }
      ];

      for (const artist of sampleArtists) {
        // Find category ID
        const category = categories.find(c => c.name === artist.category);
        const categoryId = category ? category.id : categories[0].id;

        await pool.query(`
          INSERT INTO artists (
            full_name, stage_name, email, phone, city, description,
            price_min, price_max, category_id, status, is_verified,
            profile_image, rating, total_bookings, views
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', true, $10, $11, $12, $13)
          ON CONFLICT (email) DO NOTHING
        `, [
          artist.full_name,
          artist.stage_name,
          artist.email,
          artist.phone,
          artist.city,
          artist.description,
          artist.price_min,
          artist.price_max,
          categoryId,
          'https://via.placeholder.com/400x300/1a1a2e/ffffff?text=' + encodeURIComponent(artist.stage_name),
          4.5, // rating
          Math.floor(Math.random() * 50) + 10, // total_bookings
          Math.floor(Math.random() * 1000) + 100 // views
        ]);
      }
      
      console.log('✅ Sample artists seeded successfully');
    } else {
      console.log('🎭 Artists already exist, skipping...');
    }

    console.log('🎉 Basic data seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seedBasicData();