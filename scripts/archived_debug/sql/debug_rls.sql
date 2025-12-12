-- Run these queries in Supabase SQL Editor to debug

-- 1. Check if RLS is enabled on user_notifications
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_notifications';

-- 2. Check existing RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_notifications';

-- 3. Check if any notifications exist for Dj34Istanbul
SELECT * FROM user_notifications 
WHERE user_id = 'cc61b0f2-d0f4-46ef-a323-a0546f85e36a';

-- 4. Check all user_notifications (to see if any exist at all)
SELECT un.*, an.title, an.message 
FROM user_notifications un
LEFT JOIN admin_notifications an ON un.notification_id = an.id
ORDER BY un.created_at DESC
LIMIT 10;

-- 5. If RLS is blocking, temporarily disable it to test
ALTER TABLE user_notifications DISABLE ROW LEVEL SECURITY;

-- Then try to fetch notifications again from the frontend
-- After testing, re-enable RLS:
-- ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
