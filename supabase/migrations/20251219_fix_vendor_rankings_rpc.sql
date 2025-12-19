-- Fix for get_vendor_rank_info RPC
-- This migration ensures the function exists and handles null/missing data gracefully

CREATE OR REPLACE FUNCTION public.get_vendor_rank_info(target_vendor_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_category TEXT;
    v_city TEXT;
    v_score INTEGER;
    v_rank INTEGER;
    v_total_in_region INTEGER;
    v_next_vendor_score INTEGER;
    result JSONB;
BEGIN
    -- Get vendor details with defaults
    SELECT 
        COALESCE(category, 'All'), 
        COALESCE(city, 'General'), 
        COALESCE(ai_performance_score, 0)
    INTO v_category, v_city, v_score
    FROM public.vendors 
    WHERE id = target_vendor_id;

    -- If vendor not found
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Vendor not found');
    END IF;

    -- Calculate rank in category AND city
    WITH ranked_vendors AS (
        SELECT id, ai_performance_score,
               RANK() OVER (ORDER BY COALESCE(ai_performance_score, 0) DESC, created_at ASC) as rank
        FROM public.vendors
        WHERE COALESCE(category, 'All') = v_category 
          AND COALESCE(city, 'General') = v_city 
          AND deleted_at IS NULL
    )
    SELECT rank INTO v_rank FROM ranked_vendors WHERE id = target_vendor_id;

    -- Get total vendors in same category/city
    SELECT COUNT(*) INTO v_total_in_region 
    FROM public.vendors 
    WHERE COALESCE(category, 'All') = v_category 
      AND COALESCE(city, 'General') = v_city 
      AND deleted_at IS NULL;

    -- Get score of the vendor exactly 1 rank above
    WITH ranked_vendors AS (
        SELECT ai_performance_score,
               RANK() OVER (ORDER BY COALESCE(ai_performance_score, 0) DESC, created_at ASC) as rank
        FROM public.vendors
        WHERE COALESCE(category, 'All') = v_category 
          AND COALESCE(city, 'General') = v_city 
          AND deleted_at IS NULL
    )
    SELECT ai_performance_score INTO v_next_vendor_score 
    FROM ranked_vendors 
    WHERE rank = GREATEST(1, v_rank - 1) 
    LIMIT 1;

    result := jsonb_build_object(
        'rank', COALESCE(v_rank, 0),
        'total_in_region', COALESCE(v_total_in_region, 0),
        'category', v_category,
        'city', v_city,
        'current_score', v_score,
        'next_rank_score', COALESCE(v_next_vendor_score, v_score),
        'points_to_next', CASE WHEN v_rank > 1 THEN (COALESCE(v_next_vendor_score, v_score) - v_score) ELSE 0 END
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_vendor_rank_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_rank_info(UUID) TO service_role;
