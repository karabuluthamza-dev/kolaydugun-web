-- Create default_avatars table
CREATE TABLE IF NOT EXISTS public.default_avatars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.default_avatars ENABLE ROW LEVEL SECURITY;

-- Create policies for default_avatars
-- Allow public read access (or authenticated) to active avatars
DROP POLICY IF EXISTS "Allow public read access to active avatars" ON public.default_avatars;
CREATE POLICY "Allow public read access to active avatars"
    ON public.default_avatars
    FOR SELECT
    USING (is_active = true OR auth.role() = 'service_role' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Allow admin full access to avatars
DROP POLICY IF EXISTS "Allow admin full access to avatars" ON public.default_avatars;
CREATE POLICY "Allow admin full access to avatars"
    ON public.default_avatars
    FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Storage Policies for 'avatars' bucket

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Admin Upload Access (for default avatars)
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
);

-- Policy: Admin Delete Access
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
);

-- Policy: User Upload Access (for their own profile)
DROP POLICY IF EXISTS "User Upload Access" ON storage.objects;
CREATE POLICY "User Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (name LIKE auth.uid()::text || '/%')
);
