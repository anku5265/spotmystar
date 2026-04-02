import pool from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const newCategories = [
  { name: 'Anchor / Host', icon: '??', slug: 'anchor-host', description: 'Event hosts and anchors' },
  { name: 'Singer', icon: '??', slug: 'singer', description: 'Vocalists for events and performances' },
  { name: 'DJ', icon: '??', slug: 'dj', description: 'Professional DJs for parties and events' },
  { name: 'Dancer', icon: '??', slug: 'dancer', description: 'Professional dancers and performers' },
  { name: 'Band', icon: '??', slug: 'band', description: 'Live bands for concerts and events' },
  { name: 'Comedian', icon: '??', slug: 'comedian', description: 'Stand-up comedians and entertainers' },
  { name: 'Model', icon: '??', slug: 'model', description: 'Professional models for shoots and events' },
  { name: 'Actor', icon: '??', slug: 'actor', description: 'Actors for ads, films and events' },
  { name: 'Influencer / Content Creator', icon: '??', slug: 'influencer-content-creator', description: 'Social media influencers and content creators' },
  { name: 'Photographer', icon: '??', slug: 'photographer', description: 'Professional photographers' },
  { name: 'Videographer', icon: '??', slug: 'videographer', description: 'Professional videographers' },
  { name: 'Makeup Artist', icon: '??', slug: 'makeup-artist', description: 'Professional makeup artists' },
  { name: 'Choreographer', icon: '??', slug: 'choreographer', description: 'Dance choreographers' }
];

async function migrateCategories() {
  try {
    console.log('Starting category migration...');
    
    // Insert new categories, update if slug exists
    for (let i = 0; i < newCategories.length; i++) {
      const cat = newCategories[i];
      await pool.query(`
        INSERT INTO categories (name, icon, slug, description, is_active, display_order)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          description = EXCLUDED.description,
          is_active = true,
          display_order = EXCLUDED.display_order,
          updated_at = NOW()
      `, [cat.name, cat.icon, cat.slug, cat.description, i + 1]);
      console.log('Upserted: ' + cat.name);
    }

    // Deactivate old categories not in new list
    const newSlugs = newCategories.map(c => c.slug);
    const placeholders = newSlugs.map((_, i) => '$' + (i + 1)).join(',');
    await pool.query(
      `UPDATE categories SET is_active = false WHERE slug NOT IN (${placeholders})`,
      newSlugs
    );

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrateCategories();
