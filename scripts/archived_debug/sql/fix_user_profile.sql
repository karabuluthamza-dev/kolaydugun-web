-- First, check what we have in admin_conversations
SELECT 
    ac.id as conversation_id,
    ac.user_id,
    au.email,
    p.id as profile_id,
    p.name,
    p.surname
FROM admin_conversations ac
LEFT JOIN auth.users au ON au.id = ac.user_id
LEFT JOIN profiles p ON p.id = ac.user_id
ORDER BY ac.last_message_at DESC
LIMIT 5;

-- If profile exists but name is null, update it
-- Replace 'USER_ID_HERE' with the actual user_id from above query
-- UPDATE profiles 
-- SET name = 'Esra', surname = ''
-- WHERE id = 'USER_ID_HERE';
