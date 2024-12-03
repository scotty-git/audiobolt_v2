import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imzdzbmdafzxvemrhnbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltemR6Ym1kYWZ6eHZlbXJobmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzU4MDMsImV4cCI6MjA0ODcxMTgwM30.UbBq1vltdU-WkxOkWZVurxF7Srz7BOO_Ebzz6Op0dDg';

export const supabase = createClient(supabaseUrl, supabaseKey); 