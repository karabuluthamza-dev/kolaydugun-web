-- Simple solution: Add location to ALL vendors
-- Using Berlin as default location for testing

UPDATE vendor_profiles 
SET 
    latitude = 52.5200,
    longitude = 13.4050,
    address = 'Berlin, Germany'
WHERE latitude IS NULL;

-- Verify the updates
SELECT 
    id,
    latitude,
    longitude,
    address
FROM vendor_profiles
WHERE latitude IS NOT NULL
LIMIT 20;
