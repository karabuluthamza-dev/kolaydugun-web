-- Sync existing scraper source URLs from imports to vendors table
-- This populates the new scraper_source_url column for vendors already imported
UPDATE public.vendors v
SET scraper_source_url = vi.source_url
FROM public.vendor_imports vi
WHERE vi.created_vendor_id = v.id
AND v.scraper_source_url IS NULL;

-- Also verify if poached vendors can be synced
-- (If they were linked during the process)
