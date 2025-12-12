-- Check blog_comments table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_comments';

-- Check RLS policies for blog_comments
SELECT * FROM pg_policies WHERE tablename = 'blog_comments';

-- Try to simulate an insert (this will fail if RLS blocks it for the current role, but gives us info)
-- Note: We can't easily simulate anon role here without set role, but we can check the policies.
