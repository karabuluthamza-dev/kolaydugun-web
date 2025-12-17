-- =====================================================
-- DJ34 SORUN TESPİT VE DÜZELTME
-- =====================================================

-- 1. Auth.users tablosunda DJ34 email'i ara (case-insensitive)
SELECT id, email, created_at 
FROM auth.users 
WHERE email ILIKE '%dj34%' OR email ILIKE '%dj%istanbul%';

-- 2. Shop accounts tablosundaki DJ34
SELECT id, email, user_id, business_name 
FROM shop_accounts 
WHERE email ILIKE '%dj34%';

-- 3. Tüm auth.users email'lerini göster (ilk 20)
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 20;

-- =====================================================
-- DÜZELTME: Email ile eşleşeni bul ve user_id'yi ayarla
-- =====================================================

-- Shop accounts'taki email'i auth.users'daki email ile eşleştir
-- (Case-insensitive ve trim ile)
UPDATE shop_accounts 
SET user_id = u.id
FROM auth.users u
WHERE LOWER(TRIM(shop_accounts.email)) = LOWER(TRIM(u.email))
AND shop_accounts.user_id IS NULL;

-- Sonucu kontrol et
SELECT 
    sa.id,
    sa.business_name,
    sa.email,
    sa.user_id,
    CASE WHEN sa.user_id IS NOT NULL THEN '✅ BAĞLANDI' ELSE '❌ BAĞLANMADI' END as durum
FROM shop_accounts sa
WHERE sa.email ILIKE '%dj34%';
