-- FUNCTION: get_admin_platform_messages (PERMISSIVE VERSION)
-- Warning: This removes the strict role check for testing purposes.
-- Revert to strict version in production.

CREATE OR REPLACE FUNCTION get_admin_platform_messages()
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    sender_name TEXT,
    sender_role TEXT,
    receiver_name TEXT,
    receiver_role TEXT,
    lead_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- REMOVED STRICT CHECK FOR TESTING:
    -- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN ...

    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.created_at,
        m.read_at,
        COALESCE(v_sender.business_name, p_sender.full_name, p_sender.email, 'Bilinmeyen') as sender_name,
        COALESCE(p_sender.role, 'user') as sender_role,
        COALESCE(v_receiver.business_name, p_receiver.full_name, p_receiver.email, 'Bilinmeyen') as receiver_name,
        COALESCE(p_receiver.role, 'user') as receiver_role,
        COALESCE(l.contact_name, 'Doğrudan Mesaj') as lead_name
    FROM messages m
    LEFT JOIN conversations c ON m.conversation_id = c.id
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN profiles p_sender ON m.sender_id = p_sender.id
    LEFT JOIN vendors v_sender ON m.sender_id = v_sender.user_id
    LEFT JOIN profiles p_receiver ON m.receiver_id = p_receiver.id
    LEFT JOIN vendors v_receiver ON m.receiver_id = v_receiver.user_id
    ORDER BY m.created_at DESC;
END;
$$;
