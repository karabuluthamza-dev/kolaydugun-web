-- Scraper Status tablosuna target_category sütununu ekle
ALTER TABLE scraper_status ADD COLUMN IF NOT EXISTS target_category TEXT DEFAULT 'all';

-- Mevcut kaydı güncelle
UPDATE scraper_status SET target_category = 'all' WHERE id = 'hp24_main';
