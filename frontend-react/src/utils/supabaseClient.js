import { createClient } from '@supabase/supabase-js';

// Get configuration from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dmitkbbyslvodlynxiyy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn("⚠️ Warning: Supabase Anon Key is missing. Image uploads will not work until you define VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

