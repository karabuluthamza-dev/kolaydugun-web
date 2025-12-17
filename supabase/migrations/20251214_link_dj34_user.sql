-- =====================================================
-- DJ34 MAĞAZA USER_ID DÜZELTMESİ
-- Supabase Dashboard > SQL Editor'da çalıştırın!
-- =====================================================

-- Step 1: Auth tablosundaki kullanıcı ID'sini bul
SELECT id as user_uuid, email 
FROM auth.users 
WHERE email = 'dj34istanbul@gmail.com';

-- Step 2: Shop account'u bu kullanıcıya bağla
UPDATE shop_accounts 
SET user_id = (
    SELECT id FROM auth.users WHERE email = 'dj34istanbul@gmail.com' LIMIT 1
)
WHERE email = 'dj34istanbul@gmail.com';

-- Step 3: Sonucu doğrula
SELECT 
    sa.id,
    sa.business_name,
    sa.email, 
    sa.user_id,
    (sa.user_id IS NOT NULL) as is_linked
FROM shop_accounts sa
WHERE email = 'dj34istanbul@gmail.com';

-- Step 4: Ürünleri kontrol et
SELECT 
    p.id,
    p.name_tr,
    p.status,
    p.shop_account_id
FROM shop_products p
JOIN shop_accounts s ON p.shop_account_id = s.id
WHERE s.email = 'dj34istanbul@gmail.com';
