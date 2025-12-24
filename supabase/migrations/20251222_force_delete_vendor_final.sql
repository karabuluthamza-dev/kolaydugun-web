-- ============================================
-- UBER-ROBUST FORCE DELETE VENDOR FUNCTION
-- Purpose: Deletes vendor data with extreme caution (checks for columns first)
-- ============================================

-- Clean up any previous versions
DROP FUNCTION IF EXISTS public.force_delete_vendor(uuid);
DROP FUNCTION IF EXISTS public.force_delete_vendor(target_vendor_id uuid);
DROP FUNCTION IF EXISTS public.force_delete_vendor(p_vendor_id uuid);

CREATE OR REPLACE FUNCTION public.force_delete_vendor(target_vendor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function uses dynamic SQL to prevent 'column does not exist' compile-time errors
    
    -- 1. vendor_insights
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_insights' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_insights WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 2. vendor_leads
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_leads' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_leads WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 3. leads (This was the likely culprit)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.leads WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 4. vendor_ad_orders
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_ad_orders' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_ad_orders WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 5. vendor_subscriptions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_subscriptions' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_subscriptions WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 6. shop_accounts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'shop_accounts' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.shop_accounts WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 7. vendor_claims
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_claims' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_claims WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 8. vendor_profiles
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendor_profiles') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_profiles' AND column_name = 'user_id') THEN
            EXECUTE 'DELETE FROM public.vendor_profiles WHERE user_id = $1' USING target_vendor_id;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_profiles' AND column_name = 'id') THEN
            EXECUTE 'DELETE FROM public.vendor_profiles WHERE id = $1' USING target_vendor_id;
        END IF;
    END IF;

    -- 8.1. vendor_images / photos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_images' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_images WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_photos' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_photos WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 8.2. vendor_videos
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_videos' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_videos WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 8.3. vendor_reviews (reviews assigned to vendor)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vendor_reviews' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.vendor_reviews WHERE vendor_id = $1' USING target_vendor_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.reviews WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 8.4. couple_favorites (favorites of this vendor)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'couple_favorites' AND column_name = 'vendor_id') THEN
        EXECUTE 'DELETE FROM public.couple_favorites WHERE vendor_id = $1' USING target_vendor_id;
    END IF;

    -- 9. Finally the Vendor record itself
    DELETE FROM public.vendors WHERE id = target_vendor_id;

END;
$$;

-- Explicitly Grant Permissions
GRANT EXECUTE ON FUNCTION public.force_delete_vendor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_delete_vendor(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.force_delete_vendor(UUID) TO postgres;

COMMENT ON FUNCTION public.force_delete_vendor IS 'UBER-ROBUST deletion that checks for column existence dynamically to avoid errors.';
