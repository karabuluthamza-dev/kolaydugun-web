-- FINAL CORRECTIVE FIX: Treat Quotes like Messages (Direct Notification)
-- 1. Updates constraints to allow 'new_quote'
-- 2. Updates trigger to insert directly into 'user_notifications' (bypassing admin_notifications)

-- 1. Update Constraint on user_notifications to allow 'new_quote'
DO $$ 
BEGIN
    -- Try to drop existing constraint if name is standard
    ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_type_check;
    
    -- Add constraint with ALL required types
    ALTER TABLE public.user_notifications ADD CONSTRAINT user_notifications_type_check 
    CHECK (type IN ('new_message', 'new_quote', 'admin_announcement', 'announcement', 'campaign', 'system', 'reminder'));
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Constraint update skipped or failed: %', SQLERRM;
END $$;

-- 2. Update the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_quote_notification()
RETURNS TRIGGER AS $$
DECLARE
    contact_name_text TEXT;
    target_user_id UUID;
    vendor_auth_id UUID;
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
        -- Insert logic similar to 'new_message' (Direct insert to user_notifications)
        INSERT INTO public.user_notifications (
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        ) VALUES (
            vendor_auth_id,
            'new_quote',  -- Explicit type for styling
            'Yeni İş Fırsatı 💍',
            COALESCE(contact_name_text, 'Misafir') || ' düğünü için fiyat teklifi bekliyor.',
            false,
            NOW()
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Failsafe: Log error but allow quote creation
    RAISE WARNING 'Notification generation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create trigger
DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;

CREATE TRIGGER on_quote_received
AFTER INSERT ON public.vendor_leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_quote_notification();

-- 4. Re-enable RLS (Security)
ALTER TABLE public.vendor_leads ENABLE ROW LEVEL SECURITY;
