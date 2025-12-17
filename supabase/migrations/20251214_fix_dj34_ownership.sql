-- DJ34 Mağaza Sahipliği Düzeltme
-- Sorun: Ürünler panelde görünmüyor çünkü shop_accounts.user_id eşleşmiyor
-- Bu script, mevcut kullanıcının email'i ile eşleşen shop_account'a user_id'yi bağlar

-- Step 1: Önce mevcut durumu kontrol et
SELECT 
    sa.id as shop_id,
    sa.business_name,
    sa.email as shop_email,
    sa.user_id,
    au.email as auth_user_email,
    (SELECT COUNT(*) FROM shop_products WHERE shop_account_id = sa.id) as product_count
FROM shop_accounts sa
LEFT JOIN auth.users au ON sa.user_id = au.id
WHERE sa.slug LIKE '%dj34%';

-- Step 2: Auth.users'dan DJ34 email ile eşleşen kullanıcıları bul
SELECT id, email, created_at
FROM auth.users 
WHERE email ILIKE '%dj34%' OR email ILIKE '%dj%'
LIMIT 5;

-- Step 3: Mağazanın user_id'sini güncelle (email eşleştirmesi ile)
-- Bu otomatik olarak yapılacak - giriş yapan kullanıcının email'i ile shop_accounts.email eşleşirse
-- ShopOwnerContext zaten bunu yapıyor ama bazen çalışmayabilir

-- Manuel düzeltme: DJ34 mağazasının user_id'sini, auth.users tablosundaki
-- aynı email ile eşleştir
UPDATE shop_accounts 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE email = shop_accounts.email
    LIMIT 1
)
WHERE slug LIKE '%dj34%' 
AND user_id IS NULL;

-- Step 4: Sonucu doğrula
SELECT 
    sa.id as shop_id,
    sa.business_name,
    sa.email as shop_email,
    sa.user_id,
    au.email as auth_user_email,
    (SELECT COUNT(*) FROM shop_products WHERE shop_account_id = sa.id) as product_count
FROM shop_accounts sa
LEFT JOIN auth.users au ON sa.user_id = au.id
WHERE sa.slug LIKE '%dj34%';
