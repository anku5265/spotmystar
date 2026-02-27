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

async function runMigration() {
  try {
    console.log('🚀 Starting migration to v2 schema...\n');
    
    const migration = fs.readFileSync('./database/migration-to-v2.sql', 'utf8');
    
    console.log('📝 Applying migration...');
    await pool.query(migration);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('✓ New tables created: artist_categories, category_attributes, artist_attribute_values');
    console.log('✓ New columns added to artists and categories tables');
    console.log('✓ Existing data migrated');
    console.log('✓ New categories seeded');
    console.log('✓ Sample attributes added');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
