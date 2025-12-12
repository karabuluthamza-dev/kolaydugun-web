-- Fix RLS policy for forum_categories to allow admin updates
-- Run this in Supabase SQL Editor

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Admins can update forum categories" ON forum_categories;

-- Create new policy allowing admins to update
CREATE POLICY "Admins can update forum categories" ON forum_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Also ensure admin can insert (for upsert)
DROP POLICY IF EXISTS "Admins can insert forum categories" ON forum_categories;
CREATE POLICY "Admins can insert forum categories" ON forum_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
