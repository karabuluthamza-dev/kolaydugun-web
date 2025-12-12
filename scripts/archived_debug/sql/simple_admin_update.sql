-- SIMPLE FIX: Just update the role, no fancy checks needed

-- Step 1: Update role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'karabulut.hamza@gmail.com';

-- Step 2: Verify it worked
SELECT id, email, role
FROM profiles
WHERE email = 'karabulut.hamza@gmail.com';
