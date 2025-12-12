DO $$
DECLARE
    v_vendor RECORD;
    v_count INT;
BEGIN
    RAISE NOTICE '--- DIAGNOSTIC START ---';
    
    FOR v_vendor IN 
        SELECT id, business_name, user_id FROM vendors 
        WHERE business_name ILIKE '%Destek%' OR business_name ILIKE '%Support%' 
    LOOP
        SELECT count(*) INTO v_count FROM conversations WHERE vendor_id = v_vendor.id;
        RAISE NOTICE 'Vendor: %, Name: %, Conversions: %', v_vendor.id, v_vendor.business_name, v_count;
    END LOOP;
    
    RAISE NOTICE '--- DIAGNOSTIC END ---';
END $$;
