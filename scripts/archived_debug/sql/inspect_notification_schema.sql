-- INSPECT SCHEMA DETAILS
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name IN ('admin_notifications', 'user_notifications');

-- Check Constraints
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' 
AND c.conrelid::regclass::text IN ('admin_notifications', 'user_notifications');
