-- RPCs for Admin Messaging (Bypass RLS)

-- 1. Get Messages
CREATE OR REPLACE FUNCTION get_admin_messages(p_conversation_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        m.read_at
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. Send Message (as Admin)
CREATE OR REPLACE FUNCTION send_admin_message(
    p_conversation_id UUID,
    p_content TEXT
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    v_msg_id UUID;
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();
    
    INSERT INTO messages (conversation_id, sender_id, content, read_at)
    VALUES (p_conversation_id, v_admin_id, p_content, NULL)
    RETURNING id INTO v_msg_id;
    
    -- Touch conversation updated_at
    UPDATE conversations SET updated_at = NOW() WHERE id = p_conversation_id;
    
    RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Mark as Read
CREATE OR REPLACE FUNCTION mark_admin_messages_read(p_conversation_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    UPDATE messages 
    SET read_at = NOW()
    WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid() -- Don't mark own messages as read (though they are read by definition)
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Grants
GRANT EXECUTE ON FUNCTION get_admin_messages TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION send_admin_message TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_admin_messages_read TO anon, authenticated, service_role;

-- Reload Schema
NOTIFY pgrst, 'reload schema';
