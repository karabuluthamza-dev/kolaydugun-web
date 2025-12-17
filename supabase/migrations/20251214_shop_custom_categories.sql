-- =====================================================
-- SHOP CUSTOM CATEGORIES (Tedarikçi Özel Kategorileri)
-- =====================================================
-- Her tedarikçi kendi mağazasında özel kategoriler oluşturabilir
-- 3 dil desteği (TR, DE, EN)

CREATE TABLE IF NOT EXISTS shop_custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES shop_custom_categories(id) ON DELETE CASCADE,
    
    -- 3 Dilli İsimler
    name_tr TEXT NOT NULL,
    name_de TEXT,
    name_en TEXT,
    
    -- 3 Dilli Açıklamalar
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    
    -- Görsel
    image_url TEXT,
    icon TEXT, -- emoji veya icon class
    
    -- Sıralama ve Durum
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_shop_custom_categories_shop ON shop_custom_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_custom_categories_parent ON shop_custom_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_shop_custom_categories_active ON shop_custom_categories(is_active);

-- RLS Policies
ALTER TABLE shop_custom_categories ENABLE ROW LEVEL SECURITY;

-- Herkes aktif kategorileri görebilir
DROP POLICY IF EXISTS "Public can view active custom categories" ON shop_custom_categories;
CREATE POLICY "Public can view active custom categories" ON shop_custom_categories
    FOR SELECT USING (is_active = true);

-- Mağaza sahibi kendi kategorilerini yönetebilir
DROP POLICY IF EXISTS "Shop owner can manage own categories" ON shop_custom_categories;
CREATE POLICY "Shop owner can manage own categories" ON shop_custom_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_custom_categories.shop_id 
            AND shop_accounts.email = auth.jwt() ->> 'email'
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_shop_custom_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shop_custom_categories_updated_at ON shop_custom_categories;
CREATE TRIGGER shop_custom_categories_updated_at
    BEFORE UPDATE ON shop_custom_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_custom_categories_updated_at();

-- =====================================================
-- DEMO DATA: DJ34 için örnek kategoriler
-- =====================================================
INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
SELECT 
    id,
    'DJ Ekipmanları',
    'DJ-Ausrüstung',
    'DJ Equipment',
    '🎧',
    1
FROM shop_accounts WHERE slug LIKE '%dj34%'
ON CONFLICT DO NOTHING;

INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
SELECT 
    id,
    'Sahne Işıkları',
    'Bühnenbeleuchtung',
    'Stage Lighting',
    '💡',
    2
FROM shop_accounts WHERE slug LIKE '%dj34%'
ON CONFLICT DO NOTHING;

INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
SELECT 
    id,
    'Ses Sistemleri',
    'Soundsysteme',
    'Sound Systems',
    '🔊',
    3
FROM shop_accounts WHERE slug LIKE '%dj34%'
ON CONFLICT DO NOTHING;
