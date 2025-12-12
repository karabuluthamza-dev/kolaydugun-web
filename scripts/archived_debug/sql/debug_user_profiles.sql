-- Check admin_conversations and related user profiles
SELECT 
    ac.id as conversation_id,
    ac.user_id,
    ac.admin_id,
    p.name,
    p.surname,
    p.email,
    au.email as auth_email
FROM admin_conversations ac
LEFT JOIN profiles p ON p.user_id = ac.user_id
LEFT JOIN auth.users au ON au.id = ac.user_id
WHERE ac.id IN (
    SELECT id FROM admin_conversations 
    ORDER BY last_message_at DESC 
    LIMIT 5
)
ORDER BY ac.last_message_at DESC;
