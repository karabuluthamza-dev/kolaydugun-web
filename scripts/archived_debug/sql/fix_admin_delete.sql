-- FUNCTION: delete_admin_message
-- Purpose: Allows admins to delete any message by ID, bypassing standard RLS user checks.

CREATE OR REPLACE FUNCTION delete_admin_message(target_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Optional: Add Admin Role Check here if needed in production
    -- IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    DELETE FROM messages
    WHERE id = target_message_id;
END;
$$;
