-- =====================================================
-- DJ34 DEMO ÜRÜNLER - BASİT VERSİYON
-- =====================================================
-- Kategori bağımlılığı olmadan direkt product ekleme

DO $$
DECLARE
    v_shop_id UUID;
BEGIN
    -- Shop ID'yi bul
    SELECT id INTO v_shop_id FROM shop_accounts 
    WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';
    
    IF v_shop_id IS NULL THEN
        RAISE NOTICE 'DJ34 shop bulunamadı!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Shop ID bulundu: %', v_shop_id;
    
    -- Önce mevcut ürünleri sil
    DELETE FROM shop_products WHERE shop_account_id = v_shop_id;
    RAISE NOTICE 'Mevcut ürünler silindi';
    
    -- Basit ürünler ekle (kategori olmadan)
    INSERT INTO shop_products (
        shop_account_id, 
        name_tr, name_de, name_en,
        description_tr,
        price, currency, 
        images, 
        status
    ) VALUES
    (
        v_shop_id,
        'Pioneer DJ CDJ-3000', 'Pioneer DJ CDJ-3000', 'Pioneer DJ CDJ-3000',
        'Profesyonel DJ için en son teknoloji CDJ.',
        2499, 'EUR', 
        '["https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800"]'::jsonb,
        'approved'
    ),
    (
        v_shop_id,
        'Pioneer DJM-900NXS2 Mixer', 'Pioneer DJM-900NXS2 Mixer', 'Pioneer DJM-900NXS2 Mixer',
        '4 kanallı profesyonel DJ mikser.',
        1899, 'EUR',
        '["https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800"]'::jsonb,
        'approved'
    ),
    (
        v_shop_id,
        'Moving Head LED Spot 250W', 'Moving Head LED Spot 250W', 'Moving Head LED Spot 250W',
        'Profesyonel sahne aydınlatması.',
        649, 'EUR',
        '["https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800"]'::jsonb,
        'approved'
    ),
    (
        v_shop_id,
        'JBL EON715 Aktif Hoparlör', 'JBL EON715 Aktivlautsprecher', 'JBL EON715 Active Speaker',
        '15 inç aktif hoparlör.',
        1599, 'EUR',
        '["https://images.unsplash.com/photo-1558471067-1d55b8b3b7c8?w=800"]'::jsonb,
        'approved'
    );
    
    RAISE NOTICE '4 ürün eklendi!';
END $$;

-- Sonucu kontrol et
SELECT id, name_tr, price, status FROM shop_products 
WHERE shop_account_id = (SELECT id FROM shop_accounts WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf');
