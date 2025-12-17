-- =====================================================
-- DJ34 DEMO ÜRÜNLER - DOĞRU SHOP_ACCOUNT_ID İLE
-- =====================================================

-- DJ34 shop_account_id: ce430a02-356f-4212-98fd-35d91bd17bf1

-- Önce mevcut DJ34 kategorilerinin ID'lerini al
DO $$
DECLARE
    v_shop_id UUID := 'ce430a02-356f-4212-98fd-35d91bd17bf1';
    v_dj_cat_id UUID;
    v_isik_cat_id UUID;
    v_ses_cat_id UUID;
BEGIN
    -- Kategori ID'lerini al
    SELECT id INTO v_dj_cat_id FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr ILIKE '%DJ%' LIMIT 1;
    
    SELECT id INTO v_isik_cat_id FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr ILIKE '%Işık%' LIMIT 1;
    
    SELECT id INTO v_ses_cat_id FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr ILIKE '%Ses%' LIMIT 1;

    -- Ürünleri ekle
    -- 1. Pioneer DJ CDJ-3000
    INSERT INTO shop_products (
        shop_account_id,
        custom_category_id,
        name_tr, name_de, name_en,
        description_tr,
        price, currency, show_price,
        images, status
    ) VALUES (
        v_shop_id,
        v_dj_cat_id,
        'Pioneer DJ CDJ-3000',
        'Pioneer DJ CDJ-3000',
        'Pioneer DJ CDJ-3000',
        'Profesyonel DJ performansları için en üst düzey multiplayer. 9 inç dokunmatik ekran, gelişmiş beatgrid analizi.',
        2499, 'EUR', true,
        '["https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800"]',
        'approved'
    );

    -- 2. Pioneer DJM-900NXS2 Mixer
    INSERT INTO shop_products (
        shop_account_id,
        custom_category_id,
        name_tr, name_de, name_en,
        description_tr,
        price, currency, show_price,
        images, status
    ) VALUES (
        v_shop_id,
        v_dj_cat_id,
        'Pioneer DJM-900NXS2 Mixer',
        'Pioneer DJM-900NXS2 Mixer',
        'Pioneer DJM-900NXS2 Mixer',
        '4 kanallı profesyonel DJ mixer. 64-bit mixing, yüksek kalite ses işleme.',
        1899, 'EUR', true,
        '["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"]',
        'approved'
    );

    -- 3. Moving Head LED Spot 250W
    INSERT INTO shop_products (
        shop_account_id,
        custom_category_id,
        name_tr, name_de, name_en,
        description_tr,
        price, currency, show_price,
        images, status
    ) VALUES (
        v_shop_id,
        v_isik_cat_id,
        'Moving Head LED Spot 250W',
        'Moving Head LED Spot 250W',
        'Moving Head LED Spot 250W',
        'Profesyonel sahne aydınlatması. 250W LED, gobo ve renk çarkı, DMX512 kontrol.',
        649, 'EUR', true,
        '["https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800"]',
        'approved'
    );

    -- 4. JBL EON715 Aktif Hoparlör
    INSERT INTO shop_products (
        shop_account_id,
        custom_category_id,
        name_tr, name_de, name_en,
        description_tr,
        price, currency, show_price,
        images, status
    ) VALUES (
        v_shop_id,
        v_ses_cat_id,
        'JBL EON715 Aktif Hoparlör',
        'JBL EON715 Aktiver Lautsprecher',
        'JBL EON715 Active Speaker',
        '15 inç aktif hoparlör, 1300W güç, Bluetooth bağlantı, DSP kontrol.',
        1599, 'EUR', true,
        '["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"]',
        'approved'
    );

    RAISE NOTICE '✅ 4 DJ34 ürünü başarıyla eklendi!';
END $$;

-- Sonucu kontrol et
SELECT id, name_tr, shop_account_id, status 
FROM shop_products 
WHERE shop_account_id = 'ce430a02-356f-4212-98fd-35d91bd17bf1';
