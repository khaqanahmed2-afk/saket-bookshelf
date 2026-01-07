import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These will be available after the user sets up the project env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
