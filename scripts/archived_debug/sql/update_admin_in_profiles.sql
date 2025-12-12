-- Step 1: Check if profiles table has role column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';

-- Step 2: Check current role for karabulut.hamza@gmail.com
SELECT 
    p.id,
    p.email,
    p.role as current_role,
    p.name,
    p.surname
FROM profiles p
WHERE p.email = 'karabulut.hamza@gmail.com';

-- Step 3: Update role to admin in profiles table
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'karabulut.hamza@gmail.com';

-- Step 4: Verify the update
SELECT 
    p.id,
    p.email,
    p.role,
    p.name,
    p.surname
FROM profiles p
WHERE p.email = 'karabulut.hamza@gmail.com';
