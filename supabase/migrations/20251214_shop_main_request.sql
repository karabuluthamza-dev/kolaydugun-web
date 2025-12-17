-- =====================================================
-- SHOP PRODUCTS - ANA SHOP BAŞVURU ALANLARI
-- =====================================================
-- Mevcut shop_products tablosuna ana shop başvuru alanları ekleniyor

-- Özel kategori referansı
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS custom_category_id UUID REFERENCES shop_custom_categories(id) ON DELETE SET NULL;

-- Ana Shop Başvuru Durumu
-- none: başvuru yapılmadı
-- pending: onay bekliyor
-- approved: onaylandı, ana shop'ta görünür
-- rejected: reddedildi
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_request_status TEXT DEFAULT 'none';

-- Ana shop'ta hangi kategoride gösterilecek
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_category_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL;

-- Red sebebi
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_rejection_reason TEXT;

-- Başvuru ve onay tarihleri
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_requested_at TIMESTAMPTZ;

ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_approved_at TIMESTAMPTZ;

-- Admin notları (internal)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS main_shop_admin_notes TEXT;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_shop_products_custom_category ON shop_products(custom_category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_main_shop_status ON shop_products(main_shop_request_status);
CREATE INDEX IF NOT EXISTS idx_shop_products_main_shop_pending ON shop_products(main_shop_request_status) 
    WHERE main_shop_request_status = 'pending';

-- =====================================================
-- SITE SETTINGS - ANA SHOP YAYIN AYARLARI
-- =====================================================
-- site_settings tek satırlık bir tablo, sütun olarak ekleniyor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_publish_enabled BOOLEAN DEFAULT true;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_pricing_mode TEXT DEFAULT 'free';

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_quota_free INTEGER DEFAULT 0;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_quota_basic INTEGER DEFAULT 3;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_quota_premium INTEGER DEFAULT 10;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_per_product_fee DECIMAL DEFAULT 5;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS main_shop_commission_rate INTEGER DEFAULT 5;

-- =====================================================
-- HELPER VIEW: Pending approvals for admin
-- =====================================================
CREATE OR REPLACE VIEW shop_pending_approvals AS
SELECT 
    p.id,
    p.name_tr,
    p.name_de,
    p.name_en,
    p.price,
    p.images,
    p.main_shop_requested_at,
    p.main_shop_category_id,
    sa.business_name as shop_name,
    sa.slug as shop_slug,
    sc.name_tr as requested_category_tr,
    sc.name_de as requested_category_de,
    sc.name_en as requested_category_en
FROM shop_products p
JOIN shop_accounts sa ON p.shop_account_id = sa.id
LEFT JOIN shop_categories sc ON p.main_shop_category_id = sc.id
WHERE p.main_shop_request_status = 'pending'
ORDER BY p.main_shop_requested_at ASC;

