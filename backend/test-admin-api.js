import pool from './config/db.js';

async function testAdminAPI() {
  try {
    console.log('🚀 Testing Advanced Admin API endpoints...');

    // Test analytics endpoint query
    console.log('\n📊 Testing analytics queries...');
    
    // User analytics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN COALESCE(account_status, 'active') = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN COALESCE(account_status, 'active') = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN COALESCE(risk_score, 0) > 60 THEN 1 END) as high_risk_users,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users
      FROM users WHERE role = 'user'
    `);
    console.log('✅ User analytics query successful:', userStats.rows[0]);

    // Artist analytics
    const artistStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN status IN ('approved', 'active') THEN 1 END) as active_artists,
        COUNT(CASE WHEN status IN ('pending', 'submitted') THEN 1 END) as pending_artists,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_artists,
        COUNT(CASE WHEN COALESCE(featured, false) = true THEN 1 END) as featured_artists,
        COUNT(CASE WHEN COALESCE(risk_score, 0) > 60 THEN 1 END) as high_risk_artists
      FROM artists
    `);
    console.log('✅ Artist analytics query successful:', artistStats.rows[0]);

    // Test risk flags query
    console.log('\n🛡️ Testing risk flags...');
    const riskFlags = await pool.query(`
      SELECT COUNT(*) as total_flags,
             COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_flags
      FROM risk_flags
    `);
    console.log('✅ Risk flags query successful:', riskFlags.rows[0]);

    // Test audit log query
    console.log('\n📝 Testing audit log...');
    const auditLog = await pool.query(`
      SELECT COUNT(*) as total_logs
      FROM admin_audit_log
    `);
    console.log('✅ Audit log query successful:', auditLog.rows[0]);

    // Test activity log query
    console.log('\n📈 Testing activity log...');
    const activityLog = await pool.query(`
      SELECT COUNT(*) as total_activities
      FROM activity_log
    `);
    console.log('✅ Activity log query successful:', activityLog.rows[0]);

    // Test advanced user query
    console.log('\n👥 Testing advanced user query...');
    const advancedUsers = await pool.query(`
      SELECT u.*, 
        COUNT(DISTINCT b.id) as total_bookings,
        0 as risk_flags_count,
        0 as login_frequency
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'user'
      GROUP BY u.id
      LIMIT 5
    `);
    console.log(`✅ Advanced users query successful: ${advancedUsers.rows.length} users found`);

    // Test advanced artist query
    console.log('\n🎭 Testing advanced artist query...');
    const advancedArtists = await pool.query(`
      SELECT DISTINCT a.*, 
        string_agg(DISTINCT c.name, ', ') as categories,
        COUNT(DISTINCT b.id) as total_bookings,
        0 as risk_flags_count,
        0 as recent_views,
        0 as recent_requests
      FROM artists a
      LEFT JOIN artist_categories ac ON a.id = ac.artist_id
      LEFT JOIN categories c ON ac.category_id = c.id
      LEFT JOIN bookings b ON a.id = b.artist_id
      WHERE 1=1
      GROUP BY a.id
      LIMIT 5
    `);
    console.log(`✅ Advanced artists query successful: ${advancedArtists.rows.length} artists found`);

    console.log('\n🎉 All API endpoint queries are working correctly!');
    console.log('\n📋 Database Status:');
    console.log(`   • Users: ${userStats.rows[0].total_users} total, ${userStats.rows[0].active_users} active`);
    console.log(`   • Artists: ${artistStats.rows[0].total_artists} total, ${artistStats.rows[0].active_artists} active`);
    console.log(`   • Risk Flags: ${riskFlags.rows[0].total_flags} total, ${riskFlags.rows[0].unresolved_flags} unresolved`);
    console.log(`   • Audit Logs: ${auditLog.rows[0].total_logs} entries`);
    console.log(`   • Activity Logs: ${activityLog.rows[0].total_activities} entries`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
}

testAdminAPI();