/**
 * Simple migration script to add unique ID columns
 * Run this to add the columns to your database
 */

import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration...\n');
    
    // Add columns
    console.log('Adding user_id column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(4) UNIQUE;
    `);
    console.log('✓ user_id column added\n');
    
    console.log('Adding artist_id column to artists table...');
    await client.query(`
      ALTER TABLE artists 
      ADD COLUMN IF NOT EXISTS artist_id VARCHAR(5) UNIQUE;
    `);
    console.log('✓ artist_id column added\n');
    
    console.log('Adding booking_id column to bookings table...');
    await client.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS booking_id VARCHAR(7) UNIQUE;
    `);
    console.log('✓ booking_id column added\n');
    
    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_artists_artist_id ON artists(artist_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
    `);
    console.log('✓ Indexes created\n');
    
    console.log('✅ Migration completed successfully!');
    console.log('\nNote: Existing records will get IDs automatically when you register new users/artists or create bookings.');
    console.log('New registrations will automatically include the unique IDs.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
