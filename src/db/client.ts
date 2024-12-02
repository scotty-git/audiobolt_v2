import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database connection...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    console.log('Session status:', session ? 'Active' : 'No active session');

    // Try to fetch templates to verify database access
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('count');

    if (templatesError) {
      console.error('Error accessing templates:', templatesError);
    } else {
      console.log('Successfully connected to templates table');
    }

    return session;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}; 