-- Add og_image_url column to site_settings if it doesn't exist
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS og_image_url text;

-- Optional: Update with a default if needed, or leave null
-- UPDATE public.site_settings SET og_image_url = '...' WHERE id = 1;
