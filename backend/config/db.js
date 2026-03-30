import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Use Transaction Mode URL (port 6543) for Vercel serverless
// Session Mode (5432) hits Supabase's 15-connection limit on free tier
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 3,                        // Vercel serverless: keep low, PgBouncer handles the rest
  idleTimeoutMillis: 10000,      // Release idle connections quickly
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('DB pool error:', err.message);
});

export default pool;
