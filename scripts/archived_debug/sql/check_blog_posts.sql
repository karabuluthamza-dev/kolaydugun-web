-- Check how many blog posts exist
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'published') as published,
    COUNT(*) FILTER (WHERE status = 'draft') as draft,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled
FROM posts;

-- List all posts with details
SELECT 
    title->>'tr' as title_tr,
    title->>'en' as title_en,
    status,
    created_at,
    slug
FROM posts
ORDER BY created_at DESC;
