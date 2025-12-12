-- ============================================
-- FIX: Notify Admins Directly in user_notifications
-- ============================================

DROP TRIGGER IF EXISTS trigger_notify_contact_message ON contact_messages;
DROP FUNCTION IF EXISTS notify_contact_message();

CREATE OR REPLACE FUNCTION notify_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Loop through all admin users
    FOR v_admin_id IN SELECT id FROM profiles WHERE role = 'admin'
    LOOP
        BEGIN
            INSERT INTO user_notifications (
                user_id,
                type,
                title,
                message,
                is_read
            ) VALUES (
                v_admin_id,
                'system', -- REVERTED TO 'system' because 'contact_form' is likely blocked by constraint
                'Yeni İletişim Mesajı! 📬',
                'Gönderen: ' || COALESCE(NEW.name, 'İsimsiz') || E'\n' || SUBSTRING(COALESCE(NEW.message, '') FROM 1 FOR 60) || '...',
                FALSE
            );
        EXCEPTION 
            WHEN others THEN
                RAISE WARNING 'Failed to insert notification for admin %: %', v_admin_id, SQLERRM;
        END;
    END LOOP;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_contact_message
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_contact_message();

DO $$
BEGIN
    RAISE NOTICE '✅ Contact notification trigger reverted to System type!';
END $$;
