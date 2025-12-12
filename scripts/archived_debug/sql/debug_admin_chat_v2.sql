-- Check the most recent admin conversations and their participants
SELECT 
    ac.id, 
    ac.created_at, 
    ac.last_message_at,
    ac.user_type,
    ac.admin_id,
    p_admin.email as admin_email,
    ac.user_id,
    p_user.email as user_email
FROM admin_conversations ac
LEFT JOIN auth.users p_admin ON ac.admin_id = p_admin.id
LEFT JOIN auth.users p_user ON ac.user_id = p_user.id
ORDER BY ac.created_at DESC
LIMIT 5;

-- Check if any admin exists
SELECT id, email, role FROM profiles WHERE role = 'admin';
SELECT id, email, role FROM auth.users WHERE email = 'karabulut.hamza@gmail.com';
