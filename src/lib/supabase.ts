import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'audiobolt-auth-token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV // Only enable debug in development
  }
});

// Export a function to get the same instance
export const getSupabase = () => supabase;

// Type definitions for our database tables
export type Template = {
  id: string;
  title: string;
  type: 'onboarding' | 'questionnaire';
  content: string;
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  version: string;
  category?: string;
  tags?: string[];
};

export type Response = {
  id: string;
  template_id: string;
  user_id: string;
  answers: string;
  started_at: string;
  completed_at?: string;
  last_updated: string;
  metadata?: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type Progress = {
  id: string;
  user_id: string;
  template_id: string;
  completed_sections: string[];
  skipped_sections: string[];
  current_section_id?: string;
  last_updated: string;
}; 