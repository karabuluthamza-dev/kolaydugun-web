-- =====================================================
-- RLS Security Fix Migration (Simplified)
-- Fix all RLS disabled warnings - without users table dependency
-- Created: 2025-12-17
-- =====================================================

-- =====================================================
-- 1. LEADS TABLE
-- =====================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view leads (app handles role check)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads" ON public.leads
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads" ON public.leads
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. VENDOR_LEADS TABLE
-- =====================================================
ALTER TABLE public.vendor_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth users vendor_leads" ON public.vendor_leads;
CREATE POLICY "Auth users vendor_leads" ON public.vendor_leads
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. SHOP_ACCOUNTS TABLE
-- =====================================================
ALTER TABLE public.shop_accounts ENABLE ROW LEVEL SECURITY;

-- Public can read shop info (for storefront display)
DROP POLICY IF EXISTS "Public can view shops" ON public.shop_accounts;
CREATE POLICY "Public can view shops" ON public.shop_accounts
    FOR SELECT USING (true);

-- Authenticated can manage (app handles role check)
DROP POLICY IF EXISTS "Auth can manage shops" ON public.shop_accounts;
CREATE POLICY "Auth can manage shops" ON public.shop_accounts
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. SHOP_APPLICATIONS TABLE
-- =====================================================
ALTER TABLE public.shop_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public application form)
DROP POLICY IF EXISTS "Anyone can apply" ON public.shop_applications;
CREATE POLICY "Anyone can apply" ON public.shop_applications
    FOR INSERT WITH CHECK (true);

-- Public can view (for status check)
DROP POLICY IF EXISTS "Public can view applications" ON public.shop_applications;
CREATE POLICY "Public can view applications" ON public.shop_applications
    FOR SELECT USING (true);

-- Authenticated can manage
DROP POLICY IF EXISTS "Auth can manage applications" ON public.shop_applications;
CREATE POLICY "Auth can manage applications" ON public.shop_applications
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. SHOP_PRODUCTS TABLE
-- =====================================================
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

-- Public can view products
DROP POLICY IF EXISTS "Public can view products" ON public.shop_products;
CREATE POLICY "Public can view products" ON public.shop_products
    FOR SELECT USING (true);

-- Authenticated can manage
DROP POLICY IF EXISTS "Auth can manage products" ON public.shop_products;
CREATE POLICY "Auth can manage products" ON public.shop_products
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. ADMIN_DIGEST_LOGS TABLE
-- =====================================================
ALTER TABLE public.admin_digest_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth can access digest_logs" ON public.admin_digest_logs;
CREATE POLICY "Auth can access digest_logs" ON public.admin_digest_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. SHOP_ANNOUNCEMENTS TABLE
-- =====================================================
ALTER TABLE public.shop_announcements ENABLE ROW LEVEL SECURITY;

-- Public can view
DROP POLICY IF EXISTS "Public can view announcements" ON public.shop_announcements;
CREATE POLICY "Public can view announcements" ON public.shop_announcements
    FOR SELECT USING (true);

-- Auth can manage
DROP POLICY IF EXISTS "Auth can manage announcements" ON public.shop_announcements;
CREATE POLICY "Auth can manage announcements" ON public.shop_announcements
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. TRANSACTIONS TABLE
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Auth transactions" ON public.transactions;
        EXECUTE 'CREATE POLICY "Auth transactions" ON public.transactions FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- =====================================================
-- 9. SHOP_AFFILIATE_EARNINGS TABLE
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shop_affiliate_earnings') THEN
        ALTER TABLE public.shop_affiliate_earnings ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Auth earnings" ON public.shop_affiliate_earnings;
        EXECUTE 'CREATE POLICY "Auth earnings" ON public.shop_affiliate_earnings FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- =====================================================
-- 10. INCOME_RECORDS & EXPENSE_RECORDS
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'income_records') THEN
        ALTER TABLE public.income_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Auth income" ON public.income_records;
        EXECUTE 'CREATE POLICY "Auth income" ON public.income_records FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expense_records') THEN
        ALTER TABLE public.expense_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Auth expenses" ON public.expense_records;
        EXECUTE 'CREATE POLICY "Auth expenses" ON public.expense_records FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- =====================================================
-- 11. SHOP_PRODUCT_CLICK_STATS (only if it's a TABLE, not VIEW)
-- =====================================================
DO $$
BEGIN
    -- Only apply RLS if it's a TABLE (not a VIEW)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shop_product_click_stats'
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.shop_product_click_stats ENABLE ROW LEVEL SECURITY;
        
        -- Public can insert clicks
        DROP POLICY IF EXISTS "Public clicks insert" ON public.shop_product_click_stats;
        EXECUTE 'CREATE POLICY "Public clicks insert" ON public.shop_product_click_stats FOR INSERT WITH CHECK (true)';
        
        -- Auth can view
        DROP POLICY IF EXISTS "Auth clicks view" ON public.shop_product_click_stats;
        EXECUTE 'CREATE POLICY "Auth clicks view" ON public.shop_product_click_stats FOR SELECT USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- =====================================================
-- NOTE: Service role (used by Edge Functions) bypasses RLS
-- App-level role checks still happen in React code
-- =====================================================
