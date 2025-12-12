
-- Check recent admin messages to find the 'hey' message
SELECT 
    m.id, 
    m.content, 
    m.conversation_id, 
    m.created_at, 
    m.sender_id,
    c.id as conversation_id_from_conv
FROM admin_messages m
LEFT JOIN admin_conversations c ON m.conversation_id = c.id
WHERE m.content ILIKE '%hey%'
ORDER BY m.created_at DESC;

-- List all messages for the conversation found above (if any)
-- We will dynamically use the conversation_id from the first result if logical, 
-- but for this script I'll just list the top 5 conversations and their message counts first.

SELECT 
    c.id, 
    c.created_at, 
    c.updated_at, 
    (SELECT count(*) FROM admin_messages m WHERE m.conversation_id = c.id) as msg_count
FROM admin_conversations c
ORDER BY c.updated_at DESC
LIMIT 5;
