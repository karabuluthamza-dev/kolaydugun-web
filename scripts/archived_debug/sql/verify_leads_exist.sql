-- Check if ANY leads exist in database after all fixes

-- 1. Count all leads (bypass RLS)
SELECT COUNT(*) as total_leads FROM public.leads;

-- 2. Show recent leads
SELECT 
    id,
    contact_name,
    contact_email,
    status,
    category_id,
    city_id,
    created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are leads but RLS is blocking them
-- Run as authenticated user
SELECT COUNT(*) as visible_leads FROM leads;

-- 4. Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY cmd, policyname;
