-- ============================================
-- AMAZON AFFILIATE SİSTEMİ - VERİTABANI
-- Tarih: 2025-12-15
-- Faz: 1 - Temel Altyapı
-- ============================================

-- ============================================
-- 1. SHOP_PRODUCTS TABLOSUNA YENİ ALANLAR
-- ============================================

-- Ürün tipi: boutique veya amazon
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'boutique' 
CHECK (product_type IN ('boutique', 'amazon', 'external'));

-- Amazon orijinal URL
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS amazon_url TEXT;

-- Amazon ürün ID (ASIN)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS amazon_asin TEXT;

-- Affiliate link (kolaydg1-21 eklenmiş)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- Son kontrol zamanı
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

-- Kontrol durumu
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS check_status TEXT DEFAULT 'pending'
CHECK (check_status IN ('pending', 'active', 'unavailable', 'price_changed', 'error'));

-- İlk eklenen fiyat (karşılaştırma için)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- SEO meta title (3 dil)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_title_tr TEXT;
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_title_de TEXT;
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_title_en TEXT;

-- SEO meta description (3 dil)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_description_tr TEXT;
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_description_de TEXT;
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS seo_description_en TEXT;

-- Index for Amazon products
CREATE INDEX IF NOT EXISTS idx_shop_products_type ON shop_products(product_type);
CREATE INDEX IF NOT EXISTS idx_shop_products_amazon_asin ON shop_products(amazon_asin);
CREATE INDEX IF NOT EXISTS idx_shop_products_check_status ON shop_products(check_status);

-- ============================================
-- 2. SHOP_AMAZON_LOGS - İşlem Kayıtları
-- ============================================

CREATE TABLE IF NOT EXISTS shop_amazon_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Hangi ürün
    product_id UUID REFERENCES shop_products(id) ON DELETE CASCADE,
    
    -- İşlem tipi
    action TEXT NOT NULL CHECK (action IN (
        'added',           -- Ürün eklendi
        'updated',         -- Bilgi güncellendi
        'price_changed',   -- Fiyat değişti
        'unavailable',     -- Ürün kalktı
        'restored',        -- Ürün geri geldi
        'error'            -- Hata oluştu
    )),
    
    -- Değişiklik detayları
    old_value JSONB,
    new_value JSONB,
    
    -- Hata mesajı (varsa)
    error_message TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amazon_logs_product ON shop_amazon_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_amazon_logs_action ON shop_amazon_logs(action);
CREATE INDEX IF NOT EXISTS idx_amazon_logs_created ON shop_amazon_logs(created_at);

-- ============================================
-- 3. SHOP_AMAZON_SETTINGS - Ayarlar
-- ============================================

CREATE TABLE IF NOT EXISTS shop_amazon_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan ayarları ekle
INSERT INTO shop_amazon_settings (key, value, description) VALUES
    ('affiliate_tag', 'kolaydg1-21', 'Amazon Affiliate Tracking ID'),
    ('amazon_domain', 'amazon.de', 'Amazon domain (sadece .de destekleniyor)'),
    ('check_frequency', 'daily', 'Ürün kontrol sıklığı: daily, hourly'),
    ('check_time', '03:00', 'Günlük kontrol saati'),
    ('auto_hide_unavailable', 'true', 'Kalkan ürünleri otomatik gizle'),
    ('email_notifications', 'true', 'Email bildirimleri gönder'),
    ('gemini_api_key', '', 'Google Gemini API anahtarı'),
    ('max_daily_imports', '100', 'Günlük maksimum ürün ekleme sayısı')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. SHOP_AI_RECOMMENDATIONS - AI Önerileri
-- ============================================

CREATE TABLE IF NOT EXISTS shop_ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Öneri tipi
    type TEXT NOT NULL CHECK (type IN (
        'product',      -- Ürün önerisi
        'trend',        -- Trend bildirimi
        'content',      -- İçerik/blog önerisi
        'task',         -- Görev önerisi
        'alert'         -- Uyarı
    )),
    
    -- Öneri içeriği
    title TEXT NOT NULL,
    description TEXT,
    
    -- Aksiyon
    action_type TEXT, -- 'add_product', 'write_blog', 'check_price', etc.
    action_data JSONB, -- {"url": "...", "category": "..."}
    
    -- Öncelik (1=en yüksek, 5=en düşük)
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    
    -- Durum
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'seen', 'done', 'dismissed')),
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON shop_ai_recommendations(type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON shop_ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON shop_ai_recommendations(priority);

-- ============================================
-- 5. SHOP_DAILY_TASKS - Günlük Görevler
-- ============================================

CREATE TABLE IF NOT EXISTS shop_daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Hangi gün için
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Görev tipi
    task_type TEXT NOT NULL CHECK (task_type IN (
        'add_products',     -- Ürün ekle
        'write_content',    -- İçerik yaz
        'share_social',     -- Sosyal medya paylaş
        'check_products',   -- Ürünleri kontrol et
        'analyze_stats',    -- İstatistikleri analiz et
        'custom'            -- Özel görev
    )),
    
    -- Görev detayları
    title TEXT NOT NULL,
    description TEXT,
    
    -- Hedef ve ilerleme
    target_count INTEGER DEFAULT 1,
    current_count INTEGER DEFAULT 0,
    
    -- Durum
    is_completed BOOLEAN DEFAULT false,
    
    -- AI tarafından mı oluşturuldu
    ai_generated BOOLEAN DEFAULT false,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON shop_daily_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_completed ON shop_daily_tasks(is_completed);

-- ============================================
-- 6. SHOP_PERFORMANCE_LOG - Performans Kayıtları
-- ============================================

CREATE TABLE IF NOT EXISTS shop_performance_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Hangi gün
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Metrik tipi
    metric TEXT NOT NULL CHECK (metric IN (
        'products_added',
        'products_removed',
        'total_clicks',
        'unique_visitors',
        'page_views',
        'affiliate_clicks'
    )),
    
    -- Değer
    value INTEGER DEFAULT 0,
    
    -- Ek notlar
    notes TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Aynı gün aynı metrik tekrarlanmasın
    UNIQUE(log_date, metric)
);

CREATE INDEX IF NOT EXISTS idx_performance_log_date ON shop_performance_log(log_date);

-- ============================================
-- 7. RLS POLİTİKALARI
-- ============================================

-- shop_amazon_logs RLS
ALTER TABLE shop_amazon_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_amazon_logs_admin_all" ON shop_amazon_logs;
CREATE POLICY "shop_amazon_logs_admin_all" ON shop_amazon_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_amazon_settings RLS
ALTER TABLE shop_amazon_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_amazon_settings_select_public" ON shop_amazon_settings;
CREATE POLICY "shop_amazon_settings_select_public" ON shop_amazon_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_amazon_settings_admin_all" ON shop_amazon_settings;
CREATE POLICY "shop_amazon_settings_admin_all" ON shop_amazon_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_ai_recommendations RLS
ALTER TABLE shop_ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_ai_recommendations_admin_all" ON shop_ai_recommendations;
CREATE POLICY "shop_ai_recommendations_admin_all" ON shop_ai_recommendations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_daily_tasks RLS
ALTER TABLE shop_daily_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_daily_tasks_admin_all" ON shop_daily_tasks;
CREATE POLICY "shop_daily_tasks_admin_all" ON shop_daily_tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- shop_performance_log RLS
ALTER TABLE shop_performance_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_performance_log_admin_all" ON shop_performance_log;
CREATE POLICY "shop_performance_log_admin_all" ON shop_performance_log
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Amazon ASIN çıkarma fonksiyonu
CREATE OR REPLACE FUNCTION extract_amazon_asin(url TEXT)
RETURNS TEXT AS $$
DECLARE
    asin TEXT;
BEGIN
    -- /dp/XXXXXXXXXX pattern
    asin := (regexp_matches(url, '/dp/([A-Z0-9]{10})', 'i'))[1];
    IF asin IS NOT NULL THEN
        RETURN asin;
    END IF;
    
    -- /gp/product/XXXXXXXXXX pattern
    asin := (regexp_matches(url, '/gp/product/([A-Z0-9]{10})', 'i'))[1];
    IF asin IS NOT NULL THEN
        RETURN asin;
    END IF;
    
    -- /ASIN/XXXXXXXXXX pattern
    asin := (regexp_matches(url, '/ASIN/([A-Z0-9]{10})', 'i'))[1];
    RETURN asin;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Affiliate URL oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_affiliate_url(amazon_url TEXT, affiliate_tag TEXT DEFAULT 'kolaydg1-21')
RETURNS TEXT AS $$
DECLARE
    base_url TEXT;
    asin TEXT;
BEGIN
    asin := extract_amazon_asin(amazon_url);
    IF asin IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN 'https://www.amazon.de/dp/' || asin || '?tag=' || affiliate_tag;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Amazon ayarını getir
CREATE OR REPLACE FUNCTION get_amazon_setting(setting_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT value FROM shop_amazon_settings WHERE key = setting_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Günlük görev ilerlemesini güncelle
CREATE OR REPLACE FUNCTION update_daily_task_progress(
    p_task_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    UPDATE shop_daily_tasks 
    SET 
        current_count = current_count + p_increment,
        is_completed = (current_count + p_increment >= target_count),
        completed_at = CASE 
            WHEN current_count + p_increment >= target_count THEN NOW() 
            ELSE NULL 
        END
    WHERE task_date = CURRENT_DATE 
    AND task_type = p_task_type
    AND is_completed = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGER: Otomatik affiliate URL oluştur
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_affiliate_url()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_type = 'amazon' AND NEW.amazon_url IS NOT NULL THEN
        NEW.amazon_asin := extract_amazon_asin(NEW.amazon_url);
        NEW.affiliate_url := generate_affiliate_url(NEW.amazon_url);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shop_products_affiliate_url ON shop_products;
CREATE TRIGGER shop_products_affiliate_url
    BEFORE INSERT OR UPDATE ON shop_products
    FOR EACH ROW
    WHEN (NEW.product_type = 'amazon')
    EXECUTE FUNCTION auto_generate_affiliate_url();

-- ============================================
-- MİGRATION TAMAMLANDI
-- ============================================

-- Özet
COMMENT ON TABLE shop_amazon_logs IS 'Amazon ürün işlem kayıtları';
COMMENT ON TABLE shop_amazon_settings IS 'Amazon affiliate sistem ayarları';
COMMENT ON TABLE shop_ai_recommendations IS 'AI tarafından oluşturulan öneriler';
COMMENT ON TABLE shop_daily_tasks IS 'Günlük görev listesi';
COMMENT ON TABLE shop_performance_log IS 'Performans metrikleri';
