import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applySchema() {
  try {
    console.log('Reading schema-v2.sql...');
    const schema = fs.readFileSync('./database/schema-v2.sql', 'utf8');
    
    console.log('Applying schema to database...');
    await pool.query(schema);
    
    console.log('✓ Schema v2 applied successfully!');
    console.log('✓ Categories seeded');
    console.log('✓ Category attributes seeded');
    console.log('✓ All tables created');
    
    process.exit(0);
  } catch (error) {
    console.error('Error applying schema:', error.message);
    process.exit(1);
  }
}

applySchema();
