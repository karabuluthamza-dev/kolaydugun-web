-- Admin Günlük Özet E-posta Sistemi için Migration
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. site_settings tablosuna admin_digest ayarları ekle
DO $$
BEGIN
    -- admin_digest_settings sütunu yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'admin_digest_settings'
    ) THEN
        ALTER TABLE site_settings 
        ADD COLUMN admin_digest_settings JSONB DEFAULT '{
            "enabled": true,
            "email": "karabulut.hamza@gmail.com",
            "frequency": "daily",
            "times": ["08:00"],
            "include": {
                "users": true,
                "vendors": true,
                "leads": true,
                "forum": true,
                "support": true,
                "finance": true
            },
            "instant_notifications": {
                "payment": true,
                "critical_reports": true
            }
        }'::jsonb;
        
        RAISE NOTICE 'admin_digest_settings column added';
    END IF;
END $$;

-- 2. Mevcut kayıtta bu alanı güncelle (eğer NULL ise)
UPDATE site_settings 
SET admin_digest_settings = '{
    "enabled": true,
    "email": "karabulut.hamza@gmail.com",
    "frequency": "daily",
    "times": ["08:00"],
    "include": {
        "users": true,
        "vendors": true,
        "leads": true,
        "forum": true,
        "support": true,
        "finance": true
    },
    "instant_notifications": {
        "payment": true,
        "critical_reports": true
    }
}'::jsonb
WHERE admin_digest_settings IS NULL;

-- 3. admin_digest_logs tablosu (gönderim takibi için)
CREATE TABLE IF NOT EXISTS admin_digest_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    report_type TEXT NOT NULL, -- 'daily', 'instant_payment', 'instant_critical'
    email_to TEXT NOT NULL,
    stats JSONB, -- Gönderilen istatistikler
    status TEXT DEFAULT 'sent', -- 'sent', 'failed'
    error_message TEXT
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_digest_logs_sent_at ON admin_digest_logs(sent_at DESC);

SELECT 'Migration completed successfully!' as result;
