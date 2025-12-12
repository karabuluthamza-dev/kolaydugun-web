-- ANALYZE HISTORICAL DATA: Find working examples from the past

-- 1. Find vendor_leads that WERE successfully created (not NULL vendor_id)
SELECT 
    vl.id,
    vl.vendor_id,
    vl.lead_id,
    vl.created_at,
    vl.is_unlocked,
    v.business_name AS vendor_name,
    v.user_id AS vendor_auth_id,
    l.contact_name,
    l.contact_email,
    l.created_at AS lead_created_at
FROM vendor_leads vl
LEFT JOIN vendors v ON vl.vendor_id = v.id
LEFT JOIN leads l ON vl.lead_id = l.id
WHERE vl.vendor_id IS NOT NULL
ORDER BY vl.created_at DESC
LIMIT 20;

-- 2. Find any user_notifications that were successfully created
SELECT 
    un.id,
    un.user_id,
    un.created_at,
    un.is_read,
    un.notification
FROM user_notifications un
WHERE un.created_at > NOW() - INTERVAL '7 days'
ORDER BY un.created_at DESC
LIMIT 20;

-- 3. Check if there are any admin_notifications from the past week
SELECT 
    an.id,
    an.type,
    an.title,
    an.message,
    an.created_at,
    an.created_by
FROM admin_notifications an
WHERE an.created_at > NOW() - INTERVAL '7 days'
ORDER BY an.created_at DESC
LIMIT 20;

-- 4. Compare: Find leads that HAVE vendor_leads vs those that DON'T
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
