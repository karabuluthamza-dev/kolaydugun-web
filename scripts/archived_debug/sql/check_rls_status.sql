-- Check if RLS is enabled on vendor_leads
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'vendor_leads';

-- If rowsecurity = true, we can temporarily disable it for testing
-- ALTER TABLE public.vendor_leads DISABLE ROW LEVEL SECURITY;
