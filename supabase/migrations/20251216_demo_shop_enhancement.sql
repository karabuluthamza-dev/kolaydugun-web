-- Wedding Essentials Demo Shop Enhancement
-- Adds new storefront fields: slogan, about, how_we_work, experience_years, rating, gallery

DO $$
DECLARE
    demo_shop_id UUID;
BEGIN
    -- Find the demo shop
    SELECT id INTO demo_shop_id 
    FROM shop_accounts 
    WHERE slug = 'wedding-essentials-demo' OR slug LIKE '%wedding-essentials%' 
    LIMIT 1;
    
    IF demo_shop_id IS NULL THEN
        RAISE NOTICE 'Wedding Essentials demo shop not found!';
        RETURN;
    END IF;

    -- Update with new enhanced fields
    UPDATE shop_accounts SET
        -- Slogan (3 languages)
        slogan_tr = 'Hayalinizdeki düğün için el yapımı dekorasyon ve dijital çözümler',
        slogan_de = 'Handgemachte Dekoration und digitale Lösungen für Ihre Traumhochzeit',
        slogan_en = 'Handcrafted decoration and digital solutions for your dream wedding',
        
        -- About Us (3 languages)
        about_tr = 'Wedding Essentials olarak 8 yıldır çiftlere hayallerindeki düğünü yaratmalarında yardımcı oluyoruz. Özel tasarım davetiyelerimiz, el yapımı dekorasyon ürünlerimiz ve profesyonel danışmanlık hizmetlerimizle yüzlerce çifte mutlu anlar yaşattık.

Almanya''nın dört bir yanından müşterilerimize hizmet veriyoruz. Ürünlerimiz tamamen el yapımı ve özel siparişlere açıktır. Her düğün benzersizdir - biz de sizin hikayenizi özel kılmak için buradayız.',
        
        about_de = 'Als Wedding Essentials helfen wir seit 8 Jahren Paaren dabei, ihre Traumhochzeit zu gestalten. Mit unseren maßgeschneiderten Einladungen, handgefertigten Dekorationsartikeln und professioneller Beratung haben wir Hunderten von Paaren glückliche Momente beschert.

Wir bedienen Kunden aus ganz Deutschland. Unsere Produkte sind vollständig handgefertigt und für Sonderanfertigungen erhältlich. Jede Hochzeit ist einzigartig - wir sind hier, um Ihre Geschichte besonders zu machen.',
        
        about_en = 'At Wedding Essentials, we have been helping couples create their dream weddings for 8 years. With our custom-designed invitations, handcrafted decoration items, and professional consulting services, we have brought happy moments to hundreds of couples.

We serve customers from all over Germany. Our products are completely handmade and available for custom orders. Every wedding is unique - we are here to make your story special.',
        
        -- How We Work (3 languages)
        how_we_work_tr = '✨ **Sipariş Süreci**

1️⃣ Ürün Seçimi: Mağazamızdan beğendiğiniz ürünü seçin
2️⃣ Özelleştirme: İsim, tarih ve renk tercihlerinizi belirtin
3️⃣ Onay: Size özel tasarım taslağını onaylayın
4️⃣ Üretim: El yapımı ürününüz özenle hazırlanır
5️⃣ Teslimat: Güvenli paketleme ile kapınıza kadar gelir

💬 Sorularınız için WhatsApp üzerinden 7/24 ulaşabilirsiniz!',
        
        how_we_work_de = '✨ **Bestellprozess**

1️⃣ Produktauswahl: Wählen Sie Ihr Lieblingsprodukt aus unserem Shop
2️⃣ Anpassung: Geben Sie Ihre Präferenzen für Namen, Datum und Farben an
3️⃣ Genehmigung: Bestätigen Sie Ihren individuellen Designentwurf
4️⃣ Produktion: Ihr handgefertigtes Produkt wird sorgfältig vorbereitet
5️⃣ Lieferung: Sicherer Versand direkt zu Ihnen nach Hause

💬 Bei Fragen erreichen Sie uns 24/7 über WhatsApp!',
        
        how_we_work_en = '✨ **Order Process**

1️⃣ Product Selection: Choose your favorite item from our shop
2️⃣ Customization: Specify your name, date, and color preferences
3️⃣ Approval: Approve your custom design draft
4️⃣ Production: Your handcrafted product is carefully prepared
5️⃣ Delivery: Secure packaging delivered to your doorstep

💬 For questions, reach us 24/7 via WhatsApp!',
        
        -- Experience & Rating
        experience_years = 8,
        rating = 4.9,
        
        -- Service Regions
        service_regions = '["Deutschland", "Österreich", "Schweiz"]'::jsonb,
        
        -- Cancellation Policy (3 languages)
        cancellation_policy_tr = 'Dijital ürünler iade edilemez. Fiziksel ürünlerde 14 gün içinde iade kabul edilir (kullanılmamış ve orijinal ambalajında). Özel sipariş ürünlerde iade yoktur.',
        cancellation_policy_de = 'Digitale Produkte sind nicht erstattungsfähig. Physische Produkte können innerhalb von 14 Tagen zurückgegeben werden (unbenutzt und in Originalverpackung). Maßanfertigungen sind vom Umtausch ausgeschlossen.',
        cancellation_policy_en = 'Digital products are non-refundable. Physical products can be returned within 14 days (unused and in original packaging). Custom order items cannot be returned.'
        
    WHERE id = demo_shop_id;

    -- Add Gallery Items
    DELETE FROM shop_gallery WHERE shop_id = demo_shop_id;
    
    -- Gallery Item 1: Wedding Table Setup
    INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, sort_order)
    VALUES (
        demo_shop_id, 'image',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'Düğün Masası Süslemesi',
        'Hochzeitstafel-Dekoration',
        'Wedding Table Setup',
        1
    );
    
    -- Gallery Item 2: Invitation Cards
    INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, sort_order)
    VALUES (
        demo_shop_id, 'image',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        'Davetiye Koleksiyonumuz',
        'Unsere Einladungskollektion',
        'Our Invitation Collection',
        2
    );
    
    -- Gallery Item 3: Candles & Decor
    INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, sort_order)
    VALUES (
        demo_shop_id, 'image',
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
        'Vintage Şamdan ve Mumlar',
        'Vintage Kerzenständer',
        'Vintage Candles & Holders',
        3
    );
    
    -- Gallery Item 4: Rustic Setup
    INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, sort_order)
    VALUES (
        demo_shop_id, 'image',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
        'Rustik Düğün Dekorasyonu',
        'Rustikale Hochzeitsdekoration',
        'Rustic Wedding Decor',
        4
    );
    
    -- Gallery Item 5: Workshop Video (YouTube Example)
    INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, sort_order)
    VALUES (
        demo_shop_id, 'video',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'Atölyemizden Görüntüler',
        'Einblicke in unsere Werkstatt',
        'Behind the Scenes at Our Workshop',
        5
    );

    RAISE NOTICE 'Wedding Essentials demo shop enhanced with slogan, about, how_we_work, gallery!';
END $$;
