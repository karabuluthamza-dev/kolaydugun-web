-- Query 3: Count leads WITH vs WITHOUT vendor_leads
SELECT 
    'WITH vendor_lead' AS status,
    COUNT(*) AS count
FROM leads l
WHERE EXISTS (SELECT 1 FROM vendor_leads vl WHERE vl.lead_id = l.id)
UNION ALL
SELECT 
    'WITHOUT vendor_lead' AS status,
    COUNT(*) AS count
FROM leads l
WHERE NOT EXISTS (SELECT 1 FROM vendor_leads vl WHERE vl.lead_id = l.id);
