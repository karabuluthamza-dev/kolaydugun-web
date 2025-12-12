
-- Add is_featured column to posts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_featured') THEN
        ALTER TABLE posts ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add view_count column to posts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'view_count') THEN
        ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add blog_showcase_mode to site_settings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'blog_showcase_mode') THEN
        ALTER TABLE site_settings ADD COLUMN blog_showcase_mode TEXT DEFAULT 'latest'; -- 'latest', 'featured', 'popular'
    END IF;
END $$;

-- Add blog_showcase_title to site_settings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'blog_showcase_title') THEN
        ALTER TABLE site_settings ADD COLUMN blog_showcase_title JSONB DEFAULT '{"tr": "Popüler Blog Yazıları", "en": "Popular Blog Posts", "de": "Beliebte Blogbeiträge"}';
    END IF;
END $$;

-- Ensure RLS policies allow reading these new fields (generally public read is enabled for site_settings and posts, but good to double check implicity)
-- Actually, we rely on existing policies. If admin can edit posts, they can edit new columns usually unless restricted by column-level privileges (unlikely here).
