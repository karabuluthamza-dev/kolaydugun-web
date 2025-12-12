-- ==============================================================================
-- BAN/UNBAN SİSTEMİ - KULLANICI BANLAMA
-- ==============================================================================
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. profiles tablosuna is_banned sütunu ekle (yoksa)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. is_banned sütununa index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- 3. Mevcut tüm kullanıcıları unbanned olarak işaretle (güvenlik için)
UPDATE profiles SET is_banned = FALSE WHERE is_banned IS NULL;

-- 4. RLS politikası - Banlanmış kullanıcılar yorum/post yapamaz
-- (Opsiyonel - Frontend'de de kontrol edilebilir)

-- Kontrol: Sütun eklendi mi?
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_banned';
