-- 1. Ensure the column exists in user_notifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'related_lead_id') THEN
        ALTER TABLE public.user_notifications ADD COLUMN related_lead_id UUID REFERENCES public.leads(id);
    END IF;
END $$;

-- 2. Update Constraint to Allow 'contact_form'
-- We simply REMOVE the restriction to allow any type (including existing legacy ones)
ALTER TABLE public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_type_check;

-- 3. Update Constraint for user_notifications to Allow 'contact_form'
ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_type_check;

-- 4. Create the Notification Function
CREATE OR REPLACE FUNCTION public.handle_new_lead_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    admin_user record;
    notif_id UUID;
    sender_id UUID;
BEGIN
    -- Determine sender (user_id might be null for guest leads)
    sender_id := NEW.user_id;

    -- Create Master Notification (admin_notifications)
    -- This ensures we have a base record if foreign keys require it
    INSERT INTO public.admin_notifications (
        title, 
        message, 
        type, 
        target_type, 
        created_by
    ) VALUES (
        jsonb_build_object('key', 'Yeni İletişim Talebi'), 
        jsonb_build_object('key', 'Yeni bir form dolduruldu: ' || NEW.contact_name),
        'contact_form', 
        'custom',
        sender_id
    ) RETURNING id INTO notif_id;

    -- Distribute to All Admins
    FOR admin_user IN SELECT id FROM public.profiles WHERE role = 'admin'
    LOOP
        INSERT INTO public.user_notifications (
            user_id,
            notification_id,
            type,
            title,
            message,
            is_read,
            created_at,
            related_lead_id
        ) VALUES (
            admin_user.id,
            notif_id,
            'contact_form',
            'Yeni İletişim Talebi', -- Fallback text
            'Yeni bir form dolduruldu: ' || NEW.contact_name, -- Fallback text
            false,
            NOW(),
            NEW.id
        );
    END LOOP;

    RETURN NEW;
END;
$function$;

-- 5. Re-create the Trigger
DROP TRIGGER IF EXISTS on_lead_created ON public.leads;

CREATE TRIGGER on_lead_created
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_new_lead_notification();
