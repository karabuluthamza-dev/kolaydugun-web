-- check_support_debug.sql
WITH support_v AS (
    SELECT id FROM vendors WHERE business_name = 'KolayDugun Destek' LIMIT 1
)
SELECT 
    c.id as conv_id,
    c.lead_id as conv_lead_id,
    c.vendor_id as conv_vendor_id,
    l.id as lead_id,
    l.vendor_id as lead_vendor_id,
    l.contact_name
FROM conversations c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE c.vendor_id = (SELECT id FROM support_v);
