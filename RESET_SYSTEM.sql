-- 1. Scraper Status Tablosunu ve Verisini Baştan Aşağı Yenile (404 Hatasını Çözmek İçin)
DROP TABLE IF EXISTS scraper_status;

CREATE TABLE scraper_status (
    id TEXT PRIMARY KEY,
    last_run_started_at TIMESTAMPTZ,
    last_run_finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'idle',
    trigger_sync TIMESTAMPTZ DEFAULT NOW(),
    logs TEXT
);

-- İlk kaydı elle ekliyoruz (hp24_main ID'si kesin olmalı)
INSERT INTO scraper_status (id, status, logs) 
VALUES ('hp24_main', 'idle', 'Sistem sıfırlandı. Başlamak için butona basın.')
ON CONFLICT (id) DO UPDATE SET status = 'idle', logs = 'Sistem sıfırlandı.';

-- RLS (Güvenlik) Ayarlarını Sıfırla (Erişim Sorununu Çözer)
ALTER TABLE scraper_status DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE scraper_status TO anon, authenticated, service_role;

-- 2. Mevcut İthalat Verilerini Temizle (Gerçek Sıfırlama)
TRUNCATE TABLE vendor_imports RESTART IDENTITY;

-- 3. Eksik Çevirileri Veritabanına Ekle (categories.cake vb.)
INSERT INTO translations (key, en, de, tr) VALUES 
('categories.cake', 'Wedding Cakes', 'Hochzeitstorte', 'Düğün Pastası'),
('categories.wedding_cakes', 'Wedding Cakes', 'Hochzeitstorte', 'Düğün Pastası'),
('categories.jewelry', 'Wedding Rings', 'Trauringe', 'Alyans & Takı')
ON CONFLICT (key) DO UPDATE SET 
tr = EXCLUDED.tr,
de = EXCLUDED.de,
en = EXCLUDED.en;
