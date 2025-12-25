-- Add image support to live_requests
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS dedicated_to text;

-- Storage setup for Media Dedications
-- Note: Bucket 'live-dedications' must be created in the dashboard.
-- Here we set up the RLS policies for storage.

/* 
INSERT INTO storage.buckets (id, name, public) 
VALUES ('live-dedications', 'live-dedications', true)
ON CONFLICT (id) DO NOTHING;
*/

-- Allow public uploads to live-dedications (guests)
CREATE POLICY "Allow public uploads to live-dedications"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'live-dedications');

-- Allow public read of live-dedications
CREATE POLICY "Allow public read of live-dedications"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'live-dedications');
