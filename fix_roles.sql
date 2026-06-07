-- Drop old constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with all 4 roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'dispatcher',
  'supervisor', 
  'observer',
  'citizen'
));

-- Verify constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'profiles_role_check';
