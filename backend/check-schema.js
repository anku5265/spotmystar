import pool from './config/db.js';

async function checkSchema() {
  try {
    console.log('Checking database schema...\n');
    
    // Check for new schema tables
    const tables = ['artist_categories', 'category_attributes', 'artist_attribute_values'];
    const results = {};
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        ) as exists
      `, [table]);
      results[table] = result.rows[0].exists;
    }
    
    console.log('Schema Check Results:');
    console.log('=====================');
    for (const [table, exists] of Object.entries(results)) {
      console.log(`${table}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
    }
    
    const allExist = Object.values(results).every(v => v);
    
    if (allExist) {
      console.log('\n✓ New multi-category schema is ready!');
      
      // Check if categories have the new fields
      const catCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name IN ('slug', 'category_group', 'display_order')
      `);
      
      if (catCheck.rows.length === 3) {
        console.log('✓ Categories table has new fields');
      } else {
        console.log('⚠ Categories table needs migration');
      }
      
      // Check artists table for new fields
      const artistCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'artists' AND column_name IN ('primary_city', 'service_locations', 'short_bio')
      `);
      
      if (artistCheck.rows.length === 3) {
        console.log('✓ Artists table has new fields');
      } else {
        console.log('⚠ Artists table needs migration');
      }
      
    } else {
      console.log('\n✗ New schema tables are missing');
      console.log('\nTo apply the new schema, run:');
      console.log('node backend/apply-schema-v2.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error.message);
    process.exit(1);
  }
}

checkSchema();
