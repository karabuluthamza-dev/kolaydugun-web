-- =====================================================
-- SHOP SUBSCRIPTION SYSTEM - DATABASE MIGRATION
-- KolayDugun.de Shop Marketplace
-- =====================================================

-- 1. SHOP PLANS TABLE (Paket tanımları)
-- Admin panelden düzenlenebilir
CREATE TABLE IF NOT EXISTS shop_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- starter, business, premium
    display_name_tr TEXT NOT NULL,
    display_name_de TEXT NOT NULL,
    display_name_en TEXT NOT NULL,
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    
    -- Fiyatlandırma (vergisiz net fiyat)
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Özellikler
    product_limit INTEGER DEFAULT 5, -- -1 = sınırsız
    has_priority_listing BOOLEAN DEFAULT false,
    has_analytics BOOLEAN DEFAULT false,
    has_featured_homepage BOOLEAN DEFAULT false,
    has_vip_badge BOOLEAN DEFAULT false,
    has_affiliate_access BOOLEAN DEFAULT false,
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VARSAYILAN PLANLAR
INSERT INTO shop_plans (name, display_name_tr, display_name_de, display_name_en, description_tr, description_de, description_en, price_monthly, price_yearly, product_limit, has_priority_listing, has_analytics, has_featured_homepage, has_vip_badge, has_affiliate_access, sort_order)
VALUES 
    ('starter', 'Starter', 'Starter', 'Starter', 'Başlangıç için ideal', 'Ideal für den Einstieg', 'Perfect for getting started', 19.00, 190.00, 5, false, false, false, false, false, 1),
    ('business', 'Business', 'Business', 'Business', 'Büyüyen mağazalar için', 'Für wachsende Shops', 'For growing shops', 39.00, 390.00, 20, true, true, false, false, false, 2),
    ('premium', 'Premium', 'Premium', 'Premium', 'Profesyoneller için', 'Für Profis', 'For professionals', 69.00, 690.00, -1, true, true, true, true, true, 3)
ON CONFLICT (name) DO NOTHING;

-- 3. SHOP ACCOUNTS TABLOSUNA YENİ SÜTUNLAR
-- Mevcut tabloya ekleme yapıyoruz, bozmuyoruz!
ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES shop_plans(id);

ALTER TABLE shop_accounts 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

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
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending' 
CHECK (subscription_status IN ('pending', 'trial', 'active', 'cancelled', 'expired'));

-- 4. SHOP ANALYTICS TABLE (İstatistikler)
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

-- 5. SUBSCRIPTION HISTORY (Abonelik geçmişi)
CREATE TABLE IF NOT EXISTS shop_subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES shop_plans(id),
    action TEXT NOT NULL CHECK (action IN ('subscribe', 'upgrade', 'downgrade', 'cancel', 'renew', 'expire')),
    amount DECIMAL(10,2),
    billing_cycle TEXT,
    paypal_transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SHOP INVOICES (Faturalar)
CREATE TABLE IF NOT EXISTS shop_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES shop_plans(id),
    
    -- Müşteri bilgileri (fatura anında kopyalanır)
    customer_business_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    customer_tax_id TEXT, -- Almanya için Steuernummer
    
    -- Fatura detayları
    billing_cycle TEXT NOT NULL,
    period_start DATE,
    period_end DATE,
    
    -- Tutarlar
    net_amount DECIMAL(10,2) NOT NULL, -- Vergisiz
    tax_rate DECIMAL(5,2) DEFAULT 19.00, -- %19 MwSt
    tax_amount DECIMAL(10,2) NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL, -- Vergili toplam
    
    -- Ödeme
    payment_method TEXT DEFAULT 'paypal',
    paypal_transaction_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ,
    
    -- PDF
    pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. İNDEXLER (Performans)
CREATE INDEX IF NOT EXISTS idx_shop_accounts_plan ON shop_accounts(plan_id);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_subscription_status ON shop_accounts(subscription_status);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_featured ON shop_accounts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_date ON shop_analytics(shop_id, date);
CREATE INDEX IF NOT EXISTS idx_shop_invoices_shop ON shop_invoices(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_invoices_number ON shop_invoices(invoice_number);

-- 8. RLS POLİCYLER
-- shop_plans: Herkes okuyabilir, sadece admin yazabilir
ALTER TABLE shop_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_plans_read_all" ON shop_plans
    FOR SELECT USING (true);

CREATE POLICY "shop_plans_admin_write" ON shop_plans
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_analytics: Mağaza sahibi kendi verisini, admin herkesi görebilir
ALTER TABLE shop_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_analytics_owner_read" ON shop_analytics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM shop_accounts WHERE id = shop_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "shop_analytics_insert" ON shop_analytics
    FOR INSERT WITH CHECK (true); -- Herkes analytics ekleyebilir (tracking için)

-- shop_subscription_history: Mağaza sahibi ve admin
ALTER TABLE shop_subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_subscription_history_read" ON shop_subscription_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM shop_accounts WHERE id = shop_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_invoices: Mağaza sahibi ve admin
ALTER TABLE shop_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_invoices_read" ON shop_invoices
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM shop_accounts WHERE id = shop_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "shop_invoices_admin_write" ON shop_invoices
    FOR ALL USING (
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

-- 10. FATURA NUMARASI OLUŞTURMA FONKSİYONU
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
    v_number TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COUNT(*) + 1 INTO v_count
    FROM shop_invoices
    WHERE invoice_number LIKE 'KD-' || v_year || '-%';
    
    v_number := 'KD-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
    
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;
