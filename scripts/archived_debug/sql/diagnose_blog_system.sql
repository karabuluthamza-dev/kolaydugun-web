-- BLOG SYSTEM DIAGNOSTIC CHECK
-- Run this to see what's missing

-- ============================================
-- 1. CHECK IF TABLES EXIST
-- ============================================
SELECT 
    'blog_categories' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blog_categories'
    ) as exists
UNION ALL
SELECT 
    'blog_tags',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blog_tags'
    )
UNION ALL
SELECT 
    'post_categories',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'post_categories'
    )
UNION ALL
SELECT 
    'post_tags',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'post_tags'
    )
UNION ALL
SELECT 
    'blog_comments',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blog_comments'
    )
UNION ALL
SELECT 
    'post_views',
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'post_views'
    );

-- ============================================
-- 2. CHECK IF COLUMNS EXIST IN POSTS TABLE
-- ============================================
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN (
    'image_url', 
    'featured_image_url',
    'view_count',
    'reading_time',
    'comment_count',
    'comments_enabled',
    'scheduled_for',
    'published_at'
)
ORDER BY column_name;

-- ============================================
-- 3. CHECK STORAGE BUCKET
-- ============================================
SELECT 
    id,
    name,
    public
FROM storage.buckets
WHERE id = 'blog-images';

-- ============================================
-- 4. CHECK RLS POLICIES
-- ============================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('blog_categories', 'blog_tags', 'post_categories', 'post_tags', 'blog_comments')
ORDER BY tablename, policyname;

-- ============================================
-- 5. CHECK FUNCTIONS
-- ============================================
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN (
    'track_post_view',
    'calculate_reading_time',
    'approve_comment',
    'reject_comment',
    'mark_comment_spam',
    'auto_publish_scheduled_posts'
)
ORDER BY routine_name;
