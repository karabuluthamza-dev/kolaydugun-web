-- Step 2: View all current leads with vendor relationships
SELECT 
    l.id,
    l.contact_name,
    l.contact_email,
    l.contact_phone,
    l.created_at,
    l.status,
    COUNT(vl.id) as vendor_count
FROM leads l
LEFT JOIN vendor_leads vl ON vl.lead_id = l.id
GROUP BY l.id, l.contact_name, l.contact_email, l.contact_phone, l.created_at, l.status
ORDER BY l.created_at DESC;
