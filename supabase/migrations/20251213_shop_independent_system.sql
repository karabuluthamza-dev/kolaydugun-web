-- ============================================
-- SHOP MARKETPLACE - BAĞIMSIZ SİSTEM
-- Tarih: 2025-12-13
-- Açıklama: Mevcut vendor sisteminden bağımsız shop marketplace
-- ============================================

-- ============================================
-- 1. SHOP_ACCOUNTS - Mağaza Hesapları
-- ============================================

CREATE TABLE IF NOT EXISTS shop_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Auth (Supabase Auth ile bağlantı)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Temel bilgiler
    email TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL: /magaza/slug
    
    -- 3 dilli açıklamalar
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    
    -- Görseller (URL bazlı)
    logo_url TEXT,
    cover_image_url TEXT,
    
    -- İletişim
    contact_whatsapp TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    website_url TEXT,
    
    -- Plan bilgileri
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'business', 'premium')),
    product_limit INTEGER DEFAULT 5,
    plan_started_at TIMESTAMPTZ,
    plan_expires_at TIMESTAMPTZ,
    
    -- Affiliate
    affiliate_code TEXT UNIQUE,
    affiliate_earnings_total DECIMAL(10,2) DEFAULT 0,
    affiliate_earnings_pending DECIMAL(10,2) DEFAULT 0,
    affiliate_earnings_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Durum
    is_active BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_shop_accounts_slug ON shop_accounts(slug);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_email ON shop_accounts(email);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_affiliate_code ON shop_accounts(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_shop_accounts_is_active ON shop_accounts(is_active);

-- ============================================
-- 2. SHOP_CATEGORIES - Hiyerarşik Kategoriler
-- ============================================

CREATE TABLE IF NOT EXISTS shop_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL,
    
    slug TEXT UNIQUE NOT NULL,
    
    -- 3 dilli isimler
    name_tr TEXT NOT NULL,
    name_de TEXT,
    name_en TEXT,
    
    -- Görsel
    icon TEXT, -- Emoji veya icon ismi
    image_url TEXT,
    
    -- Meta
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    product_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_categories_parent ON shop_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_shop_categories_slug ON shop_categories(slug);

-- ============================================
-- 3. SHOP_PRODUCTS - Ürünler
-- ============================================

CREATE TABLE IF NOT EXISTS shop_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Bağlantılar
    shop_account_id UUID REFERENCES shop_accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL,
    
    -- 3 dilli içerik
    name_tr TEXT NOT NULL,
    name_de TEXT,
    name_en TEXT,
    
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    
    -- Fiyat
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    show_price BOOLEAN DEFAULT true,
    price_on_request BOOLEAN DEFAULT false,
    
    -- Görseller (URL array)
    images JSONB DEFAULT '[]', -- ["https://imgur.com/xxx.jpg", ...]
    
    -- İletişim (ürün bazlı override)
    whatsapp_number TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    external_url TEXT,
    
    -- Durum
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    rejection_reason TEXT,
    
    -- İstatistik
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Meta
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_products_shop ON shop_products(shop_account_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);

-- ============================================
-- 4. SHOP_APPLICATIONS - Başvurular
-- ============================================

CREATE TABLE IF NOT EXISTS shop_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Başvuru bilgileri
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT DEFAULT 'DE',
    
    -- Ne satmak istiyor
    product_description TEXT,
    
    -- Affiliate referans
    referred_by_code TEXT, -- ABC123
    referred_by_shop_id UUID REFERENCES shop_accounts(id) ON DELETE SET NULL,
    
    -- Durum
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Onay sonrası
    created_shop_id UUID REFERENCES shop_accounts(id) ON DELETE SET NULL,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shop_applications_status ON shop_applications(status);
CREATE INDEX IF NOT EXISTS idx_shop_applications_email ON shop_applications(email);

-- ============================================
-- 5. SHOP_AFFILIATE_CLICKS - Tıklama Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS shop_affiliate_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    affiliate_code TEXT NOT NULL,
    shop_account_id UUID REFERENCES shop_accounts(id) ON DELETE CASCADE,
    
    -- Hangi sayfada tıklandı
    page_url TEXT,
    product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
    
    -- Tracking
    visitor_ip TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON shop_affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_shop ON shop_affiliate_clicks(shop_account_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON shop_affiliate_clicks(created_at);

-- ============================================
-- 6. SHOP_AFFILIATE_EARNINGS - Komisyonlar
-- ============================================

CREATE TABLE IF NOT EXISTS shop_affiliate_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Kim kazandı
    shop_account_id UUID REFERENCES shop_accounts(id) ON DELETE CASCADE NOT NULL,
    
    -- Kim yüzünden kazandı
    source_shop_id UUID REFERENCES shop_accounts(id) ON DELETE SET NULL,
    source_application_id UUID REFERENCES shop_applications(id) ON DELETE SET NULL,
    
    -- Tutar
    amount DECIMAL(10,2) NOT NULL,
    percentage_used DECIMAL(5,2), -- %10 veya %5
    source_amount DECIMAL(10,2), -- Asıl ödeme tutarı
    
    -- Tip
    earning_type TEXT DEFAULT 'first_month' CHECK (earning_type IN ('first_month', 'recurring')),
    
    -- Durum
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    
    -- Ödeme bilgisi
    payout_date TIMESTAMPTZ,
    payout_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_shop ON shop_affiliate_earnings(shop_account_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON shop_affiliate_earnings(status);

-- ============================================
-- 7. SHOP_SETTINGS - Ayarlar (Admin Panelden)
-- ============================================

CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan ayarları ekle
INSERT INTO shop_settings (key, value, description) VALUES
    ('affiliate_first_month_rate', '10', 'İlk ay affiliate komisyon oranı (%)'),
    ('affiliate_recurring_rate', '5', 'Devam eden ay affiliate komisyon oranı (%)'),
    ('plans', '{
        "starter": {"price_monthly": 19, "price_yearly": 190, "product_limit": 5},
        "business": {"price_monthly": 39, "price_yearly": 390, "product_limit": 20},
        "premium": {"price_monthly": 69, "price_yearly": 690, "product_limit": -1}
    }', 'Mağaza planları ve fiyatları'),
    ('cookie_duration_days', '30', 'Affiliate cookie süresi (gün)')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 8. UPDATED_AT TRİGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_shop_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ları oluştur
DROP TRIGGER IF EXISTS shop_accounts_updated_at ON shop_accounts;
CREATE TRIGGER shop_accounts_updated_at
    BEFORE UPDATE ON shop_accounts
    FOR EACH ROW EXECUTE FUNCTION update_shop_updated_at();

DROP TRIGGER IF EXISTS shop_categories_updated_at ON shop_categories;
CREATE TRIGGER shop_categories_updated_at
    BEFORE UPDATE ON shop_categories
    FOR EACH ROW EXECUTE FUNCTION update_shop_updated_at();

DROP TRIGGER IF EXISTS shop_products_updated_at ON shop_products;
CREATE TRIGGER shop_products_updated_at
    BEFORE UPDATE ON shop_products
    FOR EACH ROW EXECUTE FUNCTION update_shop_updated_at();

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Affiliate kodu oluştur
CREATE OR REPLACE FUNCTION generate_shop_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Mağazanın kalan ürün hakkını hesapla
CREATE OR REPLACE FUNCTION get_shop_remaining_products(p_shop_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_limit INTEGER;
    v_used INTEGER;
BEGIN
    SELECT product_limit INTO v_limit FROM shop_accounts WHERE id = p_shop_id;
    
    IF v_limit = -1 THEN
        RETURN 9999; -- Sınırsız
    END IF;
    
    SELECT COUNT(*) INTO v_used 
    FROM shop_products 
    WHERE shop_account_id = p_shop_id 
    AND status IN ('approved', 'pending');
    
    RETURN GREATEST(0, v_limit - v_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ürün görüntüleme sayısını artır
CREATE OR REPLACE FUNCTION increment_shop_product_view(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE shop_products 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Affiliate ayarını al
CREATE OR REPLACE FUNCTION get_shop_setting(p_key TEXT)
RETURNS JSONB AS $$
BEGIN
    RETURN (SELECT value FROM shop_settings WHERE key = p_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE shop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- SHOP_ACCOUNTS Policies
DROP POLICY IF EXISTS "shop_accounts_select_public" ON shop_accounts;
CREATE POLICY "shop_accounts_select_public" ON shop_accounts
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "shop_accounts_owner_all" ON shop_accounts;
CREATE POLICY "shop_accounts_owner_all" ON shop_accounts
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "shop_accounts_admin_all" ON shop_accounts;
CREATE POLICY "shop_accounts_admin_all" ON shop_accounts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_CATEGORIES Policies
DROP POLICY IF EXISTS "shop_categories_select_public" ON shop_categories;
CREATE POLICY "shop_categories_select_public" ON shop_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "shop_categories_admin_all" ON shop_categories;
CREATE POLICY "shop_categories_admin_all" ON shop_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_PRODUCTS Policies
DROP POLICY IF EXISTS "shop_products_select_public" ON shop_products;
CREATE POLICY "shop_products_select_public" ON shop_products
    FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "shop_products_owner_all" ON shop_products;
CREATE POLICY "shop_products_owner_all" ON shop_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_products.shop_account_id 
            AND shop_accounts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "shop_products_admin_all" ON shop_products;
CREATE POLICY "shop_products_admin_all" ON shop_products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_APPLICATIONS Policies
DROP POLICY IF EXISTS "shop_applications_insert_public" ON shop_applications;
CREATE POLICY "shop_applications_insert_public" ON shop_applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "shop_applications_admin_all" ON shop_applications;
CREATE POLICY "shop_applications_admin_all" ON shop_applications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_AFFILIATE_CLICKS Policies
DROP POLICY IF EXISTS "shop_affiliate_clicks_insert_public" ON shop_affiliate_clicks;
CREATE POLICY "shop_affiliate_clicks_insert_public" ON shop_affiliate_clicks
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "shop_affiliate_clicks_admin_all" ON shop_affiliate_clicks;
CREATE POLICY "shop_affiliate_clicks_admin_all" ON shop_affiliate_clicks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_AFFILIATE_EARNINGS Policies
DROP POLICY IF EXISTS "shop_affiliate_earnings_owner_select" ON shop_affiliate_earnings;
CREATE POLICY "shop_affiliate_earnings_owner_select" ON shop_affiliate_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_affiliate_earnings.shop_account_id 
            AND shop_accounts.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "shop_affiliate_earnings_admin_all" ON shop_affiliate_earnings;
CREATE POLICY "shop_affiliate_earnings_admin_all" ON shop_affiliate_earnings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP_SETTINGS Policies
DROP POLICY IF EXISTS "shop_settings_select_public" ON shop_settings;
CREATE POLICY "shop_settings_select_public" ON shop_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_settings_admin_all" ON shop_settings;
CREATE POLICY "shop_settings_admin_all" ON shop_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 11. VARSAYILAN KATEGORİLER
-- ============================================

INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, display_order) VALUES
    ('giyim', 'Giyim', 'Kleidung', 'Clothing', '👗', 1),
    ('aksesuar', 'Aksesuar & Takı', 'Accessoires & Schmuck', 'Accessories & Jewelry', '💎', 2),
    ('dekorasyon', 'Dekorasyon', 'Dekoration', 'Decoration', '💐', 3),
    ('hediyelik', 'Hediyelik', 'Geschenke', 'Gifts', '🎁', 4),
    ('kirtasiye', 'Kırtasiye', 'Schreibwaren', 'Stationery', '📋', 5),
    ('diger', 'Diğer', 'Sonstiges', 'Other', '📦', 99)
ON CONFLICT (slug) DO NOTHING;

-- Alt kategoriler - Giyim
DO $$
DECLARE parent_uuid UUID;
BEGIN
    SELECT id INTO parent_uuid FROM shop_categories WHERE slug = 'giyim';
    INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, parent_id, display_order) VALUES
        ('gelinlikler', 'Gelinlikler', 'Brautkleider', 'Wedding Dresses', '👰', parent_uuid, 1),
        ('damatliklar', 'Damatlıklar', 'Anzüge', 'Groom Suits', '🤵', parent_uuid, 2),
        ('abiye', 'Abiye & Nişanlık', 'Abendkleider', 'Evening Dresses', '👗', parent_uuid, 3),
        ('nedime', 'Nedime Kıyafetleri', 'Brautjungfernkleider', 'Bridesmaid Dresses', '👯', parent_uuid, 4)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Alt kategoriler - Aksesuar
DO $$
DECLARE parent_uuid UUID;
BEGIN
    SELECT id INTO parent_uuid FROM shop_categories WHERE slug = 'aksesuar';
    INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, parent_id, display_order) VALUES
        ('tac', 'Gelin Tacı', 'Diadem', 'Tiara', '👑', parent_uuid, 1),
        ('taki', 'Düğün Takıları', 'Hochzeitsschmuck', 'Wedding Jewelry', '💍', parent_uuid, 2),
        ('ayakkabi', 'Ayakkabı & Çanta', 'Schuhe & Taschen', 'Shoes & Bags', '👠', parent_uuid, 3)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Alt kategoriler - Dekorasyon
DO $$
DECLARE parent_uuid UUID;
BEGIN
    SELECT id INTO parent_uuid FROM shop_categories WHERE slug = 'dekorasyon';
    INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, parent_id, display_order) VALUES
        ('masa-susu', 'Masa Süsleri', 'Tischdekoration', 'Table Decorations', '🕯️', parent_uuid, 1),
        ('cicek-balon', 'Çiçek & Balon', 'Blumen & Ballons', 'Flowers & Balloons', '🎈', parent_uuid, 2),
        ('isiklandirma', 'Işıklandırma', 'Beleuchtung', 'Lighting', '💡', parent_uuid, 3)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Alt kategoriler - Hediyelik
DO $$
DECLARE parent_uuid UUID;
BEGIN
    SELECT id INTO parent_uuid FROM shop_categories WHERE slug = 'hediyelik';
    INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, parent_id, display_order) VALUES
        ('nikah-sekeri', 'Nikah Şekeri', 'Hochzeitsmandeln', 'Wedding Favors', '🍬', parent_uuid, 1),
        ('misafir-hediye', 'Misafir Hediyeleri', 'Gastgeschenke', 'Guest Gifts', '🎀', parent_uuid, 2)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Alt kategoriler - Kırtasiye
DO $$
DECLARE parent_uuid UUID;
BEGIN
    SELECT id INTO parent_uuid FROM shop_categories WHERE slug = 'kirtasiye';
    INSERT INTO shop_categories (slug, name_tr, name_de, name_en, icon, parent_id, display_order) VALUES
        ('davetiye', 'Davetiyeler', 'Einladungen', 'Invitations', '💌', parent_uuid, 1),
        ('menu-kart', 'Menü Kartları', 'Menükarten', 'Menu Cards', '📄', parent_uuid, 2)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================
-- MIGRATION TAMAMLANDI
-- ============================================
