
-- FIX: Vendor ID Mismatch in Quote Notifications
-- The previous trigger used 'vendor_id' (Profile ID) instead of 'user_id' (Auth ID).
-- This script fixes that lookup.

CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    notif_id UUID;
    target_user_id UUID; -- The user_id of the person asking (if logged in)
    vendor_auth_id UUID; -- The user_id of the vendor (recipient)
BEGIN
    -- 1. Get contact details
    SELECT contact_name, user_id INTO contact_name_text, target_user_id
    FROM public.leads
    WHERE id = NEW.lead_id;

    -- 2. CRITICAL FIX: Get the VENDOR'S AUTH ID properly
    SELECT user_id INTO vendor_auth_id
    FROM public.vendors
    WHERE id = NEW.vendor_id;

    -- If we can't find the vendor's auth ID, we can't notify them.
    IF vendor_auth_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 3. Insert into admin_notifications
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,
        target_type,
        created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir'))),
        'new_quote',
        'custom',
        target_user_id -- Can be NULL for guest
    ) RETURNING id INTO notif_id;

    -- 4. Insert into user_notifications using CORRECT AUTH ID
    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at)
    VALUES (
        vendor_auth_id, -- FIXED: Using Auth ID, not Profile ID
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
