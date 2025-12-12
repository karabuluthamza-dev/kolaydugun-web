-- Forum Profil Role Kontrolü ve Düzeltme
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Önce kullanıcının mevcut role'ünü kontrol edin
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE email ILIKE '%gulay%' OR first_name ILIKE '%gulay%';

-- 2. Eğer role = 'vendor' ise ve çift olmalıysa, aşağıdaki komutu çalıştırın:
-- (Email adresini kendi email adresinizle değiştirin)

-- UPDATE profiles SET role = 'couple' WHERE email = 'gulay@example.com';

-- 3. Değişikliği doğrulayın
-- SELECT id, email, role FROM profiles WHERE email = 'gulay@example.com';
