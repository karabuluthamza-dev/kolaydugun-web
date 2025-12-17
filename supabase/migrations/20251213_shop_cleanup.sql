-- ============================================
-- SHOP MARKETPLACE - TEMİZLEME SCRIPTI
-- Önce bunu çalıştırın, sonra ana migration'ı
-- ============================================

-- Varsa eski shop tablolarını temizle
DROP TABLE IF EXISTS shop_affiliate_earnings CASCADE;
DROP TABLE IF EXISTS shop_affiliate_clicks CASCADE;
DROP TABLE IF EXISTS shop_applications CASCADE;
DROP TABLE IF EXISTS shop_products CASCADE;
DROP TABLE IF EXISTS shop_categories CASCADE;
DROP TABLE IF EXISTS shop_accounts CASCADE;
DROP TABLE IF EXISTS shop_settings CASCADE;

-- Fonksiyonları temizle
DROP FUNCTION IF EXISTS update_shop_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_shop_affiliate_code() CASCADE;
DROP FUNCTION IF EXISTS get_shop_remaining_products(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_shop_product_view(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_shop_setting(TEXT) CASCADE;

-- Temizleme tamamlandı
SELECT 'Temizleme tamamlandı! Şimdi ana migration dosyasını çalıştırın.' as mesaj;
