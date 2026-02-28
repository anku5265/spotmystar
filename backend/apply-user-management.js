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

async function applyUserManagement() {
  try {
    console.log('🚀 Adding user management features...\n');
    
    const sql = fs.readFileSync('./backend/database/add-user-management.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ User management features added successfully!');
    console.log('✓ Account status fields added to users and artists');
    console.log('✓ Suspension tracking fields added');
    console.log('✓ Notifications table created');
    console.log('✓ Indexes created for performance');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

applyUserManagement();
