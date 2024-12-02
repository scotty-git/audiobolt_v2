import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables in Node.js environment
if (typeof process !== 'undefined') {
  dotenv.config();
}

// Get environment variables from either Vite or Node.js process
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  throw new Error(`Missing environment variable: ${key}`);
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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