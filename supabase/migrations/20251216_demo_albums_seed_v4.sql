-- Demo Shop Data Seeding v4 (SAFE INSERT - NO DELETE)
-- Target Shop Slug: 'wedding-essentials-demo-mj7uva80'

DO $$
DECLARE
    demo_shop_id UUID;
    album_tik_id UUID;
    album_out_id UUID;
    album_decor_id UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- 1. Find the Demo Shop ID
    ---------------------------------------------------------------------------
    SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug = 'wedding-essentials-demo-mj7uva80' LIMIT 1;
    
    -- Fallback: Approximate match
    IF demo_shop_id IS NULL THEN
        SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug LIKE 'wedding-essentials-demo%' LIMIT 1;
    END IF;
    
    IF demo_shop_id IS NOT NULL THEN
        RAISE NOTICE 'Found Shop ID: %', demo_shop_id;

        -----------------------------------------------------------------------
        -- 2. Ensure Albums Exist (Get ID if exists, Create if not)
        -----------------------------------------------------------------------
        
        -- TikTok Album
        SELECT id INTO album_tik_id FROM shop_gallery_albums WHERE shop_id = demo_shop_id AND name_tr = 'TikTok Trendleri' LIMIT 1;
        IF album_tik_id IS NULL THEN
            INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
            VALUES (demo_shop_id, 'TikTok Trendleri', 'TikTok Trends', 'TikTok Trends', '🎵', 1)
            RETURNING id INTO album_tik_id;
        END IF;

        -- Outdoor Album
        SELECT id INTO album_out_id FROM shop_gallery_albums WHERE shop_id = demo_shop_id AND name_tr = 'Dış Çekim Hikayesi' LIMIT 1;
        IF album_out_id IS NULL THEN
             INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
            VALUES (demo_shop_id, 'Dış Çekim Hikayesi', 'Outdoor Geschichten', 'Outdoor Stories', '🌲', 2)
            RETURNING id INTO album_out_id;
        END IF;

        -- Decor Album
        SELECT id INTO album_decor_id FROM shop_gallery_albums WHERE shop_id = demo_shop_id AND name_tr = 'Düğün Detayları' LIMIT 1;
        IF album_decor_id IS NULL THEN
            INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
            VALUES (demo_shop_id, 'Düğün Detayları', 'Hochzeitsdetails', 'Wedding Details', '💍', 3)
            RETURNING id INTO album_decor_id;
        END IF;

        -----------------------------------------------------------------------
        -- 3. Insert Content (Safe - check if empty first to avoid duplicates if re-run)
        -----------------------------------------------------------------------
        
        -- TikToks (Only insert if album is empty)
        IF (SELECT count(*) FROM shop_gallery WHERE album_id = album_tik_id) = 0 THEN
            INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
            (demo_shop_id, 'video', 'https://www.tiktok.com/@kyla.kaiii/video/7147306878001941806', 'Gelin Dönüşümü', 'Braut Transformation', 'Bride Transformation', album_tik_id),
            (demo_shop_id, 'video', 'https://www.tiktok.com/@wedding/video/7294567890123456789', 'İlk Dansımız', 'Unser erster Tanz', 'Our First Dance', album_tik_id),
            (demo_shop_id, 'video', 'https://www.tiktok.com/@wedding/video/7291234567890123456', 'Save The Date', 'Save The Date', 'Save The Date', album_tik_id);
        END IF;

        -- Outdoor (Only insert if album is empty)
        IF (SELECT count(*) FROM shop_gallery WHERE album_id = album_out_id) = 0 THEN
             INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
            (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', 'Doğada Aşk', 'Liebe in der Natur', 'Love in Nature', album_out_id),
            (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'Gün Batımı', 'Sonnenuntergang', 'Sunset', album_out_id),
            (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'Orman Konsepti', 'Waldkonzept', 'Forest Concept', album_out_id);
        END IF;

        -- Decor (Only insert if album is empty)
        IF (SELECT count(*) FROM shop_gallery WHERE album_id = album_decor_id) = 0 THEN
            INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id) VALUES
            (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800', 'Yüzükler', 'Ringe', 'Rings', album_decor_id),
            (demo_shop_id, 'image', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', 'Gelin Çiçeği', 'Brautstrauß', 'Bouquet', album_decor_id);
        END IF;

        RAISE NOTICE 'SUCCESS: V4 Data Check/Insert Complete!';
    ELSE
        RAISE NOTICE 'ERROR: Demo shop not found!';
    END IF;
END $$;
