-- Add scraper_source_url to vendors table
-- This allows us to track the original source URL for imported/poached vendors
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS scraper_source_url TEXT;

-- Add a comment for clarification
COMMENT ON COLUMN public.vendors.scraper_source_url IS 'The original URL from the competitor site where this vendor was first scraped.';
