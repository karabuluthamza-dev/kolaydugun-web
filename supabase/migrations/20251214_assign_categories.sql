-- =====================================================
-- DJ34 ÜRÜNLERE KATEGORİ ATAMA
-- =====================================================
-- Mevcut ürünlere custom kategorileri atar

DO $$
DECLARE
    v_shop_id UUID;
    v_cat_dj UUID;
    v_cat_isik UUID;
    v_cat_ses UUID;
BEGIN
    -- Shop ID'yi bul
    SELECT id INTO v_shop_id FROM shop_accounts 
    WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf';
    
    IF v_shop_id IS NULL THEN
        RAISE NOTICE 'DJ34 shop bulunamadı!';
        RETURN;
    END IF;
    
    -- Kategorileri bul
    SELECT id INTO v_cat_dj FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%DJ%' LIMIT 1;
    
    SELECT id INTO v_cat_isik FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%Işık%' LIMIT 1;
    
    SELECT id INTO v_cat_ses FROM shop_custom_categories 
    WHERE shop_id = v_shop_id AND name_tr LIKE '%Ses%' LIMIT 1;
    
    RAISE NOTICE 'Kategoriler: DJ=%, Işık=%, Ses=%', v_cat_dj, v_cat_isik, v_cat_ses;
    
    -- Pioneer CDJ ve Mixer -> DJ Ekipmanları
    UPDATE shop_products 
    SET custom_category_id = v_cat_dj
    WHERE shop_account_id = v_shop_id 
    AND (name_tr ILIKE '%Pioneer%' OR name_tr ILIKE '%CDJ%' OR name_tr ILIKE '%Mixer%');
    
    -- Moving Head -> Sahne Işıkları
    UPDATE shop_products 
    SET custom_category_id = v_cat_isik
    WHERE shop_account_id = v_shop_id 
    AND name_tr ILIKE '%LED%';
    
    -- JBL -> Ses Sistemleri
    UPDATE shop_products 
    SET custom_category_id = v_cat_ses
    WHERE shop_account_id = v_shop_id 
    AND name_tr ILIKE '%JBL%';
    
    RAISE NOTICE 'Kategoriler atandı!';
END $$;

-- Sonucu kontrol et
SELECT 
    p.name_tr as urun, 
    c.name_tr as kategori,
    c.icon
FROM shop_products p
LEFT JOIN shop_custom_categories c ON p.custom_category_id = c.id
WHERE p.shop_account_id = (
    SELECT id FROM shop_accounts 
    WHERE slug = 'dj34-istanbul-wedding-events-mj4uxnsf'
);
