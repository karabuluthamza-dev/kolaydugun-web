-- ============================================
-- Expand Blog Categories
-- Adds 4 new categories approved by user
-- ============================================

INSERT INTO blog_categories (slug, name, description, sort_order) VALUES
('balayi-rehberi', 
 '{"tr": "Balayı Rehberi", "en": "Honeymoon Guide", "de": "Flitterwochen-Guide"}',
 '{"tr": "En romantik balayı destinasyonları ve ipuçları", "en": "Most romantic honeymoon destinations and tips", "de": "Die romantischsten Flitterwochenziele und Tipps"}',
 9),

('guzellik-bakim',
 '{"tr": "Güzellik ve Bakım", "en": "Beauty & Care", "de": "Schönheit & Pflege"}',
 '{"tr": "Gelin saçı, makyajı ve bakım önerileri", "en": "Bridal hair, makeup and care tips", "de": "Brautfrisur, Make-up und Pflegetipps"}',
 10),

('dugun-fotograflari',
 '{"tr": "Düğün Fotoğrafları", "en": "Wedding Photography", "de": "Hochzeitsfotografie"}',
 '{"tr": "Düğün fotoğrafları için poz önerileri ve fikirler", "en": "Pose suggestions and ideas for wedding photos", "de": "Posing-Vorschläge und Ideen für Hochzeitsfotos"}',
 11),

('muzik-eglence',
 '{"tr": "Müzik ve Eğlence", "en": "Music & Entertainment", "de": "Musik & Unterhaltung"}',
 '{"tr": "Düğün müzikleri, çalma listeleri ve eğlence", "en": "Wedding music, playlists and entertainment", "de": "Hochzeitsmusik, Playlists und Unterhaltung"}',
 12)
ON CONFLICT (slug) DO NOTHING;

-- Log the result
SELECT name, slug FROM blog_categories WHERE slug IN ('balayi-rehberi', 'guzellik-bakim', 'dugun-fotograflari', 'muzik-eglence');
