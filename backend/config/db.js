import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Build connection string from individual env vars or use DATABASE_URL
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

if (!connectionString || connectionString.includes('undefined')) {
  console.error('❌ ERROR: Database configuration not found!');
  console.error('Please set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
