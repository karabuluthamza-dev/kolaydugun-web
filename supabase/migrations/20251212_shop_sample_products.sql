-- Shop Module Sample Data
-- Premium products with images

-- Update categories with images
UPDATE shop_categories SET image_url = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800' WHERE slug = 'gelinlik-aksesuarlari';
UPDATE shop_categories SET image_url = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800' WHERE slug = 'dugun-dekorasyonu';
UPDATE shop_categories SET image_url = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800' WHERE slug = 'davetiyeler';
UPDATE shop_categories SET image_url = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800' WHERE slug = 'hediyeler';

-- Insert sample products
INSERT INTO shop_products (slug, category_id, title, description, image_url, price, currency, product_type, status, display_order)
VALUES 
-- Gelinlik Aksesuarları
('kristal-gelin-taci', 
 (SELECT id FROM shop_categories WHERE slug = 'gelinlik-aksesuarlari'),
 '{"tr": "Kristal Gelin Tacı", "de": "Kristall Brautkrone", "en": "Crystal Bridal Tiara"}',
 '{"tr": "El yapımı, Swarovski kristalleri ile süslenmiş zarif gelin tacı.", "de": "Handgefertigte elegante Brautkrone mit Swarovski-Kristallen.", "en": "Handmade elegant bridal tiara adorned with Swarovski crystals."}',
 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
 189.99, 'EUR', 'boutique', 'approved', 1),

('inci-sac-tokasi',
 (SELECT id FROM shop_categories WHERE slug = 'gelinlik-aksesuarlari'),
 '{"tr": "İnci Saç Tokası Seti", "de": "Perlenhaarspangen-Set", "en": "Pearl Hair Clip Set"}',
 '{"tr": "6 parça tatlı su incisi saç tokası, her saç tipine uygun.", "de": "6-teiliges Süßwasserperlen-Haarspangen-Set, für jeden Haartyp geeignet.", "en": "6-piece freshwater pearl hair clip set, suitable for every hair type."}',
 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800',
 79.99, 'EUR', 'boutique', 'approved', 2),

('dantel-pecce',
 (SELECT id FROM shop_categories WHERE slug = 'gelinlik-aksesuarlari'),
 '{"tr": "Dantel Gelin Peçesi", "de": "Spitzen-Brautschleier", "en": "Lace Bridal Veil"}',
 '{"tr": "Fransız danteli ile el işi yapılmış, 3 metre uzunluğunda gelin peçesi.", "de": "Handgefertigter Brautschleier aus französischer Spitze, 3 Meter lang.", "en": "Handmade bridal veil with French lace, 3 meters long."}',
 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800',
 249.99, 'EUR', 'boutique', 'approved', 3),

-- Düğün Dekorasyonu
('gold-mumluk-set',
 (SELECT id FROM shop_categories WHERE slug = 'dugun-dekorasyonu'),
 '{"tr": "Altın Mumluk Seti", "de": "Goldenes Kerzenhalter-Set", "en": "Gold Candle Holder Set"}',
 '{"tr": "3 parça altın kaplama kristal mumluk seti, masa süslemesi için ideal.", "de": "3-teiliges vergoldetes Kristall-Kerzenhalter-Set, ideal für Tischdekoration.", "en": "3-piece gold plated crystal candle holder set, ideal for table decoration."}',
 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
 129.99, 'EUR', 'boutique', 'approved', 1),

('cicek-kemer',
 (SELECT id FROM shop_categories WHERE slug = 'dugun-dekorasyonu'),
 '{"tr": "Yapay Çiçek Kemeri", "de": "Künstlicher Blumenbogen", "en": "Artificial Flower Arch"}',
 '{"tr": "Düğün töreni için yapay gül ve şakayık ile süslenmiş dekoratif kemer.", "de": "Dekorativer Bogen mit künstlichen Rosen und Pfingstrosen für die Hochzeitszeremonie.", "en": "Decorative arch adorned with artificial roses and peonies for wedding ceremony."}',
 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
 349.99, 'EUR', 'boutique', 'approved', 2),

('ipek-masa-runner',
 (SELECT id FROM shop_categories WHERE slug = 'dugun-dekorasyonu'),
 '{"tr": "İpek Masa Runner Seti", "de": "Seiden-Tischläufer-Set", "en": "Silk Table Runner Set"}',
 '{"tr": "10 adet fildişi rengi ipek masa runner, şık sofra düzenlemesi için.", "de": "10 Stück elfenbeinfarbene Seiden-Tischläufer für elegante Tischdekoration.", "en": "10 pieces ivory silk table runners for elegant table settings."}',
 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
 89.99, 'EUR', 'boutique', 'approved', 3),

-- Davetiyeler
('luks-davetiye-seti',
 (SELECT id FROM shop_categories WHERE slug = 'davetiyeler'),
 '{"tr": "Lüks Lazerli Davetiye", "de": "Luxus-Lasergeschnittene Einladung", "en": "Luxury Laser Cut Invitation"}',
 '{"tr": "Lazer kesim tekniği ile hazırlanmış, kadife kutulu özel davetiye.", "de": "Mit Laserschnitttechnik hergestellt, Spezialeinladung in Samtbox.", "en": "Prepared with laser cutting technique, special invitation in velvet box."}',
 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
 8.99, 'EUR', 'boutique', 'approved', 1),

('akrilik-davetiye',
 (SELECT id FROM shop_categories WHERE slug = 'davetiyeler'),
 '{"tr": "Akrilik Düğün Davetiyesi", "de": "Acryl-Hochzeitseinladung", "en": "Acrylic Wedding Invitation"}',
 '{"tr": "Şeffaf akrilik üzerine altın yazı, modern ve şık davetiye.", "de": "Goldschrift auf transparentem Acryl, moderne und elegante Einladung.", "en": "Gold writing on transparent acrylic, modern and elegant invitation."}',
 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800',
 12.99, 'EUR', 'boutique', 'approved', 2),

-- Hediyeler
('kisisel-kupa-seti',
 (SELECT id FROM shop_categories WHERE slug = 'hediyeler'),
 '{"tr": "Kişiye Özel Kupa Seti", "de": "Personalisiertes Tassen-Set", "en": "Personalized Mug Set"}',
 '{"tr": "Gelin ve damat için özel tasarım seramik kupa seti.", "de": "Speziell entworfenes Keramik-Tassen-Set für Braut und Bräutigam.", "en": "Specially designed ceramic mug set for bride and groom."}',
 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
 34.99, 'EUR', 'boutique', 'approved', 1),

('nikah-sekeri-kutusu',
 (SELECT id FROM shop_categories WHERE slug = 'hediyeler'),
 '{"tr": "Premium Nikah Şekeri Kutusu", "de": "Premium-Hochzeitsmandel-Box", "en": "Premium Wedding Favor Box"}',
 '{"tr": "50 adet altın detaylı nikah şekeri kutusu, kişiselleştirme dahil.", "de": "50 Stück Hochzeitsmandel-Boxen mit Golddetails, Personalisierung inklusive.", "en": "50 pieces wedding favor boxes with gold details, personalization included."}',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
 79.99, 'EUR', 'boutique', 'approved', 2),

('misafir-defteri',
 (SELECT id FROM shop_categories WHERE slug = 'hediyeler'),
 '{"tr": "Deri Misafir Defteri", "de": "Leder-Gästebuch", "en": "Leather Guest Book"}',
 '{"tr": "El yapımı gerçek deri misafir defteri, altın kabartma isim seçeneği ile.", "de": "Handgefertigtes echtes Leder-Gästebuch mit goldener Namensprägung.", "en": "Handmade genuine leather guest book with gold embossed name option."}',
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
 59.99, 'EUR', 'boutique', 'approved', 3)

ON CONFLICT (slug) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  title = EXCLUDED.title,
  description = EXCLUDED.description;
