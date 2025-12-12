-- Add column if not exists
ALTER TABLE public.user_notifications 
ADD COLUMN IF NOT EXISTS related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;

-- Update function to include related_lead_id
CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    notif_id UUID;
    target_user_id UUID;
BEGIN
    -- Get contact name from leads table
    SELECT contact_name, user_id INTO contact_name_text, target_user_id
    FROM public.leads
    WHERE id = NEW.lead_id;

    -- Insert into admin_notifications
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,
        target_type,
        created_by
    ) VALUES (
        jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
        jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir'))),
        'system',
        'custom',
        target_user_id
    ) RETURNING id INTO notif_id;

    -- Link to Vendor with related_lead_id
    INSERT INTO public.user_notifications (user_id, notification_id, notification, is_read, created_at, related_lead_id)
    VALUES (
        NEW.vendor_id, 
        notif_id,
        jsonb_build_object(
            'type', 'new_quote',
            'title', jsonb_build_object('key', 'dashboard.notifications.new_quote_title'),
            'message', jsonb_build_object('key', 'dashboard.notifications.new_quote_message', 'args', jsonb_build_object('name', COALESCE(contact_name_text, 'Misafir')))
        ),
        false,
        NOW(),
        NEW.lead_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
