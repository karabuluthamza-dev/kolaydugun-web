-- Kullanıcı rolünü kontrol et ve gerekirse admin yap

-- 1. Mevcut kullanıcının rolünü göster
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    p.role as user_role,
    p.full_name
FROM profiles p
WHERE p.id = auth.uid();

-- 2. Eğer rol NULL veya 'admin' değilse, admin yap
UPDATE profiles
SET role = 'admin'
WHERE id = auth.uid()
  AND (role IS NULL OR role != 'admin');

-- 3. Doğrula
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    p.role as user_role
FROM profiles p
WHERE p.id = auth.uid();
