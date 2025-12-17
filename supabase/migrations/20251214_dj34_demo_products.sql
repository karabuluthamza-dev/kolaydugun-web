-- =====================================================
-- DJ34 DEMO ÜRÜNLER - CUSTOM KATEGORİLERE BAĞLI
-- =====================================================
-- DJ34 mağazasına her custom kategori için 2-3 demo ürün ekler

-- DJ34'ün shop_account_id'sini bul (slug = 'dj34')
DO $$
DECLARE
    v_shop_id UUID;
    v_cat_dj_ekip UUID;
    v_cat_isik UUID;
    v_cat_ses UUID;
BEGIN
    -- Shop ID'yi bul (tam slug)
    SELECT id INTO v_shop_id FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';
    
    IF v_shop_id IS NULL THEN
        RAISE NOTICE 'DJ34 shop bulunamadı!';
        RETURN;
    END IF;
    
    -- Custom category ID'lerini bul
    SELECT id INTO v_cat_dj_ekip FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%DJ%Ekipman%';
    
    SELECT id INTO v_cat_isik FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%Işık%';
    
    SELECT id INTO v_cat_ses FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%Ses%';
    
    -- =====================================================
    -- DJ EKİPMANLARI KATEGORİSİ
    -- =====================================================
    IF v_cat_dj_ekip IS NOT NULL THEN
        INSERT INTO shop_products (
            shop_account_id, custom_category_id, 
            name_tr, name_de, name_en,
            description_tr, description_de, description_en,
            price, currency, images, status
        ) VALUES
        (
            v_shop_id, v_cat_dj_ekip,
            'Pioneer DJ CDJ-3000', 'Pioneer DJ CDJ-3000', 'Pioneer DJ CDJ-3000',
            'Profesyonel DJ için en son teknoloji CDJ. 9 inç dokunmatik ekran, Rekordbox desteği.',
            'Neueste Technologie CDJ für professionelle DJs. 9-Zoll-Touchscreen, Rekordbox-Unterstützung.',
            'Latest technology CDJ for professional DJs. 9-inch touchscreen, Rekordbox support.',
            2499, 'EUR', 
            '["https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_dj_ekip,
            'Pioneer DJM-900NXS2 Mixer', 'Pioneer DJM-900NXS2 Mixer', 'Pioneer DJM-900NXS2 Mixer',
            '4 kanallı profesyonel DJ mikser. Yüksek ses kalitesi ve gelişmiş efekt seçenekleri.',
            '4-Kanal professioneller DJ-Mixer. Hohe Klangqualität und erweiterte Effektoptionen.',
            '4-channel professional DJ mixer. High sound quality and advanced effect options.',
            1899, 'EUR',
            '["https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_dj_ekip,
            'Pioneer DDJ-1000 Controller', 'Pioneer DDJ-1000 Controller', 'Pioneer DDJ-1000 Controller',
            'Rekordbox DJ için profesyonel 4 kanallı DJ controller. Giriş seviye profesyoneller için ideal.',
            'Professioneller 4-Kanal DJ-Controller für Rekordbox DJ. Ideal für Einsteiger.',
            'Professional 4-channel DJ controller for Rekordbox DJ. Ideal for entry-level professionals.',
            1249, 'EUR',
            '["https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800"]'::jsonb,
            'approved'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'DJ Ekipmanları kategorisine 3 ürün eklendi.';
    END IF;
    
    -- =====================================================
    -- SAHNE IŞIKLARI KATEGORİSİ
    -- =====================================================
    IF v_cat_isik IS NOT NULL THEN
        INSERT INTO shop_products (
            shop_account_id, custom_category_id, 
            name_tr, name_de, name_en,
            description_tr, description_de, description_en,
            price, currency, images, status
        ) VALUES
        (
            v_shop_id, v_cat_isik,
            'Moving Head LED Spot 250W', 'Moving Head LED Spot 250W', 'Moving Head LED Spot 250W',
            'Profesyonel sahne aydınlatması. 250W LED, 8 renk + beyaz, gobo efektleri.',
            'Professionelle Bühnenbeleuchtung. 250W LED, 8 Farben + weiß, Gobo-Effekte.',
            'Professional stage lighting. 250W LED, 8 colors + white, gobo effects.',
            649, 'EUR',
            '["https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_isik,
            'LED Par Can RGB 36x3W Set (4 Adet)', 'LED Par Can RGB 36x3W Set (4 Stück)', 'LED Par Can RGB 36x3W Set (4 Pieces)',
            '4 adet LED par can seti. RGB renk karışımı, DMX kontrol, düğün ve etkinlikler için.',
            '4-teiliges LED Par Can Set. RGB-Farbmischung, DMX-Steuerung, für Hochzeiten und Events.',
            '4-piece LED par can set. RGB color mixing, DMX control, for weddings and events.',
            349, 'EUR',
            '["https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_isik,
            'Lazer Işık Sistemi RGB 5W', 'Laser Lichtsystem RGB 5W', 'Laser Light System RGB 5W',
            '5W RGB lazer sistemi. ILDA kontrol, animasyon kapasiteli, büyük etkinlikler için.',
            '5W RGB Lasersystem. ILDA-Steuerung, animationsfähig, für große Veranstaltungen.',
            '5W RGB laser system. ILDA control, animation capable, for large events.',
            1299, 'EUR',
            '["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"]'::jsonb,
            'approved'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sahne Işıkları kategorisine 3 ürün eklendi.';
    END IF;
    
    -- =====================================================
    -- SES SİSTEMLERİ KATEGORİSİ
    -- =====================================================
    IF v_cat_ses IS NOT NULL THEN
        INSERT INTO shop_products (
            shop_account_id, custom_category_id, 
            name_tr, name_de, name_en,
            description_tr, description_de, description_en,
            price, currency, images, status
        ) VALUES
        (
            v_shop_id, v_cat_ses,
            'JBL EON715 Aktif Hoparlör (Çift)', 'JBL EON715 Aktivlautsprecher (Paar)', 'JBL EON715 Active Speaker (Pair)',
            '15 inç aktif hoparlör çifti. 1300W, Bluetooth, DSP kontrol. Düğün ve etkinlikler için ideal.',
            '15-Zoll Aktivlautsprecher-Paar. 1300W, Bluetooth, DSP-Steuerung. Ideal für Hochzeiten.',
            '15-inch active speaker pair. 1300W, Bluetooth, DSP control. Ideal for weddings and events.',
            1599, 'EUR',
            '["https://images.unsplash.com/photo-1558471067-1d55b8b3b7c8?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_ses,
            'QSC K12.2 Aktif Hoparlör (Çift)', 'QSC K12.2 Aktivlautsprecher (Paar)', 'QSC K12.2 Active Speaker (Pair)',
            '12 inç aktif hoparlör çifti. 2000W, profesyonel kalite, hafif ve taşınabilir.',
            '12-Zoll Aktivlautsprecher-Paar. 2000W, professionelle Qualität, leicht und tragbar.',
            '12-inch active speaker pair. 2000W, professional quality, lightweight and portable.',
            1899, 'EUR',
            '["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"]'::jsonb,
            'approved'
        ),
        (
            v_shop_id, v_cat_ses,
            '18" Subwoofer Aktif 1200W', '18" Subwoofer Aktiv 1200W', '18" Active Subwoofer 1200W',
            '18 inç aktif subwoofer. 1200W, derin bas performansı, düğünler için güçlü alt frekans.',
            '18-Zoll aktiver Subwoofer. 1200W, tiefe Bassleistung, kraftvolle Tieffrequenz für Hochzeiten.',
            '18-inch active subwoofer. 1200W, deep bass performance, powerful low frequency for weddings.',
            899, 'EUR',
            '["https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800"]'::jsonb,
            'approved'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Ses Sistemleri kategorisine 3 ürün eklendi.';
    END IF;
    
    RAISE NOTICE 'Demo ürünler başarıyla eklendi!';
END $$;
