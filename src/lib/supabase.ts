import { createClient } from '@supabase/supabase-js';

// Realty Center's public Supabase project. Publishable keys are intended for browser use;
// row-level security remains the authorization boundary. Deployment env vars can override these defaults.
const DEFAULT_SUPABASE_URL = 'https://lkkqjyovhvidjtmobjtm.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-MROef2IdDAmKAIAR-KROg_RF-YZM99';
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.error('Supabase is not configured. Check the Realty Center public project settings.');
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);
