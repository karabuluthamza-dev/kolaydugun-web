-- City Normalization: Add missing major cities + Map small towns
-- Created: 2025-12-22

-- PART 1: Add missing major cities to admin_cities
INSERT INTO admin_cities (name, country_code, is_active, display_order)
VALUES 
    ('Würzburg', 'DE', true, 100),
    ('Pforzheim', 'DE', true, 100),
    ('Fürth', 'DE', true, 100),
    ('Speyer', 'DE', true, 100),
    ('Friedrichshafen', 'DE', true, 100)
ON CONFLICT (name, country_code, state_id) DO NOTHING;

-- PART 2: Map small towns to nearest major cities
-- 69xxx (Heidelberg/Mannheim area)
UPDATE vendor_imports 
SET city_raw = REGEXP_REPLACE(city_raw, '^([0-9]{5}) (.+)$', '\1 Mannheim [eski: \2]')
WHERE status = 'pending' 
AND city_raw ~ '^69[0-9]{3} '
AND city_raw NOT LIKE '%[eski:%'
AND city_raw NOT LIKE '%Mannheim%'
AND city_raw NOT LIKE '%Heidelberg%';

-- 71xxx (Stuttgart area - Backnang, etc.)
UPDATE vendor_imports 
SET city_raw = REGEXP_REPLACE(city_raw, '^([0-9]{5}) (.+)$', '\1 Stuttgart [eski: \2]')
WHERE status = 'pending' 
AND city_raw ~ '^71[0-9]{3} '
AND city_raw NOT LIKE '%[eski:%'
AND city_raw NOT LIKE '%Stuttgart%';

-- 42xxx (Wuppertal/Düsseldorf area)
UPDATE vendor_imports 
SET city_raw = REGEXP_REPLACE(city_raw, '^([0-9]{5}) (.+)$', '\1 Düsseldorf [eski: \2]')
WHERE status = 'pending' 
AND city_raw ~ '^42[0-9]{3} '
AND city_raw NOT LIKE '%[eski:%'
AND city_raw NOT LIKE '%Düsseldorf%'
AND city_raw NOT LIKE '%Wuppertal%';

-- 88xxx (Ulm area - Friedrichshafen, etc.)
UPDATE vendor_imports 
SET city_raw = REGEXP_REPLACE(city_raw, '^([0-9]{5}) (.+)$', '\1 Ulm [eski: \2]')
WHERE status = 'pending' 
AND city_raw ~ '^88[0-9]{3} '
AND city_raw NOT LIKE '%[eski:%'
AND city_raw NOT LIKE '%Ulm%'
AND city_raw NOT LIKE '%Friedrichshafen%';

-- 14xxx (Berlin/Potsdam area)
UPDATE vendor_imports 
SET city_raw = REGEXP_REPLACE(city_raw, '^([0-9]{5}) (.+)$', '\1 Berlin [eski: \2]')
WHERE status = 'pending' 
AND city_raw ~ '^14[0-9]{3} '
AND city_raw NOT LIKE '%[eski:%'
AND city_raw NOT LIKE '%Berlin%'
AND city_raw NOT LIKE '%Potsdam%';

-- PART 3: Keep major cities as-is (just verify they're correct)
-- No action needed - they're already correct!

-- Summary Query: Check remaining unprocessed
-- SELECT city_raw, COUNT(*) FROM vendor_imports 
-- WHERE status = 'pending' AND city_raw ~ '^[0-9]{5} ' AND city_raw NOT LIKE '%[eski:%'
-- GROUP BY city_raw ORDER BY COUNT(*) DESC LIMIT 20;
