-- Check dependencies and safely delete test leads

-- 1. Check what tables reference leads
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'leads';

-- 2. Check vendor_leads table
SELECT 
    vl.id,
    vl.vendor_id,
    vl.lead_id,
    l.contact_name,
    l.contact_email
FROM vendor_leads vl
JOIN leads l ON vl.lead_id = l.id
ORDER BY vl.created_at DESC;

-- 3. Delete all test leads (this will cascade to vendor_leads if FK is set)
-- CAREFUL: This deletes ALL leads!
DELETE FROM public.leads;

-- 4. Verify deletion
SELECT COUNT(*) as remaining_leads FROM public.leads;
SELECT COUNT(*) as remaining_vendor_leads FROM public.vendor_leads;
