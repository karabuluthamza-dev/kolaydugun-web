-- DJ34 Mağaza user_id Düzeltme
-- Email: dj34istanbul@gmail.com

-- 1. Önce auth.users'da bu email var mı kontrol et
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'dj34istanbul@gmail.com';

-- 2. Eğer varsa, shop_accounts'a bağla
UPDATE shop_accounts 
SET user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'dj34istanbul@gmail.com'
    LIMIT 1
)
WHERE email = 'dj34istanbul@gmail.com';

-- 3. Sonucu kontrol et
SELECT id, business_name, email, user_id 
FROM shop_accounts 
WHERE email = 'dj34istanbul@gmail.com';

-- 4. Ürünlerin görünmesini sağla (bonus: tüm ürünleri approved yap)
SELECT id, name_tr, status, shop_account_id 
FROM shop_products 
WHERE shop_account_id = (
    SELECT id FROM shop_accounts WHERE email = 'dj34istanbul@gmail.com'
);
