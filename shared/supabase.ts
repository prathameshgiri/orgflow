import { createClient } from '@supabase/supabase-js';

// Handle both Vite browser environment and Node server environment
const isBrowser = typeof window !== 'undefined';

// Use Vite's import.meta.env for browser, process.env for Node
const supabaseUrl = isBrowser 
  ? (import.meta as any).env.VITE_SUPABASE_URL 
  : process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isBrowser 
  ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY 
  : process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
