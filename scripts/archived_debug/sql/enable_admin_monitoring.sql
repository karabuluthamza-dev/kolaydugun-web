-- FUNCTION: get_admin_platform_messages
-- Purpose: Allows admins to view all messages (User <-> Vendor) with sender/receiver details.

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
SECURITY DEFINER -- Bypasses RLS
AS $$
BEGIN
    -- Security Check: Only allow if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.created_at,
        m.read_at,
        -- Resolve Sender Name
        COALESCE(
            v_sender.business_name, 
            p_sender.full_name, 
            p_sender.email, 
            'Bilinmeyen'
        ) as sender_name,
        COALESCE(p_sender.role, 'user') as sender_role,
        -- Resolve Receiver Name
        COALESCE(
            v_receiver.business_name, 
            p_receiver.full_name, 
            p_receiver.email, 
            'Bilinmeyen'
        ) as receiver_name,
        COALESCE(p_receiver.role, 'user') as receiver_role,
        -- Lead Name
        COALESCE(l.contact_name, 'Doğrudan Mesaj') as lead_name
    FROM messages m
    LEFT JOIN conversations c ON m.conversation_id = c.id
    LEFT JOIN leads l ON c.lead_id = l.id
    -- Join for Sender
    LEFT JOIN profiles p_sender ON m.sender_id = p_sender.id
    LEFT JOIN vendors v_sender ON m.sender_id = v_sender.user_id -- Assuming one vendor per user for simplicity, or link via id
    -- Join for Receiver
    LEFT JOIN profiles p_receiver ON m.receiver_id = p_receiver.id
    LEFT JOIN vendors v_receiver ON m.receiver_id = v_receiver.user_id
    ORDER BY m.created_at DESC;
END;
$$;
