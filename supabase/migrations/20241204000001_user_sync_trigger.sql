-- Create a trigger function to sync auth.users with our users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',  -- Default role for all new signups
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle edge case: Insert any existing auth.users that don't exist in our users table
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  'user',
  created_at,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users); 