-- 1. Backfill status for existing conversations
UPDATE conversations SET status = 'active' WHERE status IS NULL;

-- 2. Make status NOT NULL to prevent future creation of NULLs (optional but good practice)
-- ALTER TABLE conversations ALTER COLUMN status SET NOT NULL; -- Skipping to avoid lock issues for now

-- 3. Update RPC to be robust against NULLs
CREATE OR REPLACE FUNCTION get_support_conversations(p_status TEXT DEFAULT 'active')
RETURNS TABLE (
    conversation_id UUID,
    updated_at TIMESTAMPTZ,
    contact_name TEXT,
    message_context TEXT,
    last_message_content TEXT,
    last_message_sender UUID,
    unread_count BIGINT,
    counterparty_id UUID,
    status TEXT
)
SECURITY DEFINER
AS $$
DECLARE
    v_support_vendor_id UUID;
BEGIN
    SELECT v.id INTO v_support_vendor_id 
    FROM vendors v
    WHERE (v.business_name ILIKE '%KolayDugun Destek%' OR v.business_name ILIKE '%Support%')
    LIMIT 1;
    
    IF v_support_vendor_id IS NULL THEN
        SELECT id INTO v_support_vendor_id FROM vendors WHERE business_name ILIKE '%Destek%' LIMIT 1;
    END IF;
    
    IF v_support_vendor_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.updated_at,
        COALESCE(
            v2.business_name,
            p.full_name,
            p.email,
            l.contact_name,
            'Destek Talebi'
        ) as contact_name,
        COALESCE(l.additional_notes, '') as message_context,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
        (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.read_at IS NULL) as unread,
        c.user_id as counterparty_id,
        COALESCE(c.status, 'active') as status -- Ensure status is returned
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN vendors v2 ON v2.user_id = c.user_id 
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.vendor_id = v_support_vendor_id
    AND (
        p_status IS NULL 
        OR COALESCE(c.status, 'active') = p_status -- Handle NULLs as active
    )
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
