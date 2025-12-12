-- Anasayfa İyileştirmeleri için Yeni Alanlar
-- Güven Rozetleri, CTA Ayarları, Hero Ayarları, Animasyon Ayarları

-- Yeni alanları site_settings tablosuna ekle
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS trust_badges JSONB DEFAULT '{
  "enabled": true,
  "items": [
    {"icon": "⭐", "text": {"tr": "4.9/5 Memnuniyet", "de": "4.9/5 Zufriedenheit", "en": "4.9/5 Satisfaction"}},
    {"icon": "🏆", "text": {"tr": "1000+ Düğün", "de": "1000+ Hochzeiten", "en": "1000+ Weddings"}},
    {"icon": "🔒", "text": {"tr": "Güvenli", "de": "Sicher", "en": "Secure"}}
  ]
}'::jsonb;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS cta_settings JSONB DEFAULT '{
  "position": "below_search",
  "show_floating": false
}'::jsonb;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_settings JSONB DEFAULT '{
  "background_type": "image",
  "video_url": "",
  "overlay_opacity": 0.5
}'::jsonb;

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS animation_settings JSONB DEFAULT '{
  "enabled": true,
  "type": "fade-up"
}'::jsonb;

-- Mevcut kayda varsayılan değerleri ekle
UPDATE site_settings SET 
  trust_badges = COALESCE(trust_badges, '{
    "enabled": true,
    "items": [
      {"icon": "⭐", "text": {"tr": "4.9/5 Memnuniyet", "de": "4.9/5 Zufriedenheit", "en": "4.9/5 Satisfaction"}},
      {"icon": "🏆", "text": {"tr": "1000+ Düğün", "de": "1000+ Hochzeiten", "en": "1000+ Weddings"}},
      {"icon": "🔒", "text": {"tr": "Güvenli", "de": "Sicher", "en": "Secure"}}
    ]
  }'::jsonb),
  cta_settings = COALESCE(cta_settings, '{"position": "below_search", "show_floating": false}'::jsonb),
  hero_settings = COALESCE(hero_settings, '{"background_type": "image", "video_url": "", "overlay_opacity": 0.5}'::jsonb),
  animation_settings = COALESCE(animation_settings, '{"enabled": true, "type": "fade-up"}'::jsonb)
WHERE id = 1;
