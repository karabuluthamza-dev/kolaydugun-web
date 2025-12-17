-- Shop Boutique Update Migration
-- product_type (amazon | boutique) ve amazon_affiliate_url ekleme

-- Product type için enum benzeri constraint
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'boutique' CHECK (product_type IN ('amazon', 'boutique'));

-- Amazon affiliate URL
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS amazon_affiliate_url TEXT;

-- Product type index
CREATE INDEX IF NOT EXISTS idx_shop_products_type ON shop_products(product_type);

-- KolayDugun admin tarafından eklenen global ürünler için
-- shop_account_id NULL olabilir (platform ürünleri)
ALTER TABLE shop_products ALTER COLUMN shop_account_id DROP NOT NULL;

-- Yorumları güncelle
COMMENT ON COLUMN shop_products.product_type IS 'amazon = Amazon Affiliate ürün, boutique = Boutique Collection ürün';
COMMENT ON COLUMN shop_products.amazon_affiliate_url IS 'Sadece Amazon ürünleri için affiliate linki';
COMMENT ON COLUMN shop_products.external_url IS 'Boutique ürünler için iletişim/detay linki';
