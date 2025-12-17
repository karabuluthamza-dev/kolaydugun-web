-- Demo Products for DJ34 Shop
-- DJ34 mağazası için örnek ürünler

-- Önce DJ34 shop_account_id'sini bul
DO $$
DECLARE
    shop_id UUID;
    cat_id UUID;
BEGIN
    -- DJ34 shop ID'sini al
    SELECT id INTO shop_id FROM shop_accounts WHERE slug = 'dj34' LIMIT 1;
    
    IF shop_id IS NULL THEN
        RAISE NOTICE 'DJ34 shop not found!';
        RETURN;
    END IF;

    -- İlk kategoriyi al (veya random bir tane)
    SELECT id INTO cat_id FROM shop_categories WHERE is_active = true LIMIT 1;

    -- Demo ürünler ekle
    INSERT INTO shop_products (
        shop_account_id, category_id, 
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, currency, show_price, price_on_request,
        images, status, display_order
    ) VALUES
    (
        shop_id, cat_id,
        'Profesyonel Makyaj Seti', 'Professionelles Make-up-Set', 'Professional Makeup Set',
        'Düğün makyajı için profesyonel 24 parça makyaj seti. Uzun süre kalıcı formüller.', 
        'Professionelles 24-teiliges Make-up-Set für Hochzeits-Make-up. Langanhaltende Formeln.',
        'Professional 24-piece makeup set for wedding makeup. Long-lasting formulas.',
        299.99, 'EUR', true, false,
        ARRAY['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'],
        'approved', 1
    ),
    (
        shop_id, cat_id,
        'Gelin Makyajı Paketi', 'Braut-Make-up-Paket', 'Bridal Makeup Package',
        'Gelin + 2 Nedime makyajı dahil. Profesyonel ürünlerle, evinizde veya salonda.', 
        'Braut + 2 Brautjungfern Make-up inklusive. Mit professionellen Produkten, bei Ihnen zu Hause oder im Salon.',
        'Bride + 2 Bridesmaids makeup included. With professional products, at your home or salon.',
        450.00, 'EUR', true, false,
        ARRAY['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800'],
        'approved', 2
    ),
    (
        shop_id, cat_id,
        'Damat Hazırlık Paketi', 'Bräutigam-Vorbereitungspaket', 'Groom Preparation Package',
        'Damat için cilt bakımı, saç şekillendirme ve hafif makyaj. Profesyonel görünüm garantisi.', 
        'Hautpflege, Haarstyling und leichtes Make-up für den Bräutigam. Professionelles Aussehen garantiert.',
        'Skin care, hair styling and light makeup for the groom. Professional look guaranteed.',
        150.00, 'EUR', true, false,
        ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
        'approved', 3
    ),
    (
        shop_id, cat_id,
        'Kına Gecesi Makyajı', 'Henna-Nacht-Make-up', 'Henna Night Makeup',
        'Geleneksel kına gecesi için özel makyaj. Glitter ve parlak tonlarla şık görünüm.', 
        'Spezielles Make-up für die traditionelle Henna-Nacht. Eleganter Look mit Glitzer und glänzenden Tönen.',
        'Special makeup for traditional henna night. Elegant look with glitter and shiny tones.',
        180.00, 'EUR', true, false,
        ARRAY['https://images.unsplash.com/photo-1560577799-d9b78b62f8f4?w=800', 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800'],
        'approved', 4
    ),
    (
        shop_id, cat_id,
        'VIP Düğün Paketi', 'VIP-Hochzeitspaket', 'VIP Wedding Package',
        'Gelin + Damat + 4 Nedime + Anne makyajı. Tüm gün destek. Premium ürünler.', 
        'Braut + Bräutigam + 4 Brautjungfern + Mutter Make-up. Ganztägige Unterstützung. Premium-Produkte.',
        'Bride + Groom + 4 Bridesmaids + Mother makeup. All day support. Premium products.',
        0, 'EUR', false, true,
        ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
        'approved', 5
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo products added for DJ34!';
END $$;

-- Kontrol
SELECT 
    p.name_tr, 
    p.price, 
    p.status,
    s.business_name as shop
FROM shop_products p
JOIN shop_accounts s ON p.shop_account_id = s.id
WHERE s.slug = 'dj34';
