-- Step 3: Safely delete all test leads and related data

-- Delete in correct order to respect foreign keys

-- 1. Delete from messages table (if any)
DELETE FROM public.messages WHERE lead_id IS NOT NULL;

-- 2. Delete from lead_unlocks table (if any)
DELETE FROM public.lead_unlocks;

-- 3. Delete from vendor_leads table
DELETE FROM public.vendor_leads;

-- 4. Finally delete all leads
DELETE FROM public.leads;

-- 5. Verify deletion
SELECT 'Leads remaining:' as info, COUNT(*) as count FROM public.leads
UNION ALL
SELECT 'Vendor_leads remaining:', COUNT(*) FROM public.vendor_leads
UNION ALL
SELECT 'Lead_unlocks remaining:', COUNT(*) FROM public.lead_unlocks
UNION ALL
SELECT 'Messages with lead_id remaining:', COUNT(*) FROM public.messages WHERE lead_id IS NOT NULL;
