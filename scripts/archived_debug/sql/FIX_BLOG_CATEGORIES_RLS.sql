-- ==========================================
-- FIX RLS POLICIES FOR BLOG CATEGORIES
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Enable RLS (ensure it's on)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- 2. Allow PUBLIC read access
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
CREATE POLICY "Public can view categories" ON blog_categories FOR SELECT USING (true);

-- 3. Allow AUTHENTICATED users to INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Auth can manage categories" ON blog_categories;
CREATE POLICY "Auth can manage categories" ON blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- 4. (Optional) Explicit insert policy
DROP POLICY IF EXISTS "Auth can insert categories" ON blog_categories;
CREATE POLICY "Auth can insert categories" ON blog_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'blog_categories';
