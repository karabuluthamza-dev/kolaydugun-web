-- SQL Migration: Repair Malformed Vendor Slugs
-- Description: Identifies and clears slugs containing dots or URL patterns to force regeneration.

BEGIN;

-- 1. Identify and clear malformed slugs
-- We set them to NULL. The existing 'handle_vendor_slug' trigger will automatically 
-- regenerate them from the business_name on the next update or if the trigger is set to run on NULL slugs.
UPDATE vendors
SET slug = NULL
WHERE slug LIKE '%.%' 
   OR slug LIKE 'www.%' 
   OR slug LIKE 'http%';

-- 2. Force regeneration for any NULL slugs (including the ones we just cleared)
-- This update will fire the 'handle_vendor_slug' trigger.
UPDATE vendors
SET business_name = business_name
WHERE slug IS NULL;

-- 3. Verification Query (to be run after migration)
-- SELECT id, business_name, slug FROM vendors WHERE slug IS NULL OR slug LIKE '%.%';

COMMIT;
