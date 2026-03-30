import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Service role key — needed for storage bucket management
// Get from: Supabase Dashboard → Settings → API → service_role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase connected');

  // Admin client with service_role — used for storage operations
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    console.log('✓ Supabase admin client ready');
  } else {
    // Fallback: use anon key (bucket must be pre-created manually)
    supabaseAdmin = supabase;
    console.log('⚠ SUPABASE_SERVICE_ROLE_KEY not set — using anon key for storage');
  }
} else {
  console.log('⚠ Supabase DISCONNECTED - Update credentials in .env file');
}

export { supabase, supabaseAdmin };
