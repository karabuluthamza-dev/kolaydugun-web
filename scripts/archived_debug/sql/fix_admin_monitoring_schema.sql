
-- FUNCTION: get_admin_platform_messages (FIXED SCHEMA)
-- "receiver_id" does not exist on messages table, so we infer it from the conversation.

DROP FUNCTION IF EXISTS get_admin_platform_messages();

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
    lead_name TEXT,
    lead_event_date DATE,
    lead_phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        -- Calculate Receiver ID: 
        -- If sender is the conversation's user, receiver is the vendor (user_id of vendor).
        -- If sender is the vendor, receiver is the conversation's user.
        CASE 
            WHEN m.sender_id = c.user_id THEN v_conv.user_id -- Vendor's user_id
            ELSE c.user_id 
        END as receiver_id,
        m.content,
        m.created_at,
        m.read_at,
        
        -- SENDER NAME
        COALESCE(
            v_sender.business_name, 
            p_sender.full_name, 
            p_sender.email, 
            'Bilinmeyen Gönderen'
        ) as sender_name,
        COALESCE(p_sender.role, 'user') as sender_role,

        -- RECEIVER NAME (Calculated based on the opposite of sender)
        CASE 
            WHEN m.sender_id = c.user_id THEN COALESCE(v_conv.business_name, 'Tedarikçi')
            ELSE COALESCE(p_conv_user.full_name, p_conv_user.email, 'Kullanıcı')
        END as receiver_name,
        
        CASE 
            WHEN m.sender_id = c.user_id THEN 'vendor'
            ELSE COALESCE(p_conv_user.role, 'user')
        END as receiver_role,

        -- LEAD DETAILS
        COALESCE(l.contact_name, 'Doğrudan Mesaj') as lead_name,
        l.event_date as lead_event_date,
        COALESCE(
            l.contact_phone,
            (SELECT l_sub.contact_phone FROM leads l_sub WHERE l_sub.user_id = c.user_id AND l_sub.contact_phone IS NOT NULL ORDER BY l_sub.created_at DESC LIMIT 1)
        ) as lead_phone

    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    LEFT JOIN leads l ON c.lead_id = l.id
    
    -- Sender Details
    LEFT JOIN profiles p_sender ON m.sender_id = p_sender.id
    LEFT JOIN vendors v_sender ON m.sender_id = v_sender.user_id
    
    -- Conversation Participants Details (for Receiver calculation)
    LEFT JOIN profiles p_conv_user ON c.user_id = p_conv_user.id
    LEFT JOIN vendors v_conv ON c.vendor_id = v_conv.id -- Note: c.vendor_id links to vendors.id, not users.id
    
    ORDER BY m.created_at DESC;
END;
$$;
