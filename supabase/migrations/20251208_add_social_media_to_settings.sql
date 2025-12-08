-- Add social_media column to site_settings if it doesn't exist
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{"facebook": "", "instagram": "", "youtube": "", "tiktok": "", "twitter": "", "linkedin": ""}';

-- Update existing row if it exists, or insert default if not
INSERT INTO public.site_settings (id, social_media)
VALUES (1, '{"facebook": "https://www.facebook.com/kolaydugunde.kolaydugun/", "instagram": "https://www.instagram.com/kolaydugun.de/", "youtube": "https://www.youtube.com/@kolaydugun", "tiktok": "https://www.tiktok.com/@kolaydugun.de", "twitter": "", "linkedin": ""}')
ON CONFLICT (id) 
DO UPDATE SET social_media = EXCLUDED.social_media;
