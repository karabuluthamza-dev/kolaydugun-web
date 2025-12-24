-- Scraper durumunu ve tetikleyicileri takip eden tablo
CREATE TABLE IF NOT EXISTS scraper_status (
    id TEXT PRIMARY KEY,
    last_run_started_at TIMESTAMPTZ,
    last_run_finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'idle', -- 'idle', 'running', 'error'
    trigger_sync TIMESTAMPTZ DEFAULT NOW(), -- UI bu değeri güncelleyerek botu uyandırır
    logs TEXT
);

-- Başlangıç kaydı
INSERT INTO scraper_status (id, status) VALUES ('hp24_main', 'idle') ON CONFLICT DO NOTHING;

-- RLS ayarları
ALTER TABLE scraper_status DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE scraper_status TO anon, authenticated, service_role;
