-- Restore the trigger on admin_messages but make it smart
-- It should ONLY create user_notifications if the sender is NOT an admin
-- This avoids double notifications for the couple (User), because Frontend handles Admin->User notifications manually.
-- But we NEED the trigger for User->Admin notifications because the Edge Function does NOT handle it manually.

CREATE OR REPLACE FUNCTION public.handle_admin_message_notification_smart()
RETURNS TRIGGER AS $$
DECLARE
    sender_role TEXT;
    sender_name TEXT;
    notif_id UUID;
BEGIN
    -- Check sender role
    SELECT role INTO sender_role FROM public.profiles WHERE id = NEW.sender_id;

    -- IF Sender is Admin, DO NOT create user_notifications (Frontend handles this)
    -- We can still create admin_notifications if we want logs, but usually admin doesn't need a notif for their own message.
    IF sender_role = 'admin' THEN
        RETURN NEW;
    END IF;

    -- IF Sender is NOT Admin (i.e. User/Vendor sending to Admin)
    -- We MUST create a notification for the Admin.
    -- The Receiver (Admin) should get a notification.
    
    -- Determine Sender Name for the notification
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    
    IF sender_name IS NULL THEN
        SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    -- Insert into admin_notifications (This is what Admin Panel checks!)
    -- Or user_notifications for Admin user?  
    -- AdminMessaging.jsx checks user_notifications for the logged-in admin.
    -- So we must insert into user_notifications for the Receiver (Admin).

    INSERT INTO public.user_notifications (
        user_id, 
        type, 
        title, 
        message, 
        related_id, -- Use related_id for conversation_id
        is_read, 
        created_at
    )
    VALUES (
        NEW.receiver_id, -- Admin ID
        'new_message',
        'Yeni Mesaj', -- Or localized key
        jsonb_build_object(
            'key', 'dashboard.notifications.new_message_message', 
            'args', jsonb_build_object('name', sender_name)
        )::text || '|||' || NEW.conversation_id,
        NEW.conversation_id, -- Fallback
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;

CREATE TRIGGER on_message_received
    AFTER INSERT ON public.admin_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_message_notification_smart();
