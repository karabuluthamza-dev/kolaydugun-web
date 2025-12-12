-- FINAL FIX: Match Legacy Notification Format
-- The system was using TEXT format, not JSONB!

DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;
DROP FUNCTION IF EXISTS public.handle_new_quote_notification();

-- Create trigger function matching LEGACY format
CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    target_user_id UUID;
    vendor_auth_id UUID;
    notif_id UUID;
BEGIN
    -- Get contact details
    SELECT contact_name, user_id INTO contact_name_text, target_user_id
    FROM public.leads
    WHERE id = NEW.lead_id;

    -- Get vendor's auth ID
    SELECT user_id INTO vendor_auth_id
    FROM public.vendors
    WHERE id = NEW.vendor_id;

    IF vendor_auth_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Insert into admin_notifications (LEGACY FORMAT)
    INSERT INTO public.admin_notifications (
        title,
        message,
        type,
        target_type,
        created_by
    ) VALUES (
        'Yeni İş Fırsatı 💍',  -- Plain TEXT, not JSON
        COALESCE(contact_name_text, 'Misafir') || ' düğünü için fiyat teklifi bekliyor. Detayları görmek için tıklayın.',  -- Plain TEXT
        'admin_announcement',  -- LEGACY type
        'custom',
        target_user_id
    ) RETURNING id INTO notif_id;

    -- Insert into user_notifications (LEGACY FORMAT)
    INSERT INTO public.user_notifications (
        user_id,
        notification_id,
        type,
        title,
        message,
        is_read,
        created_at
    ) VALUES (
        vendor_auth_id,
        notif_id,
        'admin_announcement',  -- LEGACY type
        'Yeni İş Fırsatı 💍',  -- Plain TEXT
        COALESCE(contact_name_text, 'Misafir') || ' düğünü için fiyat teklifi bekliyor. Detayları görmek için tıklayın.',  -- Plain TEXT
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_quote_received
AFTER INSERT ON public.vendor_leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_quote_notification();
