-- DIAGNOSE MESSAGE NOTIFICATIONS
-- 1. Check recent notifications and their raw content
SELECT 
    id,
    type,
    title,
    message,
    created_at
FROM user_notifications
WHERE type = 'new_message'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check the definition of the message trigger function
SELECT prosrc
FROM pg_proc
WHERE proname = 'handle_new_message_notification';
