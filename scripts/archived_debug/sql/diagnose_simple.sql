-- SIMPLEST DIAGNOSTIC: Just check what columns exist and recent data

-- 1. Check if triggers exist
SELECT 
    tgname AS trigger_name,
    tgenabled AS enabled,
    tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname IN ('on_quote_received', 'on_message_received');

-- 2. Check recent vendor_leads (last 10)
SELECT *
FROM vendor_leads
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check recent user_notifications (last 10) - ALL COLUMNS
SELECT *
FROM user_notifications
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check recent admin_notifications (last 10) - ALL COLUMNS
SELECT *
FROM admin_notifications
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check recent leads (last 10)
SELECT *
FROM leads
ORDER BY created_at DESC
LIMIT 10;
