
-- FINAL FIX for Notifications
-- Run this ENTIRE script in the Supabase SQL Editor

-- 1. CRITICAL: Allow 'created_by' to be NULL (Fixes Guest Quotes failing)
ALTER TABLE public.admin_notifications ALTER COLUMN created_by DROP NOT NULL;

-- 2. Cleanup old triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;
DROP FUNCTION IF EXISTS public.handle_new_quote_notification();
DROP FUNCTION IF EXISTS public.handle_new_message_notification();

-- 3. Trigger Function for QUOTES (using type 'new_quote')
CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    notif_id UUID;
    target_user_id UUID;
BEGIN
    SELECT contact_name, user_id INTO contact_name_text, target_user_id
    FROM public.leads
    WHERE id = NEW.lead_id;

    -- Insert into admin_notifications
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,           -- 'new_quote' for specific badge
        target_type,
        created_by      -- NULL for guests
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir'))),
        'new_quote',
        'custom',
        target_user_id
    ) RETURNING id INTO notif_id;

    -- Insert into user_notifications
    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at)
    VALUES (
        NEW.vendor_id, 
        notif_id,
        jsonb_build_object(
            'type', 'new_quote',
            'title', jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
            'message', jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir')))
        ),
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quote_received
AFTER INSERT ON public.vendor_leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_quote_notification();

-- 4. Trigger Function for MESSAGES (using type 'new_message')
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    notif_id UUID;
BEGIN
    -- Determine Sender Name
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;

    IF sender_name IS NULL THEN
        SELECT COALESCE(first_name || ' ' || last_name, email) INTO sender_name FROM public.users WHERE id = NEW.sender_id;
        IF sender_name IS NULL THEN
             SELECT COALESCE(first_name || ' ' || last_name, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
        END IF;
    END IF;
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    -- Insert into admin_notifications
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,           -- 'new_message' for specific badge
        target_type,
        created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'new_message',
        'custom',
        NEW.sender_id
    ) RETURNING id INTO notif_id;

    -- Insert into user_notifications
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_received
AFTER INSERT ON public.admin_messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message_notification();
