-- Demo Shop Data Seeding v3 (RESET & ENRICH)
-- Target Shop Slug: 'wedding-essentials-demo-mj7uva80'

DO $$
DECLARE
    demo_shop_id UUID;
    album_tik_id UUID;
    album_out_id UUID;
    album_story_id UUID;
    album_decor_id UUID;
BEGIN
    -- 1. Find Demo Shop ID
    SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug = 'wedding-essentials-demo-mj7uva80' LIMIT 1;
    
    -- Fallback
    IF demo_shop_id IS NULL THEN
        SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug LIKE 'wedding-essentials-demo%' LIMIT 1;
    END IF;
    
    IF demo_shop_id IS NOT NULL THEN
        RAISE NOTICE 'Found Demo Shop ID: %, Cleaning up old data...', demo_shop_id;

        -- 2. RESET DATA (Delete existing gallery items and albums for this shop)
        DELETE FROM shop_gallery WHERE shop_id = demo_shop_id;
        DELETE FROM shop_gallery_albums WHERE shop_id = demo_shop_id;

        -- 3. Create Albums (Rich Categories)
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'TikTok Trendleri', 'TikTok Trends', 'TikTok Trends', '🎵', 1)
        RETURNING id INTO album_tik_id;

        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Dış Çekim Hikayesi', 'Outdoor Geschichten', 'Outdoor Stories', '🌲', 2)
        RETURNING id INTO album_out_id;

        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Düğün Detayları', 'Hochzeitsdetails', 'Wedding Details', '💍', 3)
        RETURNING id INTO album_decor_id;

        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Mutlu Çiftler', 'Glückliche Paare', 'Happy Couples', '💒', 4)
        RETURNING id INTO album_story_id;

        -- 4. Insert Content
        
        -- album_tik_id (TikToks)
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
        (demo_shop_id, 'video', 'https://www.tiktok.com/@kyla.kaiii/video/7147306878001941806', 'Gelin Dönüşümü', 'Braut Transformation', 'Bride Transformation', album_tik_id),
        (demo_shop_id, 'video', 'https://www.tiktok.com/@wedding/video/7294567890123456789', 'İlk Dansımız', 'VUnser erster Tanz', 'Our First Dance', album_tik_id),
        (demo_shop_id, 'video', 'https://www.tiktok.com/@wedding/video/7291234567890123456', 'Save The Date', 'Save The Date', 'Save The Date', album_tik_id);

        -- album_out_id (Outdoor Photos - Unsplash)
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', 'Doğada Aşk', 'Liebe in der Natur', 'Love in Nature', album_out_id),
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'Gün Batımı', 'Sonnenuntergang', 'Sunset', album_out_id),
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'Orman Konsepti', 'Waldkonzept', 'Forest Concept', album_out_id);

        -- album_decor_id (Details)
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800', 'Yüzükler', 'Ringe', 'Rings', album_decor_id),
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', 'Masa Düzeni', 'Tischordnung', 'Table Setting', album_decor_id),
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', 'Gelin Çiçeği', 'Brautstrauß', 'Bouquet', album_decor_id);
        
         -- album_story_id (Happy Couples - Mix)
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
        (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800', 'Mutluluk', 'Glück', 'Happiness', album_story_id),
        (demo_shop_id, 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Düğün Klibimiz (Örnek)', 'Hochzeitsclip', 'Wedding Clip', album_story_id);

        RAISE NOTICE 'SUCCESS: Demo Gallery RE-SEEDED completely!';
    ELSE
        RAISE NOTICE 'ERROR: Demo shop not found!';
    END IF;
END $$;
