-- Drop existing policies
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON templates;
DROP POLICY IF EXISTS "Templates are editable by authenticated users" ON templates;
DROP POLICY IF EXISTS "Templates are updatable by authenticated users" ON templates;

-- Create new policies that allow all operations during migration
CREATE POLICY "Allow all operations during migration"
ON templates FOR ALL
USING (true)
WITH CHECK (true);

-- Temporarily disable RLS
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;

-- After migration is complete, you can re-enable RLS and set up proper policies with:
/*
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" 
ON templates FOR SELECT 
USING (true);

CREATE POLICY "Templates are editable by authenticated users" 
ON templates FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Templates are updatable by authenticated users" 
ON templates FOR UPDATE 
TO authenticated 
USING (true);
*/ 