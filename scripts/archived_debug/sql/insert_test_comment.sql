INSERT INTO blog_comments (post_id, author_name, author_email, content, status)
SELECT id, 'Test User', 'test@example.com', 'Bu bir test yorumudur. Admin panelinden onaylamayı deneyin.', 'pending'
FROM posts
WHERE status = 'published'
LIMIT 1;
