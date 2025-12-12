-- Fix Admin Notification (User -> Admin)
-- This trigger runs on 'admin_messages'
-- 1. If Sender is ADMIN: It does NOTHING (Frontend handles notification)
-- 2. If Sender is USER: It creates a notification for the ADMIN

CREATE OR REPLACE FUNCTION public.handle_user_to_admin_notification_only()
RETURNS TRIGGER AS $$
DECLARE
    sender_is_admin BOOLEAN;
    sender_name TEXT;
BEGIN
    -- Check if sender is admin
    SELECT (role = 'admin') INTO sender_is_admin 
    FROM public.profiles 
    WHERE id = NEW.sender_id;

    -- CASE 1: Admin sent message -> DO NOTHING (Frontend handles it)
    IF sender_is_admin THEN
        RETURN NEW;
    END IF;

    -- CASE 2: User sent message -> Notify Admin
    
    -- Get Sender Name (Vendor Name or Profile Name)
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    
    IF sender_name IS NULL THEN
         SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;

    -- Insert Notification
    INSERT INTO public.user_notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        is_read,
        created_at
    ) VALUES (
        NEW.receiver_id, -- Admin ID
        'new_message',
        'new_message', -- "Yeni Mesaj"
        jsonb_build_object(
            'key', 'dashboard.notifications.new_message_message',
            'args', jsonb_build_object('name', COALESCE(sender_name, 'Bir Kullanıcı'))
        )::text || '|||' || NEW.conversation_id,
        NEW.conversation_id,
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply Trigger
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;

CREATE TRIGGER on_message_received
    AFTER INSERT ON public.admin_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_to_admin_notification_only();
