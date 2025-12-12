CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    sender_name TEXT;
    notif_id UUID;
BEGIN
    -- Check if sender is a vendor
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    
    -- If not found, check profiles (using full_name)
    IF sender_name IS NULL THEN
         SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;
    
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    -- Insert into admin_notifications
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
    -- CRITICAL FIX: related_conversation_id and related_message_id are set to NULL
    -- because they have Foreign Key constraints to 'conversations' and 'messages' tables.
    -- Admin chat IDs exist in 'admin_conversations' and 'admin_messages', so they violate the FK.
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
        NULL, -- FK bypass
        NULL  -- FK bypass
    );
    RETURN NEW;
END;
$function$;
