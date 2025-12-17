-- ============================================
-- SHOP MARKETPLACE - DEMO VERİLERİ
-- Tarih: 2025-12-13
-- ============================================

-- Demo Mağaza Hesapları
INSERT INTO shop_accounts (
    email, business_name, slug,
    description_tr, description_de, description_en,
    contact_whatsapp, contact_phone, contact_email, website_url,
    plan, product_limit, is_active, is_verified,
    affiliate_code, plan_started_at, plan_expires_at
) VALUES 
(
    'gelinlik@demo.com',
    'Prenses Gelinlik',
    'prenses-gelinlik',
    'Almanya''nın en seçkin gelinlik koleksiyonları. 20 yıllık deneyimimizle hayalinizdeki gelinliği bulmanıza yardımcı oluyoruz.',
    'Die exklusivsten Brautkleidkollektionen Deutschlands. Mit 20 Jahren Erfahrung helfen wir Ihnen, Ihr Traumkleid zu finden.',
    'Germany''s most exclusive bridal gown collections. With 20 years of experience, we help you find your dream dress.',
    '+49 176 1234567',
    '+49 89 1234567',
    'info@prenses-gelinlik.de',
    'https://www.prenses-gelinlik.de',
    'premium',
    -1,
    true,
    true,
    'PRNS2024',
    NOW(),
    NOW() + INTERVAL '1 year'
),
(
    'taki@demo.com',
    'Altın Düğün Takıları',
    'altin-dugun-takilari',
    'Özel tasarım düğün takıları ve mücevherler. 22 ayar altın ve pırlanta koleksiyonlarımızla gelin damat setleri.',
    'Maßgeschneiderter Hochzeitsschmuck und Juwelen. Braut- und Bräutigamsets mit unseren 22-Karat-Gold- und Diamantkollektionen.',
    'Custom designed wedding jewelry and jewels. Bride and groom sets with our 22 karat gold and diamond collections.',
    '+49 170 9876543',
    '+49 211 9876543',
    'info@altin-taki.de',
    NULL,
    'business',
    20,
    true,
    false,
    'ALTN2024',
    NOW(),
    NOW() + INTERVAL '1 year'
),
(
    'dekor@demo.com',
    'Romantik Dekorasyon',
    'romantik-dekorasyon',
    'Düğün dekorasyonu ve organizasyon malzemeleri. Masa süsleri, çiçek aranjmanları ve aydınlatma çözümleri.',
    'Hochzeitsdekoration und Veranstaltungsmaterialien. Tischdekorationen, Blumenarrangements und Beleuchtungslösungen.',
    'Wedding decoration and event supplies. Table decorations, flower arrangements and lighting solutions.',
    '+49 151 5555555',
    '+49 30 5555555',
    'info@romantik-deko.de',
    'https://www.romantik-deko.de',
    'business',
    20,
    true,
    true,
    'RMTK2024',
    NOW(),
    NOW() + INTERVAL '6 months'
),
(
    'nikah@demo.com',
    'Tatlı Nikah Şekerleri',
    'tatli-nikah-sekerleri',
    'El yapımı nikah şekerleri ve düğün hediyeleri. Kişiselleştirilmiş ambalaj seçenekleri ile.',
    'Handgemachte Hochzeitsmandeln und Hochzeitsgeschenke. Mit personalisierten Verpackungsoptionen.',
    'Handmade wedding favors and wedding gifts. With personalized packaging options.',
    '+49 172 3333333',
    NULL,
    'info@tatli-nikah.de',
    NULL,
    'starter',
    5,
    true,
    false,
    'TTLN2024',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'damat@demo.com',
    'Elegant Damatlık',
    'elegant-damatlik',
    'Özel dikim damatlıklar ve düğün takımları. İtalyan kumaşlarla premium kalite.',
    'Maßgeschneiderte Anzüge und Hochzeitsanzüge. Premium-Qualität mit italienischen Stoffen.',
    'Custom tailored groom suits and wedding suits. Premium quality with Italian fabrics.',
    '+49 162 7777777',
    '+49 40 7777777',
    'info@elegant-damatlik.de',
    'https://www.elegant-damatlik.de',
    'premium',
    -1,
    true,
    true,
    'ELGT2024',
    NOW(),
    NOW() + INTERVAL '1 year'
)
ON CONFLICT (email) DO NOTHING;

-- Demo Ürünler
INSERT INTO shop_products (
    shop_account_id,
    category_id,
    name_tr, name_de, name_en,
    description_tr, description_de, description_en,
    price, currency, status, view_count
)
SELECT 
    sa.id,
    sc.id,
    t.product_name_tr, t.product_name_de, t.product_name_en,
    t.desc_tr, t.desc_de, t.desc_en,
    t.price, 'EUR', 'approved', t.view_count
FROM (VALUES
    -- Prenses Gelinlik ürünleri
    ('prenses-gelinlik', 'gelinlikler', 
     'A-Line İnci Gelinlik', 'A-Linie Perlen Brautkleid', 'A-Line Pearl Wedding Dress',
     'Zarif A-line kesim, el işlemeli inci detayları ile romantik bir gelinlik.', 
     'Elegantes A-Linien-Schnitt Brautkleid mit handgestickten Perlendetails.',
     'Elegant A-line cut wedding dress with hand-embroidered pearl details.',
     2499, 156),
    ('prenses-gelinlik', 'gelinlikler', 
     'Prenses Model Kabarık Gelinlik', 'Prinzessin Ballkleid', 'Princess Ball Gown',
     'Tüllü etekli, kristal taşlarla süslenmiş prenses model gelinlik.',
     'Prinzessinnen-Ballkleid mit Tüllrock und Kristallverzierungen.',
     'Princess ball gown with tulle skirt and crystal embellishments.',
     3299, 234),
    ('prenses-gelinlik', 'gelinlikler', 
     'Vintage Dantel Gelinlik', 'Vintage Spitzenkleid', 'Vintage Lace Dress',
     'Fransız danteli, uzun kollu vintage tarz gelinlik.',
     'Französische Spitze, langärmliges Vintage-Brautkleid.',
     'French lace, long-sleeved vintage style wedding dress.',
     2899, 189),
    
    -- Altın Takı ürünleri
    ('altin-dugun-takilari', 'taki', 
     '22 Ayar Altın Düğün Seti', '22 Karat Gold Hochzeitsset', '22 Karat Gold Wedding Set',
     'Gelin takı seti: Kolye, bilezik, küpe ve yüzük. Toplam 85 gram 22 ayar altın.',
     'Brautschmuck-Set: Kette, Armband, Ohrringe und Ring. Insgesamt 85 Gramm 22 Karat Gold.',
     'Bridal jewelry set: Necklace, bracelet, earrings and ring. Total 85 grams 22 karat gold.',
     8500, 312),
    ('altin-dugun-takilari', 'taki', 
     'Pırlanta Nişan Yüzüğü', 'Diamant Verlobungsring', 'Diamond Engagement Ring',
     '0.5 karat pırlanta, 18 ayar beyaz altın üzerine.',
     '0,5 Karat Diamant auf 18 Karat Weißgold.',
     '0.5 carat diamond on 18 karat white gold.',
     3200, 445),
    
    -- Romantik Dekorasyon ürünleri
    ('romantik-dekorasyon', 'masa-susu', 
     'Gül Temalı Masa Süsü Seti', 'Rosenthema Tischdeko-Set', 'Rose Theme Table Decor Set',
     '10 kişilik masa için: Yapay güller, mumlar, runner ve peçete halkaları.',
     'Für 10-Personen-Tisch: Kunstblumenrosen, Kerzen, Tischläufer und Serviettenringe.',
     'For 10-person table: Artificial roses, candles, runner and napkin rings.',
     189, 98),
    ('romantik-dekorasyon', 'cicek-balon', 
     'Düğün Balonu Paketi (100 Adet)', 'Hochzeitsballon-Paket (100 Stück)', 'Wedding Balloon Package (100 Pcs)',
     'Metalik pembe, beyaz ve altın balonlar. Helyum ile şişirilmeye hazır.',
     'Metallic rosa, weiß und goldene Ballons. Fertig zum Aufblasen mit Helium.',
     'Metallic pink, white and gold balloons. Ready to inflate with helium.',
     79, 167),
    
    -- Nikah Şekerleri ürünleri
    ('tatli-nikah-sekerleri', 'nikah-sekeri', 
     'Lüks Badem Şekeri (50 Adet)', 'Luxus-Mandeln (50 Stück)', 'Luxury Almonds (50 Pcs)',
     'İtalyan bademleri, özel ambalajda. İsim ve tarih baskılı.',
     'Italienische Mandeln in Spezialverpackung. Mit Namen und Datum bedruckt.',
     'Italian almonds in special packaging. Printed with name and date.',
     125, 89),
    
    -- Elegant Damatlık ürünleri
    ('elegant-damatlik', 'damatliklar', 
     'Klasik Slim Fit Damatlık', 'Klassischer Slim Fit Anzug', 'Classic Slim Fit Suit',
     'İtalyan yün kumaş, slim fit kesim. Papyon ve mendil hediye.',
     'Italienischer Wollstoff, Slim-Fit-Schnitt. Fliege und Einstecktuch als Geschenk.',
     'Italian wool fabric, slim fit cut. Bow tie and pocket square as gift.',
     1299, 278),
    ('elegant-damatlik', 'damatliklar', 
     'Lacivert Smokin', 'Marineblauer Smoking', 'Navy Blue Tuxedo',
     'Saten yaka detaylı lacivert smokin. Gömlek ve papyon dahil.',
     'Marineblaues Smoking mit Satin-Revers. Hemd und Fliege inklusive.',
     'Navy blue tuxedo with satin lapel detail. Shirt and bow tie included.',
     1899, 201)
) AS t(shop_slug, category_slug, product_name_tr, product_name_de, product_name_en, desc_tr, desc_de, desc_en, price, view_count)
JOIN shop_accounts sa ON sa.slug = t.shop_slug
JOIN shop_categories sc ON sc.slug = t.category_slug
ON CONFLICT DO NOTHING;

-- Affiliate tıklama demoları
INSERT INTO shop_affiliate_clicks (affiliate_code, shop_account_id, page_url, created_at)
SELECT 
    sa.affiliate_code, 
    sa.id, 
    '/magaza-basvuru?ref=' || sa.affiliate_code,
    NOW() - (random() * INTERVAL '30 days')
FROM shop_accounts sa
CROSS JOIN generate_series(1, 5);

-- Demo affiliate earnings (birkaç başarılı referans)
INSERT INTO shop_affiliate_earnings (shop_account_id, source_shop_id, amount, percentage_used, source_amount, earning_type, status)
SELECT 
    referrer.id,
    referred.id,
    3.90,
    10,
    39,
    'first_month',
    'pending'
FROM shop_accounts referrer
CROSS JOIN shop_accounts referred
WHERE referrer.slug = 'prenses-gelinlik' AND referred.slug IN ('altin-dugun-takilari', 'romantik-dekorasyon')
LIMIT 2;

SELECT 
    '✅ Demo verileri eklendi!' as mesaj,
    (SELECT COUNT(*) FROM shop_accounts) as magaza_sayisi,
    (SELECT COUNT(*) FROM shop_products) as urun_sayisi,
    (SELECT COUNT(*) FROM shop_categories) as kategori_sayisi;
