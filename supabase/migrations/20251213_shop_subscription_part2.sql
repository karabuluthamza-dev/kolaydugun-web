-- =====================================================
-- SHOP SUBSCRIPTION SYSTEM - PART 2
-- Diğer tablolar ve güncellemeler
-- =====================================================

-- 1. SHOP ACCOUNTS TABLOSUNA YENİ SÜTUNLAR
ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES shop_plans(id);

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ;

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';

-- 2. SHOP ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS shop_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_views INTEGER DEFAULT 0,
    product_views INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    phone_clicks INTEGER DEFAULT 0,
    share_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, date)
);

-- 3. SUBSCRIPTION HISTORY
CREATE TABLE IF NOT EXISTS shop_subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES shop_plans(id),
    action TEXT NOT NULL,
    amount DECIMAL(10,2),
    billing_cycle TEXT,
    paypal_transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SHOP INVOICES
CREATE TABLE IF NOT EXISTS shop_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES shop_plans(id),
    customer_business_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    customer_tax_id TEXT,
    billing_cycle TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    net_amount DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 19.00,
    tax_amount DECIMAL(10,2) NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'paypal',
    paypal_transaction_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. İNDEXLER
CREATE INDEX IF NOT EXISTS idx_shop_accounts_plan ON shop_accounts(plan_id);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_subscription_status ON shop_accounts(subscription_status);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_featured ON shop_accounts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_date ON shop_analytics(shop_id, date);
CREATE INDEX IF NOT EXISTS idx_shop_invoices_shop ON shop_invoices(shop_id);

-- 6. RLS - shop_analytics
ALTER TABLE shop_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_analytics_read" ON shop_analytics;
CREATE POLICY "shop_analytics_read" ON shop_analytics FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_analytics_insert" ON shop_analytics;
CREATE POLICY "shop_analytics_insert" ON shop_analytics FOR INSERT WITH CHECK (true);

-- 7. RLS - shop_subscription_history
ALTER TABLE shop_subscription_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_subscription_history_read" ON shop_subscription_history;
CREATE POLICY "shop_subscription_history_read" ON shop_subscription_history FOR SELECT USING (true);

-- 8. RLS - shop_invoices
ALTER TABLE shop_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_invoices_read" ON shop_invoices;
CREATE POLICY "shop_invoices_read" ON shop_invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_invoices_admin_write" ON shop_invoices;
CREATE POLICY "shop_invoices_admin_write" ON shop_invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 9. ANALYTICS INCREMENT FONKSİYONU
CREATE OR REPLACE FUNCTION increment_shop_analytics(
    p_shop_id UUID,
    p_field TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO shop_analytics (shop_id, date, page_views, product_views, contact_clicks, whatsapp_clicks, phone_clicks, share_clicks)
    VALUES (p_shop_id, CURRENT_DATE, 
        CASE WHEN p_field = 'page_views' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'product_views' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'contact_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'whatsapp_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'phone_clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'share_clicks' THEN 1 ELSE 0 END
    )
    ON CONFLICT (shop_id, date) DO UPDATE SET
        page_views = shop_analytics.page_views + CASE WHEN p_field = 'page_views' THEN 1 ELSE 0 END,
        product_views = shop_analytics.product_views + CASE WHEN p_field = 'product_views' THEN 1 ELSE 0 END,
        contact_clicks = shop_analytics.contact_clicks + CASE WHEN p_field = 'contact_clicks' THEN 1 ELSE 0 END,
        whatsapp_clicks = shop_analytics.whatsapp_clicks + CASE WHEN p_field = 'whatsapp_clicks' THEN 1 ELSE 0 END,
        phone_clicks = shop_analytics.phone_clicks + CASE WHEN p_field = 'phone_clicks' THEN 1 ELSE 0 END,
        share_clicks = shop_analytics.share_clicks + CASE WHEN p_field = 'share_clicks' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FATURA NUMARASI FONKSİYONU
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COUNT(*) + 1 INTO v_count
    FROM shop_invoices
    WHERE invoice_number LIKE 'KD-' || v_year || '-%';
    
    RETURN 'KD-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
