-- Migration to fix Admin Messaging and Titles (v4)
-- Union standard conversations with legacy admin_conversations

DROP FUNCTION IF EXISTS get_support_conversations();

CREATE OR REPLACE FUNCTION get_support_conversations()
RETURNS TABLE (
    conversation_id UUID,
    updated_at TIMESTAMPTZ,
    contact_name TEXT,
    message_context TEXT,
    last_message_content TEXT,
    last_message_sender UUID,
    unread_count BIGINT,
    counterparty_id UUID,
    is_legacy BOOLEAN
)
SECURITY DEFINER
AS $$
DECLARE
    v_support_vendor_id UUID;
    v_msg TEXT;
    v_sender UUID;
    v_unread BIGINT;
BEGIN
    -- Find the 'Support' vendor for standard chats
    SELECT v.id INTO v_support_vendor_id 
    FROM vendors v
    WHERE (v.business_name ILIKE '%KolayDugun Destek%' OR v.business_name ILIKE '%Support%')
    LIMIT 1;

    -- Return UNION of both tables
    RETURN QUERY
    
    -- 1. Standard Conversations (via Support Vendor)
    SELECT 
        c.id as conversation_id,
        c.updated_at,
        COALESCE(
            v2.business_name,
            p.full_name,
            p.email,
            l.contact_name,
            'Destek Talebi'
        ) as contact_name,
        COALESCE(l.additional_notes, '') as message_context,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
        (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_sender,
        (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.read_at IS NULL) as unread_count,
        c.user_id as counterparty_id,
        FALSE as is_legacy
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN vendors v2 ON v2.user_id = c.user_id 
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.vendor_id = v_support_vendor_id

    UNION ALL

    -- 2. Legacy Admin Conversations (from admin_conversations table)
    SELECT 
        ac.id as conversation_id,
        ac.last_message_at as updated_at,
        COALESCE(
            p.full_name,
            p.email,
            'Canlı Destek Kullanıcısı'
        ) as contact_name,
        'Legacy Support Chat' as message_context,
        (SELECT content FROM admin_messages am WHERE am.conversation_id = ac.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
        (SELECT sender_id FROM admin_messages am WHERE am.conversation_id = ac.id ORDER BY created_at DESC LIMIT 1) as last_message_sender,
        (SELECT count(*) FROM admin_messages am WHERE am.conversation_id = ac.id AND read_at IS NULL AND sender_id != ac.admin_id) as unread_count,
        ac.user_id as counterparty_id,
        TRUE as is_legacy
    FROM admin_conversations ac
    LEFT JOIN profiles p ON p.id = ac.user_id
    -- We assume the current viewer is the admin, or we show all. 
    -- Ideally filter by admin_id = auth.uid() but this RPC is seemingly global or filtered by caller permissions.
    -- The original didn't filter by admin_id, it filtered by vendor_id.
    -- We'll include all admin_conversations for now as this is an Admin view.
    ORDER BY updated_at DESC;

END;
$$ LANGUAGE plpgsql;

-- Grant access to API roles
GRANT EXECUTE ON FUNCTION get_support_conversations TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
