-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS maintain_profile_structure ON users;
DROP FUNCTION IF EXISTS ensure_profile_data_structure();

-- Modify profile_data column to be completely flexible
ALTER TABLE users 
ALTER COLUMN profile_data SET DEFAULT '{}'::jsonb;

-- Keep the GIN index for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_profile_data 
ON users USING GIN (profile_data);