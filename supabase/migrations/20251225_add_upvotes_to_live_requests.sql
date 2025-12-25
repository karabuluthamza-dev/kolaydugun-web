-- Add upvote columns to live_requests
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS upvote_count integer DEFAULT 0;
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS upvoted_by jsonb DEFAULT '[]'::jsonb;

-- Function to handle upvoting securely
CREATE OR REPLACE FUNCTION upvote_request(request_id uuid, device_id text)
RETURNS void AS $$
BEGIN
    UPDATE public.live_requests
    SET 
        upvote_count = upvote_count + 1,
        upvoted_by = upvoted_by || jsonb_build_array(device_id)
    WHERE 
        id = request_id 
        AND NOT (upvoted_by @> jsonb_build_array(device_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
