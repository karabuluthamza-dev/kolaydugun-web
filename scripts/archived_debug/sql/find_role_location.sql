-- Check where role information is stored
-- Option 1: Check if profiles table exists and has role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role';

-- Option 2: Check auth.users metadata
SELECT 
    id,
    email,
    raw_user_meta_data,
    raw_user_meta_data->>'role' as role_from_metadata
FROM auth.users 
WHERE email = 'karabulut.hamza@gmail.com';

-- Option 3: List all tables to see what exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
