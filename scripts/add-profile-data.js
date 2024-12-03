import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://imzdzbmdafzxvemrhnbx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltemR6Ym1kYWZ6eHZlbXJobmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzU4MDMsImV4cCI6MjA0ODcxMTgwM30.UbBq1vltdU-WkxOkWZVurxF7Srz7BOO_Ebzz6Op0dDg'
);

const defaultProfileData = {
  personal: {},
  temporal_data: [],
  relationships: [],
  behavioral_patterns: [],
  emotional_states: [],
  life_events: [],
  preferences: {
    communication: [],
    learning_style: [],
    interests: [],
    triggers: {
      positive: [],
      negative: []
    }
  },
  metadata: {
    last_assessment: null,
    completion_rate: 0,
    engagement_metrics: {},
    data_quality: {}
  }
};

async function addProfileData() {
  try {
    // First, add the column if it doesn't exist
    const { error: columnError } = await supabase
      .from('users')
      .select('profile_data')
      .limit(1);

    if (columnError) {
      // Column doesn't exist, let's add it
      const { error: alterError } = await supabase
        .rpc('execute_sql', {
          query: `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_data JSONB NOT NULL DEFAULT '${JSON.stringify(defaultProfileData)}'::jsonb`
        });

      if (alterError) throw alterError;
      console.log('Added profile_data column');
    }

    // Now update all existing rows with the default profile data
    const { data, error } = await supabase
      .from('users')
      .update({ profile_data: defaultProfileData })
      .select();

    if (error) throw error;
    console.log('Successfully updated profile_data for all users:', data);
  } catch (error) {
    console.error('Failed to add profile_data:', error);
    process.exit(1);
  }
}

addProfileData(); 