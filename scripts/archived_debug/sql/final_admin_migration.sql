-- Admin Messaging Enhancements & Fixes Migration
-- Run this in Supabase SQL Editor

-- 1. Add status column to conversations (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'status') THEN
        ALTER TABLE conversations ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed'));
    END IF;
END $$;

-- 2. Backfill NULL status values specifically
UPDATE conversations SET status = 'active' WHERE status IS NULL;

-- 3. Create Canned Responses Table
CREATE TABLE IF NOT EXISTS canned_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

-- 4. Update Policies
DROP POLICY IF EXISTS "Admins can manage canned responses" ON canned_responses;
CREATE POLICY "Admins can manage canned responses"
ON canned_responses
FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Update RPC: get_support_conversations (Handles status and NULLs)
DROP FUNCTION IF EXISTS get_support_conversations();
DROP FUNCTION IF EXISTS get_support_conversations(text);

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
        COALESCE(c.status, 'active') as status
    FROM conversations c
    LEFT JOIN leads l ON c.lead_id = l.id
    LEFT JOIN vendors v2 ON v2.user_id = c.user_id 
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE c.vendor_id = v_support_vendor_id
    AND (
        p_status IS NULL 
        OR COALESCE(c.status, 'active') = p_status
    )
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: Archive Conversation
CREATE OR REPLACE FUNCTION archive_conversation(p_conversation_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    UPDATE conversations SET status = 'archived' WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Update RPC: get_admin_messages (Pagination support)
DROP FUNCTION IF EXISTS get_admin_messages(UUID);

CREATE OR REPLACE FUNCTION get_admin_messages(
    p_conversation_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
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
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Grants
GRANT EXECUTE ON FUNCTION get_support_conversations(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION archive_conversation(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_admin_messages(UUID, INTEGER, INTEGER) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
