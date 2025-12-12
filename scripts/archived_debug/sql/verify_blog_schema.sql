-- VERIFY DATABASE STATE
-- Run this to check if tables and policies are actually correct

SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.columns c
JOIN information_schema.tables t ON t.table_name = c.table_name
WHERE t.table_name IN ('posts', 'blog_categories', 'post_categories', 'blog_comments', 'post_tags')
ORDER BY t.table_name, c.ordinal_position;

-- Check RLS Policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('posts', 'blog_categories', 'post_categories', 'blog_comments', 'objects');
