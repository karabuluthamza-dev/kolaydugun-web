-- Check existing admin_conversations and user IDs
SELECT * FROM admin_conversations;

-- Also check current user ID (we can't easily get the 'current' logged in user from SQL editor, 
-- but we can list all users to manually verify)
SELECT id, email, role FROM auth.users;
