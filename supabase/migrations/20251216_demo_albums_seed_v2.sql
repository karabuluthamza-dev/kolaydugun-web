-- Demo Shop Data Seeding (CORRECTED SLUG)
-- Target Shop Slug: 'wedding-essentials-demo-mj7uva80'

DO $$
DECLARE
    demo_shop_id UUID;
    album_video_id UUID;
    album_outdoor_id UUID;
    album_story_id UUID;
BEGIN
    -- Get demo shop ID using the CORRECT slug from URL
    SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug = 'wedding-essentials-demo-mj7uva80' LIMIT 1;
    
    -- Fallback: Try identifying by approximate slug if exact match fails
    IF demo_shop_id IS NULL THEN
        SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug LIKE 'wedding-essentials-demo%' LIMIT 1;
    END IF;
    
    IF demo_shop_id IS NOT NULL THEN
        RAISE NOTICE 'Found Demo Shop ID: %', demo_shop_id;

        -- 1. Create Albums
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Video Çekimleri', 'Videoproduktion', 'Video Production', '🎥', 1)
        RETURNING id INTO album_video_id;

        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Dış Çekimler', 'Außenaufnahmen', 'Outdoor Shoots', '🌲', 2)
        RETURNING id INTO album_outdoor_id;

        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Düğün Hikayesi', 'Hochzeitsgeschichte', 'Wedding Story', '💒', 3)
        RETURNING id INTO album_story_id;

        -- 2. Insert TikTok Video
        INSERT INTO shop_gallery (shop_id, type, url, title_tr, title_de, title_en, album_id, sort_order)
        VALUES (
            demo_shop_id, 
            'video', 
            'https://www.tiktok.com/@wedding/video/7294567890123456789',
            'TikTok Trendimiz', 'Unser TikTok Trend', 'Our TikTok Trend',
            album_video_id,
            1
        );

        -- 3. Assign existing items to albums
        -- Update images to Outdoor
        UPDATE shop_gallery 
        SET album_id = album_outdoor_id 
        WHERE shop_id = demo_shop_id AND type = 'image' AND sort_order % 2 = 0;

        -- Update images to Story
        UPDATE shop_gallery 
        SET album_id = album_story_id 
        WHERE shop_id = demo_shop_id AND type = 'image' AND album_id IS NULL; -- fixed to use album_id IS NULL

        RAISE NOTICE 'SUCCESS: Albums created and items assigned for shop %', demo_shop_id;
    ELSE
        RAISE NOTICE 'ERROR: Demo shop not found with slug wedding-essentials-demo-mj7uva80';
    END IF;
END $$;
