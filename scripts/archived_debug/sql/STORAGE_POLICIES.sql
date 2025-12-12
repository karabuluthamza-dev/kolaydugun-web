-- Storage Bucket Policies - Run AFTER creating blog-images bucket
-- If you get "policy already exists" error, that's OK - skip it

-- Public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Blog Images Public Access'
    ) THEN
        CREATE POLICY "Blog Images Public Access"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'blog-images');
    END IF;
END $$;

-- Authenticated upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Blog Images Auth Upload'
    ) THEN
        CREATE POLICY "Blog Images Auth Upload"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Authenticated delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Blog Images Auth Delete'
    ) THEN
        CREATE POLICY "Blog Images Auth Delete"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
    END IF;
END $$;
