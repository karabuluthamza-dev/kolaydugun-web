-- 1. Check if the category exists and get its ID
SELECT id, name, slug FROM blog_categories WHERE slug = 'mekan-secimi';

-- 2. Check if there are any posts associated with this category
SELECT count(*) 
FROM post_categories pc
JOIN blog_categories bc ON pc.category_id = bc.id
WHERE bc.slug = 'mekan-secimi';

-- 3. Check the get_posts_by_category function manually
SELECT * FROM get_posts_by_category('mekan-secimi', 10, 0);

-- 4. Check RLS policies on post_categories
SELECT * FROM pg_policies WHERE tablename = 'post_categories';

-- 5. Check if the user has access to read post_categories (public access)
-- Try to select from post_categories as an anonymous user (simulated)
-- (This part is hard to simulate directly in SQL editor without switching roles, 
-- but we can check if the policy allows public select)
