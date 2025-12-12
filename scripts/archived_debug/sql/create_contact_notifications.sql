
-- ============================================
-- Notification Trigger for Contact Form Messages
-- ============================================

-- Drop existing trigger/function if any
DROP TRIGGER IF EXISTS trigger_notify_contact_message ON contact_messages;
DROP FUNCTION IF EXISTS notify_contact_message();

CREATE OR REPLACE FUNCTION notify_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create notification for every new contact message
    PERFORM create_notification(
        'contact',           -- type
        'high',              -- priority (Contact requests are usually urgent)
        'Yeni İletişim Mesajı! 📬',  -- title
        'Gönderen: ' || COALESCE(NEW.name, 'İsimsiz') || 
        ' (' || COALESCE(NEW.email, 'No Email') || ')' ||
        E'\nMesaj: ' || SUBSTRING(COALESCE(NEW.message, '') FROM 1 FOR 50) || '...', -- description (truncated)
        NEW.id,              -- reference_id
        'contact_message'    -- reference_type
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_contact_message
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_contact_message();

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Contact message notification trigger created!';
END $$;
