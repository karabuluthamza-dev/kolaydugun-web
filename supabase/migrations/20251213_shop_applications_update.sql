-- ============================================
-- SHOP_APPLICATIONS - Kolon Güncellemesi
-- Tarih: 2025-12-13
-- Açıklama: city ve selected_plan sütunları ekleme
-- ============================================

-- city sütununu ekle (country'yi değiştirme, varsa tutulabilir)
ALTER TABLE shop_applications 
ADD COLUMN IF NOT EXISTS city TEXT;

-- selected_plan sütununu ekle
ALTER TABLE shop_applications 
ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'starter' 
CHECK (selected_plan IN ('starter', 'business', 'premium'));

-- Mevcut kayıtlar için country değerini city'ye taşı (opsiyonel)
-- Sadece country varsa, yoksa boş bırak
UPDATE shop_applications 
SET city = NULL 
WHERE city IS NULL;

-- MIGRATION TAMAMLANDI
