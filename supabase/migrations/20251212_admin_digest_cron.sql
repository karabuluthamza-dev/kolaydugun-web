-- =====================================================
-- Admin Günlük Rapor için Cron Job Kurulumu
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- =====================================================

-- 1. pg_cron extension'ını etkinleştir (zaten aktif olabilir)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. pg_net extension'ını etkinleştir (edge function çağırmak için)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Edge function'ı çağıran database function oluştur
CREATE OR REPLACE FUNCTION call_admin_digest()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    digest_settings jsonb;
    is_enabled boolean;
BEGIN
    -- Ayarları kontrol et
    SELECT admin_digest_settings INTO digest_settings
    FROM site_settings
    WHERE id = 1;
    
    is_enabled := COALESCE((digest_settings->>'enabled')::boolean, false);
    
    IF is_enabled THEN
        -- Edge function'ı çağır
        PERFORM net.http_post(
            url := 'https://rnkyghovurnaizkhwgtv.supabase.co/functions/v1/send_admin_digest',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object('report_type', 'daily')
        );
        
        RAISE NOTICE 'Admin digest email triggered at %', NOW();
    ELSE
        RAISE NOTICE 'Admin digest is disabled, skipping...';
    END IF;
END;
$$;

-- 4. Cron job oluştur - Her gün saat 08:00'de (UTC zamana göre ayarlayın)
-- Türkiye saati için: 08:00 TR = 05:00 UTC (yaz saati: 06:00 UTC)
-- Aşağıdaki satırı durumunuza göre ayarlayın

-- Sabah 08:00 TR için (kış saati - UTC+3):
SELECT cron.schedule(
    'admin-daily-digest-morning',
    '0 5 * * *',  -- Her gün UTC 05:00 = TR 08:00
    $$SELECT call_admin_digest()$$
);

-- Akşam 18:00 TR için (opsiyonel - ikinci bir rapor istiyorsanız):
-- SELECT cron.schedule(
--     'admin-daily-digest-evening',
--     '0 15 * * *',  -- Her gün UTC 15:00 = TR 18:00
--     $$SELECT call_admin_digest()$$
-- );

-- 5. Mevcut cron job'ları görmek için:
-- SELECT * FROM cron.job;

-- 6. Cron job'ı silmek için:
-- SELECT cron.unschedule('admin-daily-digest-morning');

-- =====================================================
-- NOTLAR:
-- - pg_cron UTC zamanını kullanır
-- - Türkiye UTC+3, yaz saati UTC+3
-- - 08:00 TR = 05:00 UTC (kış) 
-- - Cron formatı: dakika saat gün ay haftanın_günü
-- =====================================================

SELECT 'Cron job kurulumu tamamlandı!' as result;
