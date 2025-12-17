-- =====================================================
-- DJ34 DEMO KATEGORİLERİ VE ÜRÜNLERİ
-- =====================================================

-- Önce mevcut kategorileri güncelle (ikonlar ve açıklamalar)
UPDATE shop_custom_categories
SET 
    icon = '🎧',
    description_tr = 'Profesyonel DJ ekipmanları, CDJ, mixer ve controller',
    description_de = 'Professionelle DJ-Ausrüstung, CDJ, Mixer und Controller',
    description_en = 'Professional DJ equipment, CDJ, mixer and controller'
WHERE name_tr = 'DJ Ekipmanları';

UPDATE shop_custom_categories
SET 
    icon = '💡',
    description_tr = 'LED ışıklar, moving head, lazer sistemleri',
    description_de = 'LED-Lichter, Moving Heads, Lasersysteme',
    description_en = 'LED lights, moving heads, laser systems'
WHERE name_tr = 'Sahne Işıkları';

UPDATE shop_custom_categories
SET 
    icon = '🔊',
    description_tr = 'Hoparlör, subwoofer, amfi sistemleri',
    description_de = 'Lautsprecher, Subwoofer, Verstärkersysteme',
    description_en = 'Speakers, subwoofers, amplifier systems'
WHERE name_tr = 'Ses Sistemleri';

-- Yeni kategoriler ekle
INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, description_tr, description_de, description_en, icon, sort_order)
SELECT 
    id,
    'Efekt Makineleri',
    'Effektmaschinen',
    'Effect Machines',
    'Sis makinesi, konfeti, CO2, kıvılcım efektleri',
    'Nebelmaschine, Konfetti, CO2, Funkeneffekte',
    'Fog machine, confetti, CO2, spark effects',
    '✨',
    4
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events'
ON CONFLICT DO NOTHING;

INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, description_tr, description_de, description_en, icon, sort_order)
SELECT 
    id,
    'Mikrofon & Ses',
    'Mikrofon & Sound',
    'Microphone & Sound',
    'Kablosuz mikrofon, headset, ses mikserleri',
    'Drahtlose Mikrofone, Headsets, Audiomixer',
    'Wireless microphones, headsets, audio mixers',
    '🎤',
    5
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events'
ON CONFLICT DO NOTHING;

INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, description_tr, description_de, description_en, icon, sort_order)
SELECT 
    id,
    'Düğün Paketleri',
    'Hochzeitspakete',
    'Wedding Packages',
    'Komple düğün ses ve ışık paketleri',
    'Komplette Hochzeits-Sound- und Lichtpakete',
    'Complete wedding sound and light packages',
    '💒',
    6
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events'
ON CONFLICT DO NOTHING;
