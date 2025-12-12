-- SQL to delete test vendors directly
-- Run this in Supabase SQL Editor

-- Delete vendors with test-related names
DELETE FROM vendors 
WHERE business_name ILIKE '%test%' 
   OR business_name ILIKE '%soft delete%'
   OR business_name ILIKE '%deletion%';

-- Show remaining count
SELECT COUNT(*) as remaining_vendors FROM vendors;

-- Show sample of remaining vendors
SELECT business_name, subscription_tier, created_at 
FROM vendors 
ORDER BY created_at DESC 
LIMIT 10;
