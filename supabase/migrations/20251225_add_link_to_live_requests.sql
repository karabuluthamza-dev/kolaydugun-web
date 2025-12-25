-- Add link and metadata columns to live_requests for integrated search
-- Date: 2024-12-25

ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS song_link text;
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.live_requests.song_link IS 'Direct link to the song (e.g., iTunes, Spotify, YouTube)';
COMMENT ON COLUMN public.live_requests.metadata IS 'Rich metadata like artwork URL, preview URL, album name';
