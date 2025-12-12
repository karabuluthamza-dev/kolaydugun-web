-- ==============================================================================
-- FIX FORUM REPORT SUBMISSION
-- ==============================================================================

-- 1. Allow authenticated users to INSERT into forum_reports
DROP POLICY IF EXISTS "Authenticated Users Can Insert Reports" ON public.forum_reports;
CREATE POLICY "Authenticated Users Can Insert Reports" ON public.forum_reports 
FOR INSERT TO authenticated 
WITH CHECK (true);

-- 2. Allow admins to SELECT/UPDATE (already done in previous fix, but reinforcing)
-- (Assuming public.is_admin() or explicit check exists)
