-- Wedding Essentials Demo Content
-- Demo products for christie4163@comfythings.com shop
-- Creates beautiful showcase products for marketing purposes

DO $$
DECLARE
    target_shop_id UUID;
    cat_id_digital UUID;
    cat_id_decor UUID;
    cat_id_bridal UUID;
    cat_id_guest UUID;
BEGIN
    -- Find the shop account by email
    SELECT id INTO target_shop_id 
    FROM shop_accounts 
    WHERE email = 'christie4163@comfythings.com';
    
    IF target_shop_id IS NULL THEN
        RAISE EXCEPTION 'Shop account not found for email: christie4163@comfythings.com';
    END IF;

    RAISE NOTICE 'Found shop account: %', target_shop_id;

    -- ============================================
    -- CREATE CUSTOM CATEGORIES
    -- ============================================
    DELETE FROM shop_custom_categories WHERE shop_id = target_shop_id;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (target_shop_id, 'Dijital Davetiyeler', 'Digitale Einladungen', 'Digital Invitations', '💌', 1)
    RETURNING id INTO cat_id_digital;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (target_shop_id, 'Masa Süsleri', 'Tischdekoration', 'Table Decor', '🌸', 2)
    RETURNING id INTO cat_id_decor;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (target_shop_id, 'Gelin Aksesuarları', 'Brautaccessoires', 'Bridal Accessories', '👰', 3)
    RETURNING id INTO cat_id_bridal;

    INSERT INTO shop_custom_categories (shop_id, name_tr, name_de, name_en, icon, sort_order)
    VALUES (target_shop_id, 'Misafir Hediyeleri', 'Gastgeschenke', 'Guest Favors', '🎁', 4)
    RETURNING id INTO cat_id_guest;

    -- ============================================
    -- CREATE DEMO PRODUCTS
    -- ============================================
    DELETE FROM shop_products WHERE shop_account_id = target_shop_id;

    -- ============ DIGITAL INVITATIONS ============
    
    -- Product 1: Premium Invitation Pack
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_digital,
        'Premium Düğün Davetiyesi Koleksiyonu', 
        'Premium Hochzeitseinladungs-Kollektion', 
        'Premium Wedding Invitation Collection',
        '25 adet benzersiz düğün davetiyesi tasarımı. Canva ile tamamen düzenlenebilir. Hem dijital hem baskı formatları dahil. Modern, minimalist ve rustik seçenekler mevcut.',
        '25 einzigartige Hochzeitseinladungsdesigns. Vollständig bearbeitbar mit Canva. Digitale und druckfertige Formate enthalten. Moderne, minimalistische und rustikale Optionen verfügbar.',
        '25 unique wedding invitation designs. Fully editable with Canva. Both digital and print formats included. Modern, minimalist, and rustic options available.',
        39.99, 
        ARRAY[
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
        ],
        'digital', 'approved', true, 999, NOW() - interval '15 days'
    );

    -- Product 2: Save the Date Templates
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_digital,
        'Save the Date Şablonları (15 Adet)', 
        'Save the Date Vorlagen (15 Stück)', 
        'Save the Date Templates (15 Pack)',
        'Düğün tarihini duyurmak için zarif şablonlar. Instagram story ve post boyutları dahil. Anında indirme!',
        'Elegante Vorlagen zur Ankündigung des Hochzeitstermins. Instagram Story- und Post-Größen enthalten. Sofortiger Download!',
        'Elegant templates to announce your wedding date. Instagram story and post sizes included. Instant download!',
        24.99, 
        ARRAY['https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800'],
        'digital', 'approved', true, 999, NOW() - interval '12 days'
    );

    -- Product 3: Wedding Menu & Program
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_digital,
        'Düğün Menü & Program Seti', 
        'Hochzeitsmenü & Programm Set', 
        'Wedding Menu & Program Set',
        'Profesyonel menü kartları ve düğün programı tasarımları. A4 ve A5 boyutlarında. Kolay düzenleme.',
        'Professionelle Menükarten und Hochzeitsprogramm-Designs. A4- und A5-Größen. Einfache Bearbeitung.',
        'Professional menu cards and wedding program designs. A4 and A5 sizes. Easy editing.',
        19.99, 
        ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
        'digital', 'approved', true, 999, NOW() - interval '10 days'
    );

    -- ============ TABLE DECOR ============
    
    -- Product 4: Rustic Table Number Set
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_decor,
        'Rustik Ahşap Masa Numarası Seti (1-20)', 
        'Rustikales Holz-Tischnummern-Set (1-20)', 
        'Rustic Wooden Table Number Set (1-20)',
        'El yapımı ahşap masa numaraları. Doğal ahşap dokusu ve zarif yazı tipi. Her düğün temasına uygun.',
        'Handgefertigte Holz-Tischnummern. Natürliche Holzstruktur und elegante Schriftart. Passend zu jedem Hochzeitsthema.',
        'Handcrafted wooden table numbers. Natural wood texture and elegant font. Suitable for any wedding theme.',
        59.90, 
        ARRAY[
            'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
        ],
        'physical', 'approved', true, 30, NOW() - interval '20 days'
    );

    -- Product 5: Gold Candle Holders
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_decor,
        'Altın Mumluk Seti (6 Adet)', 
        'Goldenes Kerzenhalter-Set (6 Stück)', 
        'Gold Candle Holder Set (6 Pieces)',
        'Zarif altın kaplama mumluklar. Farklı yüksekliklerde şık tasarım. Romantik atmosfer için ideal.',
        'Elegante vergoldete Kerzenhalter. Stilvolles Design in verschiedenen Höhen. Ideal für romantische Atmosphäre.',
        'Elegant gold-plated candle holders. Stylish design in different heights. Perfect for romantic atmosphere.',
        79.90, 
        ARRAY['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800'],
        'physical', 'approved', true, 25, NOW() - interval '18 days'
    );

    -- Product 6: Floral Centerpiece Set
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_decor,
        'Yapay Çiçek Masa Aranjmanı', 
        'Künstliche Blumen Tischdekoration', 
        'Artificial Flower Table Arrangement',
        'Premium kalite yapay çiçeklerle hazırlanmış masa aranjmanı. Gerçekçi görünüm, uzun ömürlü kullanım.',
        'Tischarrangement aus hochwertigen Kunstblumen. Realistisches Aussehen, langlebige Nutzung.',
        'Table arrangement crafted with premium quality artificial flowers. Realistic look, long-lasting use.',
        45.00, 
        ARRAY['https://images.unsplash.com/photo-1561128290-005859e79fca?w=800'],
        'physical', 'approved', true, 40, NOW() - interval '14 days'
    );

    -- ============ BRIDAL ACCESSORIES ============
    
    -- Product 7: Pearl Hair Pins
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_bridal,
        'İnci Saç Tokası Seti (12 Adet)', 
        'Perlen-Haarnadel-Set (12 Stück)', 
        'Pearl Hair Pin Set (12 Pieces)',
        'Zarif inci ve kristal detaylı saç tokaları. Gelin saç modeline mükemmel uyum. Özel kutuda teslim.',
        'Elegante Haarnadeln mit Perlen- und Kristalldetails. Perfekte Ergänzung zur Brautfrisur. Lieferung in Geschenkbox.',
        'Elegant hair pins with pearl and crystal details. Perfect complement to bridal hairstyle. Delivered in gift box.',
        34.99, 
        ARRAY['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'],
        'physical', 'approved', true, 50, NOW() - interval '8 days'
    );

    -- Product 8: Bridal Sash
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_bridal,
        'Kristal İşlemeli Gelin Kuşağı', 
        'Kristallbesetzter Brautgürtel', 
        'Crystal Embellished Bridal Sash',
        'El işçiliği kristal ve boncuk detaylı gelin kuşağı. Saten kurdele ile bağlanır. Tüm beden ölçülerine uygun.',
        'Handgefertigter Brautgürtel mit Kristall- und Perlendetails. Mit Satinband zum Binden. Passt allen Größen.',
        'Handcrafted bridal sash with crystal and bead details. Ties with satin ribbon. Fits all sizes.',
        89.90, 
        ARRAY['https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800'],
        'physical', 'approved', true, 20, NOW() - interval '5 days'
    );

    -- Product 9: Veil Comb
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_bridal,
        'Vintage Duvak Tarağı', 
        'Vintage Schleier-Kamm', 
        'Vintage Veil Comb',
        'Antik gümüş görünümlü duvak tarağı. Romantik vintage tarzı arayanlar için ideal.',
        'Schleier-Kamm in antikem Silber-Look. Ideal für romantischen Vintage-Stil.',
        'Veil comb in antique silver look. Ideal for romantic vintage style.',
        29.99, 
        ARRAY['https://images.unsplash.com/photo-1522057384400-681b421cfebc?w=800'],
        'physical', 'approved', true, 35, NOW() - interval '7 days'
    );

    -- ============ GUEST FAVORS ============
    
    -- Product 10: Personalized Candles
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_guest,
        'Kişiselleştirilmiş Mini Mum (50 Adet)', 
        'Personalisierte Mini-Kerzen (50 Stück)', 
        'Personalized Mini Candles (50 Pieces)',
        'İsim ve tarih baskılı mini mumlar. Vanilya kokulu, organik soya mumu. Şık cam kavanozda.',
        'Mini-Kerzen mit Namen und Datum bedruckt. Vanille-Duft, organisches Sojawachs. In elegantem Glas.',
        'Mini candles printed with name and date. Vanilla scented, organic soy wax. In elegant glass jar.',
        149.00, 
        ARRAY['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'],
        'physical', 'approved', true, 15, NOW() - interval '3 days'
    );

    -- Product 11: Thank You Tags
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_guest,
        'Teşekkür Etiketi Seti (100 Adet)', 
        'Dankes-Etiketten-Set (100 Stück)', 
        'Thank You Tag Set (100 Pieces)',
        'Kişiselleştirilebilir teşekkür etiketleri. Premium kraft kağıt, jüt ip dahil. Rustic düğünler için mükemmel.',
        'Anpassbare Dankeskarten. Premium Kraftpapier, Juteschnur inklusive. Perfekt für rustikale Hochzeiten.',
        'Customizable thank you tags. Premium kraft paper, jute string included. Perfect for rustic weddings.',
        29.90, 
        ARRAY['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800'],
        'physical', 'approved', true, 60, NOW() - interval '6 days'
    );

    -- Product 12: Soap Favors
    INSERT INTO shop_products (
        shop_account_id, custom_category_id,
        name_tr, name_de, name_en,
        description_tr, description_de, description_en,
        price, images,
        product_type, status, is_active, stock_quantity, created_at
    ) VALUES (
        target_shop_id, cat_id_guest,
        'El Yapımı Sabun Hediyelik (30 Adet)', 
        'Handgemachte Seifen-Geschenke (30 Stück)', 
        'Handmade Soap Favors (30 Pieces)',
        'Doğal içerikli el yapımı sabunlar. Lavanta ve gül seçenekleri. Kişiselleştirilmiş ambalaj.',
        'Handgemachte Seifen aus natürlichen Zutaten. Lavendel- und Rosenoptionen. Personalisierte Verpackung.',
        'Handmade soaps with natural ingredients. Lavender and rose options. Personalized packaging.',
        89.00, 
        ARRAY['https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=800'],
        'physical', 'approved', true, 20, NOW() - interval '4 days'
    );

    RAISE NOTICE '✅ Wedding Essentials demo content created successfully!';
    RAISE NOTICE 'Shop ID: %', target_shop_id;
    RAISE NOTICE 'Categories: 4, Products: 12';
END $$;
