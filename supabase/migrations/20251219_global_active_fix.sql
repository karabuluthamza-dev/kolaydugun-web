-- Global Fix for Missing is_active Columns
-- Resolves 406 (Not Acceptable) errors on multiple pages

-- 1. Vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Shop Accounts table
ALTER TABLE public.shop_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Shop Plans table
ALTER TABLE public.shop_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Site FAQs table (Fixed name)
ALTER TABLE public.site_faqs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Posts table (Blog posts, Fixed name)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 6. Pages table
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. Subscription Plans table
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 8. Shop Categories table
ALTER TABLE public.shop_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 9. Shop Products table
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update generate_all_active_vendor_reports to use the new is_active column
CREATE OR REPLACE FUNCTION public.generate_all_active_vendor_reports()
RETURNS INTEGER AS $$
DECLARE
    v_id UUID;
    v_count INTEGER := 0;
BEGIN
    FOR v_id IN SELECT id FROM public.vendors WHERE is_active = true AND deleted_at IS NULL LOOP
        PERFORM public.generate_vendor_performance_report(v_id);
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
