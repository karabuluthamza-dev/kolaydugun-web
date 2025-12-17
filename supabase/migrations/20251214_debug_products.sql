-- DJ34 Ürün-Mağaza Eşleştirme Tanılama
-- Sorun: Mağaza sayfasında ürünler görünüyor ama panelde görünmüyor

-- 1. DJ34 mağaza bilgilerini kontrol et
SELECT 
    id as shop_id,
    business_name,
    email,
    user_id,
    slug,
    is_active
FROM shop_accounts 
WHERE slug LIKE '%dj34%';

-- 2. Bu mağazanın ürünlerini kontrol et
SELECT 
    p.id,
    p.name_tr,
    p.shop_account_id,
    p.status,
    s.business_name as shop_name,
    s.email as shop_email,
    s.user_id as shop_user_id
FROM shop_products p
LEFT JOIN shop_accounts s ON p.shop_account_id = s.id
WHERE s.slug LIKE '%dj34%';

-- 3. Tüm ürünlerin shop_account_id dağılımı
SELECT 
    shop_account_id,
    COUNT(*) as product_count,
    s.business_name
FROM shop_products p
LEFT JOIN shop_accounts s ON p.shop_account_id = s.id
GROUP BY shop_account_id, s.business_name;

-- 4. Mevcut kullanıcının eşleşmesi
-- Paneldeki kullanıcı bu mağazaya bağlı mı?
SELECT 
    email,
    user_id,
    business_name
FROM shop_accounts
WHERE is_active = true
LIMIT 5;
