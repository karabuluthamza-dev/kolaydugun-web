-- Add function to swap popular cities order atomically
-- This ensures both updates happen in a single transaction

CREATE OR REPLACE FUNCTION swap_popular_cities_order(
    city_id_1 UUID,
    city_id_2 UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run with function creator's permissions
AS $$
DECLARE
    order_1 INTEGER;
    order_2 INTEGER;
BEGIN
    -- Get current orders
    SELECT display_order INTO order_1 FROM admin_popular_cities WHERE id = city_id_1;
    SELECT display_order INTO order_2 FROM admin_popular_cities WHERE id = city_id_2;
    
    -- Swap them
    UPDATE admin_popular_cities SET display_order = order_2 WHERE id = city_id_1;
    UPDATE admin_popular_cities SET display_order = order_1 WHERE id = city_id_2;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION swap_popular_cities_order(UUID, UUID) TO authenticated;
