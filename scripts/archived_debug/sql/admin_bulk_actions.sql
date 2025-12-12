-- Bulk Actions for Admin Messages

-- 1. Mark Single Message as Read
CREATE OR REPLACE FUNCTION mark_admin_message_read(target_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    UPDATE messages
    SET read_at = NOW()
    WHERE id = target_message_id AND read_at IS NULL;
END;
$func$;

-- 2. Bulk Mark Messages as Read
CREATE OR REPLACE FUNCTION bulk_mark_admin_messages_read(target_message_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    UPDATE messages
    SET read_at = NOW()
    WHERE id = ANY(target_message_ids) AND read_at IS NULL;
END;
$func$;

-- 3. Bulk Delete Messages
CREATE OR REPLACE FUNCTION bulk_delete_admin_messages(target_message_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    DELETE FROM messages
    WHERE id = ANY(target_message_ids);
END;
$func$;
