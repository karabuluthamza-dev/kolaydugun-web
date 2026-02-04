-- Migration: Add display_background_url to live_events
-- Purpose: Allow DJs to set a custom background image for the TV display screen
-- Date: 2026-02-04

-- Add display_background_url column (stores external image URL)
ALTER TABLE public.live_events 
ADD COLUMN IF NOT EXISTS display_background_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.live_events.display_background_url IS 'External URL for custom TV display background image. Supports direct image links (Imgur, Google Drive, etc.)';
