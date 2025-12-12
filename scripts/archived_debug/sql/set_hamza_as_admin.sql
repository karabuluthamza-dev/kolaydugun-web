-- Set karabulut.hamza@gmail.com as admin user
-- This will fix the "No admin found to send message to" error

-- First, verify the user exists and check current role
SELECT 
    au.id,
    au.email,
    COALESCE(u.role, 'no role') as current_role_in_users,
    COALESCE(p.role, 'no role') as current_role_in_profiles
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'karabulut.hamza@gmail.com';

-- Update role to admin in users table
UPDATE users 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'karabulut.hamza@gmail.com'
);

-- If role is in profiles table instead, uncomment this:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (
--     SELECT id 
--     FROM auth.users 
--     WHERE email = 'karabulut.hamza@gmail.com'
-- );

-- Verify the update
SELECT 
    au.id,
    au.email,
    u.role as role_in_users
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE au.email = 'karabulut.hamza@gmail.com';
