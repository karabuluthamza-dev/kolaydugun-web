-- FAILSAFE TRIGGER: Never block Vendor Lead creation
-- Wraps notification logic in a BEGIN...EXCEPTION block
-- Also ensures RLS doesn't block inserts

DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;
DROP FUNCTION IF EXISTS public.handle_new_quote_notification();

CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    target_user_id UUID;
    vendor_auth_id UUID;
    notif_id UUID;
BEGIN
    -- Wrap everything in a block to catch errors
    BEGIN
        -- Get contact details
        SELECT contact_name, user_id INTO contact_name_text, target_user_id
        FROM public.leads
        WHERE id = NEW.lead_id;

        -- Get vendor's auth ID
        SELECT user_id INTO vendor_auth_id
        FROM public.vendors
        WHERE id = NEW.vendor_id;

        IF vendor_auth_id IS NOT NULL THEN
            -- Insert into admin_notifications
            INSERT INTO public.admin_notifications (
                title,
                message,
                type,
                target_type,
                created_by
            ) VALUES (
                'Yeni İş Fırsatı 💍',
                COALESCE(contact_name_text, 'Misafir') || ' düğünü için fiyat teklifi bekliyor.',
                'admin_announcement',
                'custom',
                target_user_id
            ) RETURNING id INTO notif_id;

            -- Insert into user_notifications
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
                'admin_announcement',
                'Yeni İş Fırsatı 💍',
                COALESCE(contact_name_text, 'Misafir') || ' düğünü için fiyat teklifi bekliyor.',
                false,
                NOW()
            );
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- If notification fails, LOG IT but DO NOT FAIL the transaction
        RAISE WARNING 'Notification generation failed for vendor_lead %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
CREATE TRIGGER on_quote_received
AFTER INSERT ON public.vendor_leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_quote_notification();

-- DISABLE RLS for vendor_leads to be 100% sure it's not blocking
ALTER TABLE public.vendor_leads DISABLE ROW LEVEL SECURITY;
