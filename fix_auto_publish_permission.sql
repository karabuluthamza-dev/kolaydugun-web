
-- Update the auto-publish function to use SECURITY DEFINER
-- This allows it to update posts even if the user (e.g. anonymous visitor) 
-- doesn't have permission to update the "posts" table directly.

CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE posts
    SET 
        status = 'published',
        published_at = NOW()
    WHERE status = 'scheduled'
        AND scheduled_for IS NOT NULL
        AND scheduled_for <= NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
