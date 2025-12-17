-- Demo Shop Data Seeding for New Gallery Features
-- Target Shop: 'wedding-essentials-demo'

DO $$
DECLARE
    demo_shop_id UUID;
    album_video_id UUID;
    album_outdoor_id UUID;
    album_story_id UUID;
BEGIN
    -- Get demo shop ID
    SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug = 'wedding-essentials-demo' LIMIT 1;
    
    IF demo_shop_id IS NOT NULL THEN
        -- 1. Create Albums
        -- Video Çekimleri
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Video Çekimleri', 'Videoproduktion', 'Video Production', '🎥', 1)
        RETURNING id INTO album_video_id;

        -- Dış Çekimler
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Dış Çekimler', 'Außenaufnahmen', 'Outdoor Shoots', '🌲', 2)
        RETURNING id INTO album_outdoor_id;

        -- Düğün Hikayesi
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Düğün Hikayesi', 'Hochzeitsgeschichte', 'Wedding Story', '💒', 3)
        RETURNING id INTO album_story_id;

        -- 2. Insert Gallery Items (Videos)
        -- TikTok Video
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id, sort_order)
        VALUES (
            demo_shop_id, 
            'video', 
            'https://www.tiktok.com/@wedding/video/1234567890', -- Placeholder URL, storefront handles embed format
            'TikTok Trendimiz', 'Unser TikTok Trend', 'Our TikTok Trend',
            album_video_id,
            1
        );

        -- Google Drive Video
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id, sort_order)
        VALUES (
            demo_shop_id, 
            'video', 
            'https://drive.google.com/file/d/1234567890abcdef/view',
            'Kına Gecesi Özeti', 'Henna Nacht Zusammenfassung', 'Henna Night Recap',
            album_video_id,
            2
        );

        -- 3. Assign existing images to albums (randomly/logic based)
        UPDATE shop_gallery 
        SET album_id = album_outdoor_id 
        WHERE shop_id = demo_shop_id AND type = 'image' AND sort_order % 2 = 0;

        UPDATE shop_gallery 
        SET album_id = album_story_id 
        WHERE shop_id = demo_shop_id AND type = 'image' AND album_id IS NULL;

        RAISE NOTICE 'Demo albums and items seeded successfully for %', demo_shop_id;
    END IF;
END $$;
