-- Migration to fix Admin Messaging on Remote (v2)
-- Fixes "column l.message does not exist" error

CREATE OR REPLACE FUNCTION get_support_conversations()
RETURNS TABLE (
    conversation_id UUID,
    updated_at TIMESTAMPTZ,
    contact_name TEXT,
    message_context TEXT,
    last_message_content TEXT,
    last_message_sender UUID,
    unread_count BIGINT
)
SECURITY DEFINER
AS $$
DECLARE
    v_support_vendor_id UUID;
BEGIN
    -- Find the 'Support' vendor that actually has conversations/leads
    SELECT v.id INTO v_support_vendor_id 
    FROM vendors v
    LEFT JOIN conversations c ON c.vendor_id = v.id
    WHERE (v.business_name ILIKE '%KolayDugun Destek%' OR v.business_name ILIKE '%Support%')
    GROUP BY v.id
    ORDER BY count(c.id) DESC
    LIMIT 1;
    
    -- Fallback: if not found, try just 'Destek'
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
        COALESCE(l.contact_name, 'Destek Talebi') as contact_name,
        -- Use additional_notes or empty string if null. Removed 'message' column usage.
        COALESCE(l.additional_notes, '') as message_context,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
        (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false) as unread
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    WHERE c.vendor_id = v_support_vendor_id
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant access to API roles
GRANT EXECUTE ON FUNCTION get_support_conversations TO anon, authenticated, service_role;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

-- Backfill Data if missing
DO $$
DECLARE
    v_user_id UUID;
    v_vendor_id UUID;
    v_lead_id UUID;
    v_conversation_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Check if support vendor exists only if we need to create it
        SELECT id INTO v_vendor_id FROM vendors WHERE business_name ILIKE '%KolayDugun Destek%' LIMIT 1;
        
        IF v_vendor_id IS NULL THEN
            INSERT INTO vendors (user_id, business_name, category, city, min_price)
            VALUES (v_user_id, 'KolayDugun Destek', 'Organizasyon', 'Istanbul', 0)
            RETURNING id INTO v_vendor_id;
        END IF;

        -- Ensure lead and conversation exist
        IF NOT EXISTS (SELECT 1 FROM conversations WHERE vendor_id = v_vendor_id) THEN
            -- Using additional_notes instead of message
            INSERT INTO leads (vendor_id, user_id, contact_name, status, additional_notes)
            VALUES (v_vendor_id, v_user_id, 'Sistem Testi', 'pending', 'Sistem Mesajı')
            RETURNING id INTO v_lead_id;

            INSERT INTO conversations (vendor_id, user_id, lead_id)
            VALUES (v_vendor_id, v_user_id, v_lead_id)
            RETURNING id INTO v_conversation_id;

            INSERT INTO messages (conversation_id, sender_id, content, is_read)
            VALUES (v_conversation_id, v_user_id, 'Merhaba, bu otomatik bir sistem mesajıdır.', false);
        END IF;
    END IF;
END $$;
