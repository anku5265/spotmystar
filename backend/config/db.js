import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database Configuration - DISCONNECTED
// Update DATABASE_URL in .env file to reconnect

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('your-project') || connectionString.includes('undefined')) {
  console.log('⚠ DATABASE DISCONNECTED');
  console.log('  To reconnect:');
  console.log('  1. Create new Supabase project');
  console.log('  2. Update DATABASE_URL in backend/.env');
  console.log('  3. Restart the server');
}

const pool = new Pool({
  connectionString: connectionString || 'postgresql://localhost:5432/spotmystar',
  ssl: connectionString && !connectionString.includes('localhost') ? {
    rejectUnauthorized: false
  } : false
});

export default pool;
