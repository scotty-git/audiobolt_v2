-- First, enable RLS on the responses table
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations" ON responses;
DROP POLICY IF EXISTS "Allow anonymous submissions" ON responses;
DROP POLICY IF EXISTS "Allow viewing own responses" ON responses;

-- Create policy to allow anonymous submissions
CREATE POLICY "Allow anonymous submissions"
ON responses FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow viewing responses
CREATE POLICY "Allow viewing responses"
ON responses FOR SELECT
USING (true);

-- Create policy to allow updates to responses
CREATE POLICY "Allow updating responses"
ON responses FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create policy to allow deleting responses
CREATE POLICY "Allow deleting responses"
ON responses FOR DELETE
USING (true); 