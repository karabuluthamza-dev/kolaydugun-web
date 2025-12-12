-- Create a secure function to check if user is admin
-- This bypasses RLS on profiles table to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Update the policy for default_avatars to use the new function
DROP POLICY IF EXISTS "Allow admin full access to avatars" ON public.default_avatars;

CREATE POLICY "Allow admin full access to avatars"
    ON public.default_avatars
    FOR ALL
    USING (is_admin());

-- Also update storage policies to use is_admin() for better security
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND is_admin()
);

DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND is_admin()
);

SELECT 'Avatar deletion RLS fixed successfully!' as result;
