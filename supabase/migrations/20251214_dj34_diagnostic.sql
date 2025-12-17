-- =====================================================
-- DİAGNOSTİK SORGU
-- =====================================================
-- Mağazanın durumunu ve ürünleri kontrol et

-- 1. Mağaza bilgileri
SELECT 
    id,
    business_name,
    slug,
    is_active,
    is_verified,
    plan
FROM shop_accounts 
WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

-- 2. Ürün sayısı
SELECT COUNT(*) as urun_sayisi 
FROM shop_products 
WHERE shop_account_id = (
    SELECT id FROM shop_accounts 
    WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf'
);

-- 3. Mağaza aktif değilse aktifleştir
UPDATE shop_accounts 
SET is_active = true 
WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

-- 4. Kontrol
SELECT 'Mağaza aktifleştirildi: is_active = true' as mesaj;
