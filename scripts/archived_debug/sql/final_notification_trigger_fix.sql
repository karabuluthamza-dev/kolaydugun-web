-- FINAL CORRECT NOTIFICATION TRIGGER
-- This handles ALL notifications for admin_messages table automatically
-- It replaces any previous manual frontend logic or partial triggers

CREATE OR REPLACE FUNCTION public.handle_admin_message_notification_unified()
RETURNS TRIGGER AS $$
DECLARE
    sender_role TEXT;
    sender_name TEXT;
    target_user_id UUID;
    message_content TEXT;
BEGIN
    -- 1. Identify Sender Role and ID
    SELECT role INTO sender_role FROM public.profiles WHERE id = NEW.sender_id;

    -- 2. Determine Receiver and Sender Name logic
    IF sender_role = 'admin' THEN
        -- Case A: Admin sent message -> Notify User (Couple)
        target_user_id := NEW.receiver_id;
        sender_name := 'KolayDugun'; -- Standardized Name for Admin
        
        -- Construct Message: JSON for localization + Embedded Conversation ID
        message_content := jsonb_build_object(
            'key', 'dashboard.notifications.new_message_message', 
            'args', jsonb_build_object('name', sender_name)
        )::text || '|||' || NEW.conversation_id;

    ELSE
        -- Case B: User sent message -> Notify Admin
        target_user_id := NEW.receiver_id; -- This is the Admin ID
        
        -- Determine User Name
        SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
        IF sender_name IS NULL THEN
            SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
        END IF;
        sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

        -- Construct Message: Standard JSON with User Name + ID
        message_content := jsonb_build_object(
            'key', 'dashboard.notifications.new_message_message', 
            'args', jsonb_build_object('name', sender_name)
        )::text || '|||' || NEW.conversation_id;
    END IF;

    -- 3. Insert Notification
    INSERT INTO public.user_notifications (
        user_id, 
        type, 
        title, 
        message, 
        related_id, -- Keep conversation_id in related_id too for safety
        is_read, 
        created_at
    )
    VALUES (
        target_user_id, 
        'new_message',
        'new_message', -- Will be localized by frontend as "Yeni Mesaj" etc.
        message_content,
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
    EXECUTE FUNCTION public.handle_admin_message_notification_unified();
