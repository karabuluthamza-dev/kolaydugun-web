-- DIAGNOSE AND FIX ALL BLOG ISSUES (UPDATED)
-- Run this script to fix Categories, Comments, and Image Uploads

-- ============================================
-- 0. FIX MISSING COLUMNS (The error source)
-- ============================================
DO $$ 
BEGIN
    -- Add color column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_categories' AND column_name = 'color') THEN
        ALTER TABLE blog_categories ADD COLUMN color TEXT DEFAULT '#3b82f6';
    END IF;

    -- Add icon column if missing (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_categories' AND column_name = 'icon') THEN
        ALTER TABLE blog_categories ADD COLUMN icon TEXT;
    END IF;

    -- Add sort_order if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_categories' AND column_name = 'sort_order') THEN
        ALTER TABLE blog_categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- 1. FIX STORAGE (Images)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Blog Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Blog Images Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Blog Images Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Blog Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Blog Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Blog Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Blog Auth Delete" ON storage.objects;

-- Re-create policies correctly
CREATE POLICY "Blog Public Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Blog Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Blog Auth Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Blog Auth Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- ============================================
-- 2. FIX CATEGORIES (RLS)
-- ============================================
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Auth can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Public View Categories" ON blog_categories;
DROP POLICY IF EXISTS "Auth Manage Categories" ON blog_categories;

DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON post_categories;
DROP POLICY IF EXISTS "Auth can manage post categories" ON post_categories;
DROP POLICY IF EXISTS "Public View Post Categories" ON post_categories;
DROP POLICY IF EXISTS "Auth Manage Post Categories" ON post_categories;

-- Re-create policies
CREATE POLICY "Public View Categories"
ON blog_categories FOR SELECT USING (true);

CREATE POLICY "Auth Manage Categories"
ON blog_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public View Post Categories"
ON post_categories FOR SELECT USING (true);

CREATE POLICY "Auth Manage Post Categories"
ON post_categories FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 3. FIX COMMENTS (RLS)
-- ============================================
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;
DROP POLICY IF EXISTS "Authenticated users can manage comments" ON blog_comments;
DROP POLICY IF EXISTS "Auth can manage comments" ON blog_comments;
DROP POLICY IF EXISTS "Public View Approved Comments" ON blog_comments;
DROP POLICY IF EXISTS "Public Create Comments" ON blog_comments;
DROP POLICY IF EXISTS "Auth Manage Comments" ON blog_comments;

-- Re-create policies
CREATE POLICY "Public View Approved Comments"
ON blog_comments FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Public Create Comments"
ON blog_comments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Auth Manage Comments"
ON blog_comments FOR ALL 
USING (auth.role() = 'authenticated');

-- ============================================
-- 4. TEST DATA (Optional)
-- ============================================
-- Insert a test category if none exist
INSERT INTO blog_categories (name, slug, color, sort_order)
SELECT '{"tr": "Test Kategori"}', 'test-category', '#000000', 99
WHERE NOT EXISTS (SELECT 1 FROM blog_categories);

-- ============================================
-- DONE!
-- ============================================
