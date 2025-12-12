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
    target_user_id UUID; -- Computed receiver ID
    
    -- Variables for looking up conversation/vendor details
    conv_user_id UUID;
    conv_vendor_id UUID;
    vendor_auth_id UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- 1. Determine Target User (Receiver) and Related IDs based on table
    ---------------------------------------------------------------------------
    IF TG_TABLE_NAME = 'messages' THEN
        -- "messages" table does NOT have receiver_id. We must calculate it.
        related_conv_id := NEW.conversation_id;
        related_msg_id := NEW.id;
        
        -- Get conversation details (Couple ID and Vendor ID)
        SELECT user_id, vendor_id INTO conv_user_id, conv_vendor_id 
        FROM public.conversations 
        WHERE id = NEW.conversation_id;
        
        -- Get Vendor's Auth ID
        SELECT user_id INTO vendor_auth_id 
        FROM public.vendors 
        WHERE id = conv_vendor_id;
        
        -- Logic: If sender is Couple, receiver is Vendor. If sender is Vendor, receiver is Couple.
        IF NEW.sender_id = conv_user_id THEN
            target_user_id := vendor_auth_id;
        ELSE
            target_user_id := conv_user_id;
        END IF;
        
    ELSE 
        -- "admin_messages" table HAS receiver_id column. Use it directly.
        target_user_id := NEW.receiver_id;
        
        -- Admin chat bypass for FKs (because user_notifications links to 'conversations', not 'admin_conversations')
        related_conv_id := NULL;
        related_msg_id := NULL;
    END IF;

    ---------------------------------------------------------------------------
    -- 2. Determine Sender Name
    ---------------------------------------------------------------------------
    -- Check if sender is a vendor
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    
    -- If not found, check profiles
    IF sender_name IS NULL THEN
         SELECT COALESCE(full_name, email, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    END IF;
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    ---------------------------------------------------------------------------
    -- 3. Create Notification Record (admin_notifications)
    ---------------------------------------------------------------------------
    -- Keep existing logic: Create admin notification for all messages
    INSERT INTO public.admin_notifications (
        title, message, type, target_type, created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'new_message', 
        'custom',
        NEW.sender_id
    ) RETURNING id INTO notif_id;

    ---------------------------------------------------------------------------
    -- 4. Create Notification Record (user_notifications)
    ---------------------------------------------------------------------------
    IF target_user_id IS NOT NULL THEN
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
            target_user_id, -- Used the computed variable
            notif_id,
            'new_message',
            jsonb_build_object('key', 'dashboard.notifications.new_message_title')::text,
            jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name))::text,
            false,
            NOW(),
            related_conv_id,
            related_msg_id
        );
    END IF;

    RETURN NEW;
END;
$function$;
