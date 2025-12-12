-- Fix Admin Chat: Create Admin User
-- The error "No admin found to send message to" occurs because there's no user with role='admin'

-- Step 1: Check current users and their roles
SELECT 
    au.id,
    au.email,
    au.created_at,
    COALESCE(u.role, p.role, 'no role set') as current_role
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

-- Step 2: Make a user admin (choose ONE of these options)

-- Option A: If you have a specific email you want to make admin, replace 'your-email@example.com'
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Option B: Make the first/oldest user an admin
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

-- Option C: If role is stored in profiles table instead of users table:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

-- Step 3: Verify the admin was created
-- SELECT au.email, u.role FROM auth.users au JOIN users u ON u.id = au.id WHERE u.role = 'admin';
