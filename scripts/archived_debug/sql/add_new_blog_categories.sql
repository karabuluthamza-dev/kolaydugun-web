-- Add new blog categories with translations
INSERT INTO blog_categories (name, slug)
VALUES 
    (
        '{"tr": "Balayı Rehberi", "en": "Honeymoon Guide", "de": "Flitterwochen-Guide"}', 
        'honeymoon-guide'
    ),
    (
        '{"tr": "Güzellik ve Bakım", "en": "Beauty & Care", "de": "Schönheit & Pflege"}', 
        'beauty-care'
    ),
    (
        '{"tr": "Düğün Fotoğrafları", "en": "Wedding Photography", "de": "Hochzeitsfotografie"}', 
        'wedding-photography'
    ),
    (
        '{"tr": "Müzik ve Eğlence", "en": "Music & Entertainment", "de": "Musik & Unterhaltung"}', 
        'music-entertainment'
    )
ON CONFLICT (slug) DO NOTHING;
