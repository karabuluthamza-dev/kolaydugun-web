-- Migration: Fix Supabase Security Advisor Issues
-- Description: Enables RLS on critical tables and sets appropriate policies for Admins and the Scraper bot.

BEGIN;

-- ---------------------------------------------------------
-- 1. Table: public.vendor_imports
-- ---------------------------------------------------------

-- Ensure RLS is enabled (Security Advisor fix)
ALTER TABLE public.vendor_imports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow scraper bot (anon/authenticated) to insert new data
DROP POLICY IF EXISTS "Allow anonymous inserts for scraper" ON public.vendor_imports;
CREATE POLICY "Allow anonymous inserts for scraper" ON public.vendor_imports
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow admins to manage (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage vendor imports" ON public.vendor_imports;
CREATE POLICY "Admins can manage vendor imports" ON public.vendor_imports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ---------------------------------------------------------
-- 2. Table: public.scraper_status
-- ---------------------------------------------------------

-- Enable RLS (Security Advisor fix)
ALTER TABLE public.scraper_status ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can see the status (required for Admin Dashboard UI)
DROP POLICY IF EXISTS "Authenticated users can select scraper_status" ON public.scraper_status;
CREATE POLICY "Authenticated users can select scraper_status" ON public.scraper_status
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Admins can manage scraper_status (triggering, updating logs)
DROP POLICY IF EXISTS "Admins can manage scraper_status" ON public.scraper_status;
CREATE POLICY "Admins can manage scraper_status" ON public.scraper_status
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMIT;
