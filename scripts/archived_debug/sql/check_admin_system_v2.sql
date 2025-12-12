-- Check if admin_conversations has user_type column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_conversations';

-- Check if any user has role 'admin'
SELECT count(*) as admin_count FROM public.profiles WHERE role = 'admin';

-- Check one admin user if exists
SELECT id, email, role FROM public.profiles WHERE role = 'admin' LIMIT 1;
