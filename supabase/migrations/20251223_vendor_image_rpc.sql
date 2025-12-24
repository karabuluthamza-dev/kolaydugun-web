-- RPC function to get vendors with gallery images
-- This is needed because Supabase JS SDK has issues with JSONB array filtering

CREATE OR REPLACE FUNCTION get_vendors_with_images(
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS SETOF vendors AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM vendors
    WHERE deleted_at IS NULL
      AND gallery IS NOT NULL
      AND jsonb_array_length(gallery) > 0
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RPC function to get vendors WITHOUT gallery images
CREATE OR REPLACE FUNCTION get_vendors_without_images(
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS SETOF vendors AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM vendors
    WHERE deleted_at IS NULL
      AND (gallery IS NULL OR jsonb_array_length(gallery) = 0)
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Count vendors with images
CREATE OR REPLACE FUNCTION count_vendors_with_images()
RETURNS INT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INT
        FROM vendors
        WHERE deleted_at IS NULL
          AND gallery IS NOT NULL
          AND jsonb_array_length(gallery) > 0
    );
END;
$$ LANGUAGE plpgsql;

-- Count vendors without images
CREATE OR REPLACE FUNCTION count_vendors_without_images()
RETURNS INT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INT
        FROM vendors
        WHERE deleted_at IS NULL
          AND (gallery IS NULL OR jsonb_array_length(gallery) = 0)
    );
END;
$$ LANGUAGE plpgsql;
