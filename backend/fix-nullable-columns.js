import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixNullableColumns() {
  try {
    console.log('🔧 Fixing NOT NULL constraints on old columns...\n');
    
    // Make old columns nullable since we're using new columns now
    const alterations = [
      'ALTER TABLE artists ALTER COLUMN whatsapp DROP NOT NULL',
      'ALTER TABLE artists ALTER COLUMN bio DROP NOT NULL',
      'ALTER TABLE artists ALTER COLUMN category_id DROP NOT NULL'
    ];

    for (const sql of alterations) {
      try {
        await pool.query(sql);
        console.log(`✓ ${sql}`);
      } catch (error) {
        if (error.code === '42703') {
          console.log(`⚠ Column doesn't exist, skipping`);
        } else {
          console.log(`⚠ ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Schema fixed! Old columns are now nullable.');
    console.log('New registrations will use: phone, primary_city, short_bio instead.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixNullableColumns();
