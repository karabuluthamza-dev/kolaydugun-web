-- SIMPLIFIED: Run these queries ONE BY ONE

-- Query 1: Find successful vendor_leads from the past
SELECT 
    vl.id,
    vl.vendor_id,
    vl.lead_id,
    vl.created_at,
    v.business_name AS vendor_name
FROM vendor_leads vl
LEFT JOIN vendors v ON vl.vendor_id = v.id
WHERE vl.vendor_id IS NOT NULL
ORDER BY vl.created_at DESC
LIMIT 20;
