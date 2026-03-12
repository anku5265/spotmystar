import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase Configuration - DISCONNECTED
// Uncomment and update these values when you have new Supabase credentials

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Only create client if credentials are provided
if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase connected');
} else {
  console.log('⚠ Supabase DISCONNECTED - Update credentials in .env file to reconnect');
}

export { supabase };
