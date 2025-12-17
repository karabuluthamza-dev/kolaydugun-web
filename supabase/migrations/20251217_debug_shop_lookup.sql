DO $$
DECLARE
    found_shop_id uuid;
    found_name text;
BEGIN
    SELECT id, business_name INTO found_shop_id, found_name
    FROM shop_accounts 
    WHERE id = 'ce430822-256f-4212-98fd-35d91bd17bf1';

    IF found_shop_id IS NOT NULL THEN
        RAISE NOTICE 'Found Shop: % (%)', found_name, found_shop_id;
    ELSE
        RAISE NOTICE 'Shop NOT FOUND with ID: ce430822-256f-4212-98fd-35d91bd17bf1';
    END IF;
END $$;
