-- Comprehensive lead system debugging

-- 1. Check if ANY leads exist in the database (bypass RLS)
SELECT COUNT(*) as total_leads FROM public.leads;

-- 2. Show all leads (bypass RLS with direct query)
SELECT 
    id,
    contact_name,
    contact_email,
    contact_phone,
    event_date,
    status,
    created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check RLS policies on leads table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'leads';

-- 4. Check current user's role
SELECT 
    auth.uid() as current_user_id,
    p.role as user_role
FROM profiles p
WHERE p.id = auth.uid();

-- 5. Test if current user can see leads
SELECT COUNT(*) as visible_leads_count
FROM leads;
