-- Demo Shop Showcase Migration
-- REWRITTEN to match exact schema
-- 1. Updates shop_products constraints (product_type)
-- 2. Uses correct columns: custom_category_id (not category_slug), images (array), status (approved)

DO $$
DECLARE
    demo_shop_id UUID;
    cat_id_digital UUID;
    cat_id_decor UUID;
    cat_id_service UUID;
BEGIN
    -- 0. Fix Constraints (Safe block)
    BEGIN
        ALTER TABLE shop_products DROP CONSTRAINT IF EXISTS shop_products_product_type_check;
        ALTER TABLE shop_products ADD CONSTRAINT shop_products_product_type_check 
            CHECK (product_type IN ('amazon', 'boutique', 'digital', 'physical', 'service'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint update warning: %', SQLERRM;
    END;

    -- 1. Create/Update Shop Account
    INSERT INTO shop_accounts (
        business_name,
        slug,
        email,
        description_tr, description_de, description_en,
        logo_url, banner_url,
        is_active, plan,
        created_at
    ) VALUES (
        'Wedding Essentials Demo',
        'wedding-essentials-demo',
        'demo@kolaydugun.de',
        'Düğün hazırlıklarınız için her şey!',
        'Alles für Ihre Hochzeitsplanung!',
        'Everything for your wedding planning!',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
        true,
        'premium',
        NOW()
    ) ON CONFLICT (slug) DO UPDATE
        SET business_name = EXCLUDED.business_name -- Retrieve ID
    RETURNING id INTO demo_shop_id;

    -- 2. Update Shop Stats (Fake Credibility)
    UPDATE shop_accounts SET
        total_products = 6,
        total_sales = 47,
        rating_average = 4.9,
        review_count = 12
    WHERE id = demo_shop_id;

    -- 3. Create Custom Categories
    DELETE FROM shop_custom_categories WHERE shop_id = demo_shop_id;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (demo_shop_id, 'Dijital Ürünler', 'Digitale Produkte', 'Digital Products', '📄', 1)
    RETURNING id INTO cat_id_digital;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (demo_shop_id, 'Dekorasyon', 'Dekoration', 'Decor', '🎨', 2)
    RETURNING id INTO cat_id_decor;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (demo_shop_id, 'Hizmetler', 'Dienstleistungen', 'Services', '💼', 3)
    RETURNING id INTO cat_id_service;

    -- 4. Create Products (Corrected Columns)
    DELETE FROM shop_products WHERE shop_account_id = demo_shop_id;

    -- Product 1: Digital
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images, -- ARRAY
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_digital,
        'Premium Düğün Davetiyesi Template Paketi', 'Premium Hochzeitseinladungs-Vorlagenpaket', 'Premium Wedding Invitation Pack',
        '20 farklı davetiye tasarımı. Tamamen düzenlenebilir.', '20 verschiedene Einladungsdesigns. Vollständig anpassbar.', '20 different invitation designs. Fully editable.',
        29.99, ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'],
        'digital', 'approved', true, 999, NOW()
    );

    -- Product 2: Decor
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_decor,
        'Rustik Ahşap Masa İsimliği Seti (10 Adet)', 'Rustikales Holz-Tischkarten-Set (10 Stück)', 'Rustic Wooden Table Name Holder Set',
        'El yapımı ahşap masa isimliği.', 'Handgefertigte Holz-Tischkartenhalter.', 'Handmade wooden table name holders.',
        45.00, ARRAY['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'],
        'physical', 'approved', true, 50, NOW()
    );

    -- Product 3: Digital Tool
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_digital,
        'Düğün Bütçe Planlayıcı Excel', 'Hochzeitsbudget-Planer Excel', 'Wedding Budget Planner Excel',
        'Kapsamlı Excel bütçe planlayıcı.', 'Umfassender Excel-Budgetplaner.', 'Comprehensive Excel budget planner.',
        19.99, ARRAY['https://images.unsplash.com/photo-1554224311-beee4ece8c2d?w=800'],
        'digital', 'approved', true, 999, NOW()
    );

    -- Product 4: Decor
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_decor,
        'Vintage Şamdan Masa Süsü', 'Vintage Kerzenständer', 'Vintage Candelabra',
        'Altın renkli vintage şamdan.', 'Goldener Vintage-Kerzenständer.', 'Gold vintage candelabra.',
        89.90, ARRAY['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800'],
        'physical', 'approved', true, 25, NOW()
    );

    -- Product 5: Service
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_service,
        'Düğün Danışmanlığı (1 Saat)', 'Hochzeitsberatung (1 Stunde)', 'Wedding Consultation (1 Hour)',
        '1 saatlik online danışmanlık.', '1-stündige Online-Beratung.', '1-hour online consultation.',
        99.00, ARRAY['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800'],
        'service', 'approved', true, 10, NOW()
    );

    -- Product 6: Digital Presets
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        demo_shop_id, cat_id_digital,
        'Lightroom Preset Paketi', 'Lightroom Preset-Paket', 'Lightroom Preset Pack',
        '15 profesyonel preset.', '15 professionelle Presets.', '15 professional presets.',
        24.99, ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
        'digital', 'approved', true, 999, NOW()
    );

    RAISE NOTICE 'Demo shop updated successfully with 6 types of products.';
END $$;
