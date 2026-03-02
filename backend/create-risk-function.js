import pool from './config/db.js';

async function createRiskFunction() {
  try {
    console.log('🚀 Creating risk scoring function...');

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_user_risk_score(user_id_param UUID, user_type_param VARCHAR)
      RETURNS INTEGER AS $$
      DECLARE
          calculated_risk_score INTEGER := 0;
          flag_count INTEGER;
          recent_activity_count INTEGER;
      BEGIN
          -- Count unresolved risk flags
          SELECT COUNT(*) INTO flag_count
          FROM risk_flags 
          WHERE user_id = user_id_param 
          AND user_type = user_type_param 
          AND resolved = false;
          
          -- Add risk based on flags
          calculated_risk_score := calculated_risk_score + (flag_count * 20);
          
          -- Check for suspicious recent activity
          SELECT COUNT(*) INTO recent_activity_count
          FROM activity_log 
          WHERE user_id = user_id_param 
          AND user_type = user_type_param 
          AND created_at > NOW() - INTERVAL '24 hours'
          AND activity_type IN ('login', 'profile_edit');
          
          -- Add risk for excessive activity
          IF recent_activity_count > 50 THEN
              calculated_risk_score := calculated_risk_score + 30;
          ELSIF recent_activity_count > 20 THEN
              calculated_risk_score := calculated_risk_score + 15;
          END IF;
          
          -- Cap risk score at 100
          IF calculated_risk_score > 100 THEN
              calculated_risk_score := 100;
          END IF;
          
          -- Update the risk score
          IF user_type_param = 'user' THEN
              UPDATE users SET risk_score = calculated_risk_score WHERE id = user_id_param;
          ELSE
              UPDATE artists SET risk_score = calculated_risk_score WHERE id = user_id_param;
          END IF;
          
          RETURN calculated_risk_score;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Risk scoring function created');

    // Test the function
    const testResult = await pool.query(`SELECT update_user_risk_score('00000000-0000-0000-0000-000000000000'::UUID, 'user')`);
    console.log('✅ Function test successful');

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating function:', error);
    process.exit(1);
  }
}

createRiskFunction();