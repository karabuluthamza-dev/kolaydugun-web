-- 1. Get an Admin User ID (Assuming at least one admin exists)
-- We will use the first admin found to own the Support Vendor profile.
DO $$
DECLARE
    v_admin_id UUID;
    v_vendor_id UUID;
BEGIN
    -- Find an admin user
    SELECT auth.users.id INTO v_admin_id 
    FROM auth.users 
    JOIN public.profiles ON auth.users.id = public.profiles.id 
    WHERE public.profiles.role = 'admin' 
    LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Please create an admin user first.';
        RETURN;
    END IF;

    -- Check if 'KolayDugun Destek' vendor already exists
    SELECT id INTO v_vendor_id FROM public.vendors WHERE business_name = 'KolayDugun Destek';

    -- If not, create it
    IF v_vendor_id IS NULL THEN
        INSERT INTO public.vendors (
            id, -- Explicitly providing ID
            user_id, 
            business_name, 
            category, 
            city, 
            subscription_tier, 
            is_verified, 
            rating
        ) VALUES (
            gen_random_uuid(), -- Generate UUID explicitly
            v_admin_id,
            'KolayDugun Destek',
            'Support',
            'Istanbul',
            'premium',
            true,
            5.0
        ) RETURNING id INTO v_vendor_id;
        
        RAISE NOTICE 'Created Support Vendor with ID: %', v_vendor_id;
    ELSE
        RAISE NOTICE 'Support Vendor already exists with ID: %', v_vendor_id;
    END IF;

END $$;
