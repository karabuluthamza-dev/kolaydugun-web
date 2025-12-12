-- DIAGNOSTIC SCRIPT (FIXED): Check Trigger Status and Recent Data

-- 1. Check if triggers exist and are enabled
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled,
    tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname IN ('on_quote_received', 'on_message_received');

-- 2. Check recent vendor_leads entries (last 5)
SELECT 
    vl.id,
    vl.vendor_id,
    vl.lead_id,
    vl.created_at,
    v.business_name AS vendor_name,
    v.user_id AS vendor_auth_id,
    l.contact_name
FROM vendor_leads vl
LEFT JOIN vendors v ON vl.vendor_id = v.id
LEFT JOIN leads l ON vl.lead_id = l.id
ORDER BY vl.created_at DESC
LIMIT 5;

-- 3. Check recent user_notifications (last 5) - FIXED
SELECT 
    un.id,
    un.user_id,
    un.notification_id,
    un.notification,
    un.created_at
FROM user_notifications un
ORDER BY un.created_at DESC
LIMIT 5;

-- 4. Check admin_notifications (last 5)
SELECT 
    an.id,
    an.type,
    an.title,
    an.message,
    an.created_at
FROM admin_notifications an
ORDER BY an.created_at DESC
LIMIT 5;
