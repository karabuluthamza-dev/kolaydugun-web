-- Add source column to vendors table for War Room functionality
-- This tracks where each vendor entry came from (e.g., 'war_room', 'imported', 'user_created')

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user_created';

-- Add an index for faster lookups by source
CREATE INDEX IF NOT EXISTS idx_vendors_source ON public.vendors(source);

-- Add a comment for clarification
COMMENT ON COLUMN public.vendors.source IS 'Origin of the vendor entry: war_room, imported, user_created, scraper, etc.';
