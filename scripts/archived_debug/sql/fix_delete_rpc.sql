-- Improved Delete Function with Dependency Cleanup
-- This function manually deletes related notifications before deleting the lead.
-- This works even if Foreign Keys are not set to CASCADE.

CREATE OR REPLACE FUNCTION public.delete_lead_admin(lead_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- 1. Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Yetkisiz işlem');
    END IF;

    -- 2. Manually delete related notifications first (Cleanup)
    -- We delete from user_notifications where this lead is referenced
    DELETE FROM public.user_notifications WHERE related_lead_id = lead_id;

    -- Also check admin_notifications if needed (though they usually don't link via FK directly, safe to ignore if no direct FK)
    -- If there's a custom column or logic, we'd delete here too.
    
    -- 3. Now delete the Lead
    DELETE FROM public.leads WHERE id = lead_id;

    -- 4. Return success
    RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
