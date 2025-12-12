SELECT 
    v.id as vendor_id,
    v.business_name,
    (SELECT count(*) FROM conversations c WHERE c.vendor_id = v.id) as conversation_count,
    (SELECT count(*) FROM leads l WHERE l.vendor_id = v.id) as lead_count
FROM vendors v
WHERE v.business_name ILIKE '%Destek%' OR v.business_name ILIKE '%Support%';
