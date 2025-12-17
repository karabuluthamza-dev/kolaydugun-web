-- Simple Demo Products for DJ34
-- Doğrudan INSERT - hata olmaz

-- Önce DJ34'ün shop_account_id'sini bul
-- Bu sorguyu çalıştır ve id'yi not al:
SELECT id, business_name, slug FROM shop_accounts WHERE slug = 'dj34';

-- Sonra bu INSERT'leri çalıştır (shop_id'yi yukarıdan aldığın değerle değiştir)
-- ÖRNEK: '12345678-1234-1234-1234-123456789abc' yerine gerçek id'yi yaz

/*
INSERT INTO shop_products (
    shop_account_id, 
    name_tr, name_de, name_en,
    description_tr, 
    price, currency, show_price, 
    images, status
) VALUES
(
    '12345678-1234-1234-1234-123456789abc', -- BU ID'Yİ DEĞİŞTİR!
    'Profesyonel Makyaj Seti', 'Professionelles Make-up-Set', 'Professional Makeup Set',
    'Düğün makyajı için profesyonel 24 parça makyaj seti.',
    299.99, 'EUR', true,
    ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
    'approved'
);
*/

-- VEYA tek satırda otomatik id ile:
INSERT INTO shop_products (shop_account_id, name_tr, description_tr, price, currency, show_price, images, status)
SELECT 
    id,
    'Profesyonel Makyaj Seti',
    'Düğün makyajı için profesyonel 24 parça makyaj seti. Uzun süre kalıcı formüller.',
    299.99, 'EUR', true,
    ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'],
    'approved'
FROM shop_accounts WHERE slug = 'dj34'
ON CONFLICT DO NOTHING;

INSERT INTO shop_products (shop_account_id, name_tr, description_tr, price, currency, show_price, images, status)
SELECT 
    id,
    'Gelin Makyajı Paketi',
    'Gelin + 2 Nedime makyajı dahil. Profesyonel ürünlerle.',
    450.00, 'EUR', true,
    ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'],
    'approved'
FROM shop_accounts WHERE slug = 'dj34'
ON CONFLICT DO NOTHING;

INSERT INTO shop_products (shop_account_id, name_tr, description_tr, price, currency, show_price, images, status)
SELECT 
    id,
    'Damat Hazırlık Paketi',
    'Damat için cilt bakımı, saç şekillendirme ve hafif makyaj.',
    150.00, 'EUR', true,
    ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
    'approved'
FROM shop_accounts WHERE slug = 'dj34'
ON CONFLICT DO NOTHING;

INSERT INTO shop_products (shop_account_id, name_tr, description_tr, price, currency, show_price, price_on_request, images, status)
SELECT 
    id,
    'VIP Düğün Paketi',
    'Gelin + Damat + 4 Nedime + Anne makyajı. Tüm gün destek.',
    0, 'EUR', false, true,
    ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'],
    'approved'
FROM shop_accounts WHERE slug = 'dj34'
ON CONFLICT DO NOTHING;

-- Kontrol - eklenen ürünleri gör
SELECT name_tr, price, status FROM shop_products 
WHERE shop_account_id = (SELECT id FROM shop_accounts WHERE slug = 'dj34');
