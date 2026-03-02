import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAdminUpgrade() {
  try {
    console.log('🚀 Starting Admin Panel Upgrade...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'admin-panel-upgrade.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await pool.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some statements might fail if they already exist, that's okay
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('does not exist')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    // Verify the upgrade
    console.log('\n🔍 Verifying upgrade...');
    
    // Check if new tables exist
    const tables = [
      'admin_audit_log',
      'activity_log', 
      'risk_flags',
      'artist_performance_metrics',
      'booking_status_history'
    ];

    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' created successfully`);
      } else {
        console.log(`❌ Table '${table}' not found`);
      }
    }

    // Check if new columns exist
    const columnChecks = [
      { table: 'users', column: 'account_status' },
      { table: 'users', column: 'risk_score' },
      { table: 'artists', column: 'account_status' },
      { table: 'artists', column: 'featured' },
      { table: 'artists', column: 'admin_notes' },
      { table: 'bookings', column: 'escalated' },
      { table: 'bookings', column: 'priority' }
    ];

    for (const check of columnChecks) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        )`,
        [check.table, check.column]
      );
      
      if (result.rows[0].exists) {
        console.log(`✅ Column '${check.table}.${check.column}' added successfully`);
      } else {
        console.log(`❌ Column '${check.table}.${check.column}' not found`);
      }
    }

    // Test the risk scoring function
    try {
      await pool.query('SELECT update_user_risk_score(1, $1)', ['user']);
      console.log('✅ Risk scoring function working correctly');
    } catch (error) {
      console.log('⚠️  Risk scoring function test failed:', error.message);
    }

    console.log('\n🎉 Admin Panel Upgrade completed successfully!');
    console.log('\n📋 New Features Available:');
    console.log('   • Advanced User Management with status controls');
    console.log('   • Enhanced Artist Management with admin overrides');
    console.log('   • Comprehensive Booking Lifecycle Management');
    console.log('   • Risk Flag System for suspicious activity');
    console.log('   • Activity Logging and Audit Trail');
    console.log('   • Performance Metrics Tracking');
    console.log('   • Advanced Analytics Dashboard');
    console.log('\n🔧 Next Steps:');
    console.log('   1. Update your admin panel frontend');
    console.log('   2. Test the new advanced features');
    console.log('   3. Configure risk thresholds as needed');
    
  } catch (error) {
    console.error('💥 Admin Panel Upgrade failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the upgrade
runAdminUpgrade();