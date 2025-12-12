-- Clean up ALL triggers related to admin notifications
-- We are now using Manual logic on both Frontend (Admin->User) and Backend Edge Function (User->Admin)
-- We must drop these triggers to prevent Duplicate Notification or Conflicts.

DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;
DROP FUNCTION IF EXISTS public.handle_admin_notif_safe();
DROP FUNCTION IF EXISTS public.handle_user_to_admin_notification_only();
DROP FUNCTION IF EXISTS public.handle_admin_message_notification_unified();
DROP FUNCTION IF EXISTS public.handle_admin_message_notification_smart();

-- Confirm clean state

-- ==============================================================================
-- UPDATE UNIFIED TRIGGER ON 'messages' TABLE TO IGNORE ADMIN MESSAGES
-- This ensures no duplicates with Manual Frontend Logic
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    sender_is_admin BOOLEAN;
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
    -- 0. Check if Sender is Admin (Manual Logic Bypass)
    -- We want Manual for Admin -> User to avoid duplicates and have better control.
    SELECT (role = 'admin') INTO sender_is_admin FROM public.profiles WHERE id = NEW.sender_id;
    
    -- Safety: Treat NULL as False
    IF COALESCE(sender_is_admin, FALSE) THEN
        RETURN NEW; -- Skip notification, frontend handles it.
    END IF;

    -- Extra Safety: Check known Admin emails if role is missing (Optional but safer)
    -- IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.sender_id AND email = 'karabuluthamza@gmail.com') THEN
    --    RETURN NEW;
    -- END IF;

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

-- ==============================================================================
-- 5. ATTACH TRIGGERS
-- ==============================================================================

-- Drop if they exist with different names just to be safe
DROP TRIGGER IF EXISTS on_message_created_unified ON public.messages;
DROP TRIGGER IF EXISTS on_admin_message_created_unified ON public.admin_messages;

-- Attach to MESSAGES (Standard Chat)
CREATE TRIGGER on_message_created_unified
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message_notification();

-- Attach to ADMIN_MESSAGES (Legacy Chat)
-- This ensures User -> Admin gets notified (Backend)
-- And Admin -> User is ignored (due to func logic) so Frontend Manual works.
CREATE TRIGGER on_admin_message_created_unified
    AFTER INSERT ON public.admin_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message_notification();

-- Confirm
SELECT 'Triggers applied successfully' as status;
