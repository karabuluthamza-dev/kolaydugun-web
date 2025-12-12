-- Fix RLS policy for vendors table - COMPLETE FIX
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing select policies on vendors to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read vendor public info" ON vendors;
DROP POLICY IF EXISTS "Public vendors are viewable by everyone" ON vendors;
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON vendors;
DROP POLICY IF EXISTS "Enable read access for all users" ON vendors;

-- Create a simple policy allowing everyone to read vendor data
CREATE POLICY "Anyone can read vendor public info" ON vendors
    FOR SELECT 
    TO public
    USING (true);

-- Also ensure authenticated users can read
CREATE POLICY "Authenticated users can read vendor info" ON vendors
    FOR SELECT 
    TO authenticated
    USING (true);
