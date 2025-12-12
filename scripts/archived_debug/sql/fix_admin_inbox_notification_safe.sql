-- SAFE Admin Notification Trigger
-- 1. Cleans up previous problematic triggers
-- 2. Adds a robust trigger for User->Admin notifications
-- 3. Uses EXCEPTION handling to NEVER block message sending

-- Cleanup
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;
DROP FUNCTION IF EXISTS public.handle_user_to_admin_notification_only();
DROP FUNCTION IF EXISTS public.handle_admin_notif_safe();

-- Robust Function
CREATE OR REPLACE FUNCTION public.handle_admin_notif_safe()
RETURNS TRIGGER AS $$
DECLARE
    sender_is_admin BOOLEAN;
    sender_name TEXT;
BEGIN
    -- Wrap in logic block to catch errors
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
    EXCEPTION WHEN OTHERS THEN
        -- If anything fails (RLS, invalid JSON, etc), DO NOT FAIL THE MESSAGE
        -- Just log warning
        RAISE WARNING 'Notification creation failed for message %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply Trigger
CREATE TRIGGER on_message_received
    AFTER INSERT ON public.admin_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_notif_safe();
