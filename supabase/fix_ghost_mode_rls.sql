-- Fix Ghost Mode: Allow admins to insert bot profiles
-- Run this in Supabase SQL Editor

-- STEP 1: Remove foreign key constraint (profiles.id -> auth.users.id)
-- This allows creating bot profiles without auth.users entries
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- STEP 2: Drop existing insert policy if any
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert bot profiles" ON public.profiles;

-- STEP 3: Allow admins to insert new profiles (for bot creation)
CREATE POLICY "Admins can insert bot profiles" ON public.profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- STEP 4: Also allow admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
