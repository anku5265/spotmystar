import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL from .env
const PRODUCTION_DB_URL = process.env.DATABASE_URL;

const { Pool } = pg;

const pool = new Pool({
  connectionString: PRODUCTION_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting PRODUCTION database migration...\n');
    console.log('⚠️  WARNING: This will modify the production database!\n');
    
    const migration = fs.readFileSync('./database/migration-to-v2.sql', 'utf8');
    
    console.log('📝 Applying migration to PRODUCTION database...');
    await pool.query(migration);
    
    console.log('\n✅ PRODUCTION Migration completed successfully!');
    console.log('✓ New tables created: artist_categories, category_attributes, artist_attribute_values');
    console.log('✓ New columns added to artists and categories tables');
    console.log('✓ Existing data migrated');
    console.log('✓ New categories seeded');
    console.log('✓ Sample attributes added');
    console.log('\n🎉 Production database is ready for multi-category system!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ PRODUCTION Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
