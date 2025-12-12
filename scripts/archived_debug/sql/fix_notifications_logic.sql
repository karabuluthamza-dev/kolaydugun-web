-- 1. Update the function to handle both tables intelligently
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    sender_name TEXT;
    notif_id UUID;
    related_conv_id UUID;
    related_msg_id UUID;
BEGIN
    -- Determine IDs based on the source table
    IF TG_TABLE_NAME = 'messages' THEN
        related_conv_id := NEW.conversation_id;
        related_msg_id := NEW.id;
    ELSE
        -- For admin_messages, we must use NULL to bypass Foreign Key constraints
        -- because user_notifications points to the 'conversations' table, not 'admin_conversations'
        related_conv_id := NULL;
        related_msg_id := NULL;
    END IF;

    -- Check if sender is a vendor
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    
    -- If not found, check profiles (using full_name)
    IF sender_name IS NULL THEN
         SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;
    
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    -- Insert into admin_notifications (Only if needed, usually for system admins)
    -- Note: admin_notifications might not need to be triggered for every regular chat message
    -- but if that was the original intent, we keep it. 
    -- Assuming we want admin notifications for EVERYTHING:
    INSERT INTO public.admin_notifications (
        title, message, type, target_type, created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'new_message', 
        'custom',
        NEW.sender_id
    ) RETURNING id INTO notif_id;

    -- Insert into user_notifications
    INSERT INTO public.user_notifications (
        user_id, 
        notification_id, 
        type, 
        title, 
        message, 
        is_read, 
        created_at,
        related_conversation_id,
        related_message_id
    )
    VALUES (
        NEW.receiver_id, 
        notif_id,
        'new_message',
        jsonb_build_object('key', 'dashboard.notifications.new_message_title')::text,
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name))::text,
        false,
        NOW(),
        related_conv_id,
        related_msg_id
    );
    RETURN NEW;
END;
$function$;

-- 2. Create the missing trigger on the 'messages' table
DROP TRIGGER IF EXISTS on_message_received ON public.messages;
CREATE TRIGGER on_message_received
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message_notification();
