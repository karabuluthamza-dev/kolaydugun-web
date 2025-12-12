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
    
    -- If not found, check profiles (INSTEAD of users)
    IF sender_name IS NULL THEN
         SELECT COALESCE(first_name || ' ' || last_name, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;
    
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    INSERT INTO public.admin_notifications (
        title, message, type, target_type, created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'new_message', 
        'custom',
        NEW.sender_id
    ) RETURNING id INTO notif_id;

    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at)
    VALUES (
        NEW.receiver_id, 
        notif_id,
        jsonb_build_object(
            'type', 'new_message',
            'title', jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
            'message', jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name))
        ),
        false,
        NOW()
    );
    RETURN NEW;
END;
$function$;
