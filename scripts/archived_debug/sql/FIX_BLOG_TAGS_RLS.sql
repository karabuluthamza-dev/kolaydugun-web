-- ==========================================
-- FIX RLS POLICIES FOR BLOG TAGS
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Enable RLS (ensure it's on)
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- 2. Allow PUBLIC read access (so everyone can see tags)
DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
CREATE POLICY "Public can view tags" ON blog_tags FOR SELECT USING (true);

-- 3. Allow AUTHENTICATED users to INSERT/UPDATE/DELETE tags
-- This covers the admin user.
DROP POLICY IF EXISTS "Auth can manage tags" ON blog_tags;
CREATE POLICY "Auth can manage tags" ON blog_tags FOR ALL USING (auth.role() = 'authenticated');

-- 4. (Optional) Explicit insert policy if the above doesn't work for some reason
DROP POLICY IF EXISTS "Auth can insert tags" ON blog_tags;
CREATE POLICY "Auth can insert tags" ON blog_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'blog_tags';
