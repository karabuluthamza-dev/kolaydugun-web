-- Demo Products for DJ34 Istanbul Wedding & Events
-- FIXED: jsonb format for images

-- DJ34 Istanbul için demo ürünler
INSERT INTO shop_products (shop_account_id, name_tr, name_de, name_en, description_tr, description_de, description_en, price, currency, show_price, images, status, display_order)
SELECT 
    id,
    'Profesyonel Düğün DJ Seti',
    'Professionelles Hochzeits-DJ-Set',
    'Professional Wedding DJ Set',
    'Düğününüz için profesyonel DJ hizmeti. 8 saate kadar müzik, ses sistemi ve ışık dahil.',
    'Professioneller DJ-Service für Ihre Hochzeit. Bis zu 8 Stunden Musik, Soundsystem und Beleuchtung inklusive.',
    'Professional DJ service for your wedding. Up to 8 hours of music, sound system and lighting included.',
    800.00, 'EUR', true,
    '["https://images.unsplash.com/photo-1571266028243-3716f02d3669?w=800", "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800"]'::jsonb,
    'approved', 1
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

INSERT INTO shop_products (shop_account_id, name_tr, name_de, name_en, description_tr, description_de, description_en, price, currency, show_price, images, status, display_order)
SELECT 
    id,
    'VIP Düğün Paketi',
    'VIP Hochzeitspaket',
    'VIP Wedding Package',
    'DJ + Ses Sistemi + LED Işık Gösterisi + Duman Makinesi. Unutulmaz bir gece!',
    'DJ + Soundsystem + LED-Lichtshow + Nebelmaschine. Eine unvergessliche Nacht!',
    'DJ + Sound System + LED Light Show + Fog Machine. An unforgettable night!',
    1500.00, 'EUR', true,
    '["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=800"]'::jsonb,
    'approved', 2
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

INSERT INTO shop_products (shop_account_id, name_tr, name_de, name_en, description_tr, description_de, description_en, price, currency, show_price, images, status, display_order)
SELECT 
    id,
    'Kına Gecesi Müzik Paketi',
    'Henna-Nacht Musikpaket',
    'Henna Night Music Package',
    'Geleneksel Türk kına gecesi için özel müzik seti. Türk halk müziği ve modern remixler.',
    'Spezielles Musikset für die traditionelle türkische Henna-Nacht.',
    'Special music set for traditional Turkish henna night.',
    450.00, 'EUR', true,
    '["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"]'::jsonb,
    'approved', 3
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

INSERT INTO shop_products (shop_account_id, name_tr, name_de, name_en, description_tr, description_de, description_en, price, currency, show_price, images, status, display_order)
SELECT 
    id,
    'Nişan & Söz Töreni',
    'Verlobungs- & Zusagefeier',
    'Engagement & Promise Ceremony',
    'Küçük ölçekli etkinlikler için DJ hizmeti. 4 saate kadar müzik.',
    'DJ-Service für kleinere Veranstaltungen. Bis zu 4 Stunden Musik.',
    'DJ service for small-scale events. Up to 4 hours of music.',
    300.00, 'EUR', true,
    '["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"]'::jsonb,
    'approved', 4
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

INSERT INTO shop_products (shop_account_id, name_tr, name_de, name_en, description_tr, description_de, description_en, price, currency, show_price, price_on_request, images, status, display_order)
SELECT 
    id,
    'Full Production Paketi',
    'Vollproduktions-Paket',
    'Full Production Package',
    'DJ + Canlı Müzik + Video Mapping + Havai Fişek. Özel teklif!',
    'DJ + Live-Musik + Video-Mapping + Feuerwerk. Sonderangebot!',
    'DJ + Live Music + Video Mapping + Fireworks. Special offer!',
    0, 'EUR', false, true,
    '["https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800"]'::jsonb,
    'approved', 5
FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';

-- Kontrol
SELECT name_tr, price, status FROM shop_products 
WHERE shop_account_id = (SELECT id FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf')
ORDER BY display_order;
