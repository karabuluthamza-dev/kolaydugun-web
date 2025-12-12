
-- URGENT FIX: Allow new notification types in Database
-- Run this script in Supabase SQL Editor

-- 1. Remove old restriction on 'type' column
ALTER TABLE public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_type_check;

-- 2. Add NEW restriction that allows 'new_quote' and 'new_message'
ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_type_check 
    CHECK (type IN ('announcement', 'campaign', 'system', 'new_quote', 'new_message'));

-- 3. Ensure 'created_by' can be NULL (for Guest quotes)
ALTER TABLE public.admin_notifications ALTER COLUMN created_by DROP NOT NULL;

-- 4. Re-apply the Trigger Functions (Just to be safe and ensure they use the new types)
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

    INSERT INTO public.admin_notifications (
        title, message, type, target_type, created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir'))),
        'new_quote', -- matches new constraint
        'custom',
        target_user_id
    ) RETURNING id INTO notif_id;

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

CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    notif_id UUID;
BEGIN
    SELECT business_name INTO sender_name FROM public.vendors WHERE user_id = NEW.sender_id;
    IF sender_name IS NULL THEN
        SELECT COALESCE(first_name || ' ' || last_name, email) INTO sender_name FROM public.users WHERE id = NEW.sender_id;
        IF sender_name IS NULL THEN
             SELECT COALESCE(first_name || ' ' || last_name, 'Kullanıcı') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
        END IF;
    END IF;
    sender_name := COALESCE(sender_name, 'Bir Kullanıcı');

    INSERT INTO public.admin_notifications (
        title, message, type, target_type, created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_message_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_message_message', 'args', jsonb_build_object('name', sender_name)),
        'new_message', -- matches new constraint
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
