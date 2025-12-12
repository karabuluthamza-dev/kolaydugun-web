-- Avatar Tablosu ve Storage Bucket Oluşturma
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- 1. Varsayılan avatarları tutan tablo oluştur
CREATE TABLE IF NOT EXISTS default_avatars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS politikaları
ALTER TABLE default_avatars ENABLE ROW LEVEL SECURITY;

-- Herkes avatarları görebilir
DROP POLICY IF EXISTS "Anyone can view active avatars" ON default_avatars;
CREATE POLICY "Anyone can view active avatars" ON default_avatars
    FOR SELECT USING (is_active = true);

-- Sadece adminler düzenleyebilir
DROP POLICY IF EXISTS "Admins can manage avatars" ON default_avatars;
CREATE POLICY "Admins can manage avatars" ON default_avatars
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- 3. Storage bucket oluştur (avatars)
-- NOT: Storage bucket Supabase Dashboard'dan oluşturulmalı
-- Dashboard → Storage → New bucket → "avatars" → Public bucket ✅

-- 4. Örnek avatarlar ekle (opsiyonel - admin panelden de eklenebilir)
INSERT INTO default_avatars (name, url, category, sort_order) VALUES
('Gelin 1', 'https://api.dicebear.com/7.x/micah/svg?seed=bride1&backgroundColor=ffd5dc', 'bride', 1),
('Gelin 2', 'https://api.dicebear.com/7.x/micah/svg?seed=bride2&backgroundColor=fff0f5', 'bride', 2),
('Damat 1', 'https://api.dicebear.com/7.x/micah/svg?seed=groom1&backgroundColor=e6e6fa', 'groom', 3),
('Damat 2', 'https://api.dicebear.com/7.x/micah/svg?seed=groom2&backgroundColor=d1d4f9', 'groom', 4),
('Kalp', 'https://api.dicebear.com/7.x/shapes/svg?seed=heart&backgroundColor=ff6b6b', 'symbol', 5)
ON CONFLICT DO NOTHING;

-- 5. Profiles tablosuna index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
