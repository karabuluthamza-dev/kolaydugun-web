-- DIAGNOSTIC SCRIPT: Check Trigger Status and Recent Data
-- Run this in Supabase SQL Editor to diagnose the issue

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

-- 3. Check recent user_notifications (last 5)
SELECT 
    un.id,
    un.user_id,
    un.notification->>'type' AS notif_type,
    un.notification->>'title' AS title_json,
    un.created_at
FROM user_notifications un
ORDER BY un.created_at DESC
LIMIT 5;

-- 4. Check if the trigger function exists
SELECT 
    proname AS function_name,
    prosrc AS function_source
FROM pg_proc
WHERE proname IN ('handle_new_quote_notification', 'handle_new_message_notification');

-- 5. Check RLS policies on vendor_leads
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'vendor_leads';
