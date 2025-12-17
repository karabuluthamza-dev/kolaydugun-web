-- =====================================================
-- RLS Security Fix Part 3 - Final Issues
-- Created: 2025-12-17
-- =====================================================

-- =====================================================
-- 1. Drop SECURITY DEFINER view: expiring_shops
-- =====================================================
DROP VIEW IF EXISTS public.expiring_shops CASCADE;

-- =====================================================
-- 2. V_SHOP_ID (enable RLS if it's a table, drop if view)
-- =====================================================
DO $$
BEGIN
    -- Check if it's a table
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'v_shop_id'
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.v_shop_id ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Auth v_shop_id" ON public.v_shop_id;
        EXECUTE 'CREATE POLICY "Auth v_shop_id" ON public.v_shop_id FOR ALL USING (auth.role() = ''authenticated'')';
    ELSE
        -- It's a view, drop it
        DROP VIEW IF EXISTS public.v_shop_id CASCADE;
    END IF;
END $$;

-- =====================================================
-- 3. Fix shop_announcements - remove user_metadata reference
-- =====================================================
-- First drop policies that reference user_metadata
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'shop_announcements' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.shop_announcements', policy_record.policyname);
    END LOOP;
END $$;

-- Recreate simple policies without user_metadata
DROP POLICY IF EXISTS "Public view announcements" ON public.shop_announcements;
CREATE POLICY "Public view announcements" ON public.shop_announcements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage announcements" ON public.shop_announcements;
CREATE POLICY "Auth manage announcements" ON public.shop_announcements
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. Fix shop_faqs - remove user_metadata reference
-- =====================================================
-- First drop policies that reference user_metadata
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'shop_faqs' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.shop_faqs', policy_record.policyname);
    END LOOP;
END $$;

-- Recreate simple policies without user_metadata
DROP POLICY IF EXISTS "Public view faqs" ON public.shop_faqs;
CREATE POLICY "Public view faqs" ON public.shop_faqs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage faqs" ON public.shop_faqs;
CREATE POLICY "Auth manage faqs" ON public.shop_faqs
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- Done! All security issues should be resolved.
-- =====================================================
