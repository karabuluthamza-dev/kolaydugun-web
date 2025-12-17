-- Shop Categories - show_on_homepage alanı ekleme
-- 8 kategori, 6'sı ana sayfada görünecek

-- 1. show_on_homepage alanını ekle
ALTER TABLE shop_categories 
ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT false;

-- 2. tagline alanlarını ekle (duygusal kısa metinler için)
ALTER TABLE shop_categories 
ADD COLUMN IF NOT EXISTS tagline_tr TEXT;
ALTER TABLE shop_categories 
ADD COLUMN IF NOT EXISTS tagline_de TEXT;
ALTER TABLE shop_categories 
ADD COLUMN IF NOT EXISTS tagline_en TEXT;

-- 3. Mevcut kategorileri temizle (demo veriler)
DELETE FROM shop_categories;

-- 4. 8 Kategori Ekle (görsel URL'leriyle)
INSERT INTO shop_categories (slug, icon, name_tr, name_de, name_en, tagline_tr, tagline_de, tagline_en, image_url, display_order, is_active, show_on_homepage) VALUES
('gelin-aksesuarlari', '👑', 'Gelin Aksesuarları', 'Brautaccessoires', 'Bridal Accessories', 'Zarif dokunuşlar', 'Elegante Akzente', 'Elegant touches', '/images/shop/bridal-accessories.png', 1, true, true),
('davetiyeler', '💌', 'Davetiyeler', 'Einladungen', 'Invitations', 'İlk izlenim', 'Der erste Eindruck', 'First impression', '/images/shop/invitations.png', 2, true, true),
('masa-susleri', '🕯️', 'Masa Süsleri', 'Tischdekoration', 'Table Decor', 'Detaylarda gizli', 'Im Detail verborgen', 'Hidden in details', '/images/shop/table-decor.png', 3, true, true),
('cicek-buket', '💐', 'Çiçek & Buket', 'Blumen & Strauß', 'Flowers & Bouquet', 'Doğanın zarafeti', 'Natürliche Eleganz', 'Nature''s elegance', '/images/shop/flowers-bouquet.png', 4, true, true),
('nikah-sekeri', '🎁', 'Nikah Şekeri', 'Gastgeschenke', 'Wedding Favors', 'Tatlı anılar', 'Süße Erinnerungen', 'Sweet memories', '/images/shop/wedding-favors.png', 5, true, true),
('dugun-dekoru', '✨', 'Düğün Dekoru', 'Hochzeitsdeko', 'Wedding Decor', 'Mekanınızı süsleyin', 'Dekorieren Sie Ihren Raum', 'Decorate your venue', '/images/shop/wedding-decor.png', 6, true, true),
('takilar', '💎', 'Takılar', 'Schmuck', 'Jewelry', 'Işıltılı anlar', 'Glanzvolle Momente', 'Sparkling moments', '/images/shop/jewelry.png', 7, true, false),
('damat-aksesuarlari', '🤵', 'Damat Aksesuarları', 'Bräutigam-Accessoires', 'Groom Accessories', 'Şık detaylar', 'Stilvolle Details', 'Stylish details', '/images/shop/groom-accessories.png', 8, true, false);

-- 5. Index ekle
CREATE INDEX IF NOT EXISTS idx_shop_categories_homepage ON shop_categories(show_on_homepage) WHERE show_on_homepage = true;
