-- FIX: Allow Couples to Submit Quote Requests
-- The RLS policy was blocking couples from creating vendor_leads entries

-- 1. Check existing policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'vendor_leads';

-- 2. Add policy to allow INSERT for authenticated users (couples submitting quotes)
CREATE POLICY "Allow authenticated users to create vendor leads"
ON public.vendor_leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Verify the new policy
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'vendor_leads';
