-- =====================================================
-- SHOP PLANS TABLOSİ DÜZELTMESİ
-- Mevcut tabloyu sil ve yeniden oluştur
-- =====================================================

-- 1. Mevcut shop_plans tablosunu sil (varsa)
DROP TABLE IF EXISTS shop_plans CASCADE;

-- 2. SHOP PLANS TABLE (Yeniden oluştur)
CREATE TABLE shop_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name_tr TEXT NOT NULL,
    display_name_de TEXT NOT NULL,
    display_name_en TEXT NOT NULL,
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    product_limit INTEGER DEFAULT 5,
    has_priority_listing BOOLEAN DEFAULT false,
    has_analytics BOOLEAN DEFAULT false,
    has_featured_homepage BOOLEAN DEFAULT false,
    has_vip_badge BOOLEAN DEFAULT false,
    has_affiliate_access BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VARSAYILAN PLANLAR
INSERT INTO shop_plans (name, display_name_tr, display_name_de, display_name_en, description_tr, description_de, description_en, price_monthly, price_yearly, product_limit, has_priority_listing, has_analytics, has_featured_homepage, has_vip_badge, has_affiliate_access, sort_order)
VALUES 
    ('starter', 'Starter', 'Starter', 'Starter', 'Başlangıç için ideal', 'Ideal für den Einstieg', 'Perfect for getting started', 19.00, 190.00, 5, false, false, false, false, false, 1),
    ('business', 'Business', 'Business', 'Business', 'Büyüyen mağazalar için', 'Für wachsende Shops', 'For growing shops', 39.00, 390.00, 20, true, true, false, false, false, 2),
    ('premium', 'Premium', 'Premium', 'Premium', 'Profesyoneller için', 'Für Profis', 'For professionals', 69.00, 690.00, -1, true, true, true, true, true, 3);

-- 4. RLS için policy
ALTER TABLE shop_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_plans_read_all" ON shop_plans;
CREATE POLICY "shop_plans_read_all" ON shop_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_plans_admin_write" ON shop_plans;
CREATE POLICY "shop_plans_admin_write" ON shop_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
