/**
 * Migration script to add unique IDs to existing records
 * Run this once to add user_id, artist_id, and booking_id columns
 * and generate IDs for existing records
 */

const pool = require('./config/db');
const fs = require('fs');
const path = require('path');
const { generateUserId, generateArtistId, generateBookingId } = require('./utils/idGenerator');

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting unique ID migration...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Read and execute SQL migration
    const sqlPath = path.join(__dirname, 'database', 'add-unique-ids.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('✓ Database schema updated');
    
    // Generate IDs for existing users
    const usersResult = await client.query(
      'SELECT id FROM users WHERE user_id IS NULL ORDER BY id'
    );
    
    console.log(`\nGenerating User IDs for ${usersResult.rows.length} users...`);
    for (const user of usersResult.rows) {
      const userId = await generateUserId();
      await client.query(
        'UPDATE users SET user_id = $1 WHERE id = $2',
        [userId, user.id]
      );
      console.log(`  User ${user.id} → ${userId}`);
    }
    console.log(`✓ Generated ${usersResult.rows.length} User IDs`);
    
    // Generate IDs for existing artists
    const artistsResult = await client.query(
      'SELECT id FROM artists WHERE artist_id IS NULL ORDER BY id'
    );
    
    console.log(`\nGenerating Artist IDs for ${artistsResult.rows.length} artists...`);
    for (const artist of artistsResult.rows) {
      const artistId = await generateArtistId();
      await client.query(
        'UPDATE artists SET artist_id = $1 WHERE id = $2',
        [artistId, artist.id]
      );
      console.log(`  Artist ${artist.id} → ${artistId}`);
    }
    console.log(`✓ Generated ${artistsResult.rows.length} Artist IDs`);
    
    // Generate IDs for existing bookings
    const bookingsResult = await client.query(
      'SELECT id FROM bookings WHERE booking_id IS NULL ORDER BY id'
    );
    
    console.log(`\nGenerating Booking IDs for ${bookingsResult.rows.length} bookings...`);
    for (const booking of bookingsResult.rows) {
      const bookingId = await generateBookingId();
      await client.query(
        'UPDATE bookings SET booking_id = $1 WHERE id = $2',
        [bookingId, booking.id]
      );
      console.log(`  Booking ${booking.id} → ${bookingId}`);
    }
    console.log(`✓ Generated ${bookingsResult.rows.length} Booking IDs`);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✓ Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Users: ${usersResult.rows.length} IDs generated`);
    console.log(`  - Artists: ${artistsResult.rows.length} IDs generated`);
    console.log(`  - Bookings: ${bookingsResult.rows.length} IDs generated`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
applyMigration()
  .then(() => {
    console.log('\nMigration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
