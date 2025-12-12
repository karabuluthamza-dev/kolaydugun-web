-- Check columns of the profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
