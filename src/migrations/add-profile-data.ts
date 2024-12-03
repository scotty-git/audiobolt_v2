import { supabase } from '../lib/supabase';

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

export async function addProfileData() {
  try {
    // Add profile_data column
    const { error: alterError } = await supabase.rpc('alter_users_add_profile', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_data JSONB NOT NULL 
        DEFAULT '${JSON.stringify(defaultProfileData)}'::jsonb;
        
        CREATE INDEX IF NOT EXISTS idx_users_profile_data 
        ON users USING GIN (profile_data);
      `
    });

    if (alterError) throw alterError;
    
    console.log('Successfully added profile_data column');
    return true;
  } catch (error) {
    console.error('Failed to add profile_data:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  addProfileData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 