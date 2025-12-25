-- Faz 5: Hibrit Monetizasyon Sistem Altyapısı
-- Bu migrasyon, tedarikçilerin canlı istek panelini krediyle açabilmesini ve tek seferlik deneme hakkını takip eder.

-- 1. Vendors tablosuna gerekli alanları ekle
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS live_trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS live_access_until TIMESTAMPTZ DEFAULT NULL;

-- 2. Eğer gerekiyorsa adminlerin bu alanları görebilmesi için yetki veya view güncellenebilir 
-- (Şu anlık sadece schema değişikliği yeterli)

COMMENT ON COLUMN vendors.live_trial_used IS 'Tedarikçinin canlı istek paneli için tek seferlik ücretsiz deneme hakkını kullanıp kullanmadığı.';
COMMENT ON COLUMN vendors.live_access_until IS 'Tedarikçinin (krediyle veya deneme sürümüyle) canlı istek paneline erişiminin ne zamana kadar aktif olduğu.';
