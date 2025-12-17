-- Migration: Shop Storefront Enhancements
-- Adds new fields for improved shop storefront experience

-- 1. Add new columns to shop_accounts for enhanced storefront
ALTER TABLE shop_accounts
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS slogan_tr TEXT,
ADD COLUMN IF NOT EXISTS slogan_de TEXT,
ADD COLUMN IF NOT EXISTS slogan_en TEXT,
ADD COLUMN IF NOT EXISTS about_tr TEXT,
ADD COLUMN IF NOT EXISTS about_de TEXT,
ADD COLUMN IF NOT EXISTS about_en TEXT,
ADD COLUMN IF NOT EXISTS how_we_work_tr TEXT,
ADD COLUMN IF NOT EXISTS how_we_work_de TEXT,
ADD COLUMN IF NOT EXISTS how_we_work_en TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS service_regions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cancellation_policy_tr TEXT,
ADD COLUMN IF NOT EXISTS cancellation_policy_de TEXT,
ADD COLUMN IF NOT EXISTS cancellation_policy_en TEXT;

-- Add comments for documentation
COMMENT ON COLUMN shop_accounts.video_url IS 'YouTube or Vimeo embed URL for hero video background';
COMMENT ON COLUMN shop_accounts.slogan_tr IS 'Short tagline/slogan in Turkish';
COMMENT ON COLUMN shop_accounts.slogan_de IS 'Short tagline/slogan in German';
COMMENT ON COLUMN shop_accounts.slogan_en IS 'Short tagline/slogan in English';
COMMENT ON COLUMN shop_accounts.about_tr IS 'About us section in Turkish';
COMMENT ON COLUMN shop_accounts.about_de IS 'About us section in German';
COMMENT ON COLUMN shop_accounts.about_en IS 'About us section in English';
COMMENT ON COLUMN shop_accounts.how_we_work_tr IS 'How we work section in Turkish';
COMMENT ON COLUMN shop_accounts.experience_years IS 'Years of experience';
COMMENT ON COLUMN shop_accounts.rating IS 'Average rating (1.0-5.0)';
COMMENT ON COLUMN shop_accounts.service_regions IS 'Array of regions/cities served';

-- 2. Create shop_gallery table for link-based media gallery
CREATE TABLE IF NOT EXISTS shop_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    title_tr TEXT,
    title_de TEXT,
    title_en TEXT,
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shop_gallery_shop_id ON shop_gallery(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_gallery_type ON shop_gallery(type);

-- Enable RLS
ALTER TABLE shop_gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_gallery
DROP POLICY IF EXISTS "shop_gallery_select_public" ON shop_gallery;
CREATE POLICY "shop_gallery_select_public" ON shop_gallery
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "shop_gallery_owner_all" ON shop_gallery;
CREATE POLICY "shop_gallery_owner_all" ON shop_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_gallery.shop_id 
            AND (
                shop_accounts.user_id = auth.uid()
                OR shop_accounts.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- Admin policy
DROP POLICY IF EXISTS "shop_gallery_admin_all" ON shop_gallery;
CREATE POLICY "shop_gallery_admin_all" ON shop_gallery
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Add demo data for DJ34 shop
DO $$
DECLARE
    dj34_id UUID;
BEGIN
    SELECT id INTO dj34_id FROM shop_accounts WHERE slug LIKE '%dj34%' LIMIT 1;
    
    IF dj34_id IS NOT NULL THEN
        UPDATE shop_accounts SET
            video_url = NULL,
            slogan_tr = 'Almanya genelinde Türk düğünlerine özel profesyonel DJ & Event çözümleri',
            slogan_de = 'Professionelle DJ & Event-Lösungen für türkische Hochzeiten in ganz Deutschland',
            slogan_en = 'Professional DJ & Event solutions for Turkish weddings across Germany',
            about_tr = 'DJ34 Istanbul Wedding & Events olarak 10 yılı aşkın tecrübemizle Almanya''nın dört bir yanında unutulmaz düğünler yaratıyoruz. Profesyonel ekipmanlarımız, deneyimli DJ''lerimiz ve müşteri odaklı yaklaşımımızla düğününüzü hayalinizdeki gibi kutlamanızı sağlıyoruz.',
            about_de = 'Als DJ34 Istanbul Wedding & Events schaffen wir mit über 10 Jahren Erfahrung unvergessliche Hochzeiten in ganz Deutschland. Mit unserer professionellen Ausrüstung, erfahrenen DJs und kundenorientierten Ansatz sorgen wir dafür, dass Ihre Hochzeit so wird, wie Sie es sich erträumt haben.',
            about_en = 'As DJ34 Istanbul Wedding & Events, we create unforgettable weddings across Germany with over 10 years of experience. With our professional equipment, experienced DJs, and customer-focused approach, we ensure your wedding celebration is exactly as you dreamed.',
            how_we_work_tr = '1️⃣ İlk Görüşme: Düğün tarihinizi ve beklentilerinizi öğreniyoruz
2️⃣ Teklif: Size özel paket teklifimizi sunuyoruz
3️⃣ Planlama: Müzik listesi ve detayları birlikte belirliyoruz
4️⃣ Düğün Günü: Tam ekipman ile sahne alıyoruz',
            how_we_work_de = '1️⃣ Erstgespräch: Wir erfahren Ihren Hochzeitstermin und Ihre Erwartungen
2️⃣ Angebot: Wir unterbreiten Ihnen ein maßgeschneidertes Paketangebot
3️⃣ Planung: Wir erstellen gemeinsam die Playlist und Details
4️⃣ Hochzeitstag: Wir treten mit kompletter Ausrüstung auf',
            how_we_work_en = '1️⃣ Initial Meeting: We learn about your wedding date and expectations
2️⃣ Proposal: We present a customized package offer
3️⃣ Planning: We determine the playlist and details together
4️⃣ Wedding Day: We perform with full equipment',
            experience_years = 10,
            rating = 4.9,
            service_regions = '["Berlin", "Frankfurt", "München", "Köln", "Stuttgart", "Düsseldorf", "Hamburg"]'::jsonb,
            cancellation_policy_tr = 'Düğün tarihinden 30 gün önce ücretsiz iptal. 30 günden az kalan sürede %50 iade.',
            cancellation_policy_de = 'Kostenlose Stornierung bis 30 Tage vor dem Hochzeitstermin. Bei weniger als 30 Tagen 50% Erstattung.',
            cancellation_policy_en = 'Free cancellation up to 30 days before the wedding date. 50% refund for less than 30 days.'
        WHERE id = dj34_id;
        
        RAISE NOTICE 'DJ34 shop updated with new enhanced fields';
    END IF;
END $$;
