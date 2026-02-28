import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
  console.log('PORT:', process.env.PORT || '5000 (default)');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');
  console.log('');

  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful!');
    console.log('Current time from DB:', result.rows[0].now);
    console.log('');

    // Test tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    console.log('');

    // Test categories
    const categories = await pool.query('SELECT COUNT(*) FROM categories');
    console.log(`✓ Categories table: ${categories.rows[0].count} records`);

    // Test artists
    const artists = await pool.query('SELECT COUNT(*) FROM artists');
    console.log(`✓ Artists table: ${artists.rows[0].count} records`);

    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
