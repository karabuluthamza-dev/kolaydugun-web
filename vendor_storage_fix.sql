-- RLS is already enabled on storage.objects by default.
-- We proceed directly to bucket creation and policy definition.

-- 1. Create vendor-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to be safe (avoid duplicates)
DROP POLICY IF EXISTS "Vendor Images Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Vendor Images Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Vendor Images Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Vendor Images Auth Delete" ON storage.objects;

-- 3. Create Public Read Access
CREATE POLICY "Vendor Images Public Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-images');

-- 4. Create Auth Upload Access
-- Allows any authenticated user to upload to vendor-images
-- We could restrict by folder name matching user ID, but the code uses vendor ID.
-- Since mapping user->vendor in RLS is complex, we'll trust the backend/frontend logic for now
-- or we can enforce folder name = vendor_id if we have a way to check it.
-- For now, simple authenticated upload is usually sufficient for MVP.
CREATE POLICY "Vendor Images Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'vendor-images' 
    AND auth.role() = 'authenticated'
);

-- 5. Create Auth Delete Access
CREATE POLICY "Vendor Images Auth Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'vendor-images'
    AND auth.role() = 'authenticated'
);

-- 6. Create Auth Update Access
CREATE POLICY "Vendor Images Auth Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'vendor-images'
    AND auth.role() = 'authenticated'
);
