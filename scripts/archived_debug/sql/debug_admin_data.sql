-- 1. List all vendors that look like support
SELECT id, business_name, user_id FROM vendors WHERE business_name ILIKE '%Destek%' OR business_name ILIKE '%Support%';

-- 2. List recent conversations
SELECT id, vendor_id, user_id, updated_at FROM conversations ORDER BY updated_at DESC LIMIT 5;

-- 3. Check if the RPC works
SELECT * FROM get_support_conversations();
