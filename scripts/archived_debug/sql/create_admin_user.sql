-- Create or update an admin user
-- First, let's check if there are any existing users and make one of them admin

-- Option 1: If you want to create a brand new admin user
-- You'll need to create this user through Supabase Auth first, then update their role

-- Option 2: Update an existing user to be admin
-- Replace 'user-email@example.com' with an actual user email from your system

-- Check current users and their roles
SELECT id, email, role 
FROM auth.users 
LIMIT 10;

-- To make a user admin, update their role in the users/profiles table
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
-- OR if role is in profiles table:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- For quick testing, let's make the first user an admin:
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM auth.users LIMIT 1);
