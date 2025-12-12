-- Fix RLS policies for blog_comments to allow public submission and admin moderation

-- 1. Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Admins have full access" ON blog_comments;
DROP POLICY IF EXISTS "Users can view their own pending comments" ON blog_comments;

-- 3. Create new policies

-- Policy: Public can view approved comments
CREATE POLICY "Public can view approved comments"
ON blog_comments FOR SELECT
USING (status = 'approved');

-- Policy: Public can insert comments (anyone, even anonymous)
CREATE POLICY "Public can insert comments"
ON blog_comments FOR INSERT
WITH CHECK (true); 
-- Note: We might want to restrict this to authenticated users later, but for now allow all.
-- If you want only authenticated: WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins have full access
-- Assuming admin check is done via app_metadata or a specific table. 
-- For Supabase standard:
CREATE POLICY "Admins have full access"
ON blog_comments FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin' 
  OR 
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') -- Adjust based on your user role system
);

-- Alternative Admin Policy if using a simple 'admin' role in auth.users or similar:
-- CREATE POLICY "Admins have full access" ON blog_comments FOR ALL USING (auth.role() = 'service_role');

-- Let's make a broad admin policy for now that relies on the app's admin check logic if possible, 
-- or just allow authenticated users to view all for debugging if needed. 
-- BETTER: Allow authenticated users to view their own comments regardless of status.
CREATE POLICY "Users can view own comments"
ON blog_comments FOR SELECT
USING (auth.uid() = user_id);

-- 4. Grant permissions
GRANT ALL ON blog_comments TO authenticated;
GRANT ALL ON blog_comments TO service_role;
GRANT INSERT, SELECT ON blog_comments TO anon;

-- 5. Fix sequence permissions if needed (for ID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
