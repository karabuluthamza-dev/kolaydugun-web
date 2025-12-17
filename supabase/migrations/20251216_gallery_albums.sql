-- Gallery Album System Migration
-- Adds album organization for shop gallery

-- 1. Create gallery albums table
CREATE TABLE IF NOT EXISTS shop_gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    name_tr TEXT NOT NULL,
    name_de TEXT,
    name_en TEXT,
    icon TEXT DEFAULT '📁',
    cover_image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add album_id to shop_gallery table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'shop_gallery' AND column_name = 'album_id'
    ) THEN
        ALTER TABLE shop_gallery ADD COLUMN album_id UUID REFERENCES shop_gallery_albums(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_albums_shop ON shop_gallery_albums(shop_id);
CREATE INDEX IF NOT EXISTS idx_gallery_album ON shop_gallery(album_id);

-- 4. RLS Policies
ALTER TABLE shop_gallery_albums ENABLE ROW LEVEL SECURITY;

-- Public can view active albums
CREATE POLICY "shop_gallery_albums_public_read" ON shop_gallery_albums
    FOR SELECT USING (is_active = true);

-- Shop owners can manage their albums
CREATE POLICY "shop_gallery_albums_owner_all" ON shop_gallery_albums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts sa
            WHERE sa.id = shop_gallery_albums.shop_id
            AND sa.user_id = auth.uid()
        )
    );

-- Admin full access
CREATE POLICY "shop_gallery_albums_admin_all" ON shop_gallery_albums
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 5. Demo data for Wedding Essentials
DO $$
DECLARE
    demo_shop_id UUID;
    album_video_id UUID;
    album_decor_id UUID;
BEGIN
    SELECT id INTO demo_shop_id FROM shop_accounts WHERE slug = 'wedding-essentials-demo' LIMIT 1;
    
    IF demo_shop_id IS NOT NULL THEN
        -- Create demo albums
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Videolarımız', 'Unsere Videos', 'Our Videos', '🎥', 1)
        RETURNING id INTO album_video_id;
        
        INSERT INTO shop_gallery_albums (shop_id, name_tr, name_de, name_en, icon, sort_order)
        VALUES (demo_shop_id, 'Dekorasyon', 'Dekoration', 'Decoration', '🎨', 2)
        RETURNING id INTO album_decor_id;
        
        -- Update existing gallery items with album assignments
        UPDATE shop_gallery SET album_id = album_video_id 
        WHERE shop_id = demo_shop_id AND type = 'video';
        
        UPDATE shop_gallery SET album_id = album_decor_id 
        WHERE shop_id = demo_shop_id AND type = 'image';
        
        RAISE NOTICE 'Demo albums created successfully!';
    END IF;
END $$;
