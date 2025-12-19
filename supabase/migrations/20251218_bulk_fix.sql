-- Fix for non-existent is_active column in bulk generation
DROP FUNCTION IF EXISTS public.generate_all_active_vendor_reports();
CREATE OR REPLACE FUNCTION public.generate_all_active_vendor_reports()
RETURNS INTEGER AS $$
DECLARE
    v_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Removed AND is_active = true because it doesn't exist
    FOR v_id IN SELECT id FROM public.vendors WHERE deleted_at IS NULL LOOP
        PERFORM public.generate_vendor_performance_report(v_id);
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
