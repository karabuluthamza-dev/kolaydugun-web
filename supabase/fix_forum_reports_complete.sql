-- Fix forum_reports table relationship with profiles
-- Run this in Supabase SQL Editor

-- Check if forum_reports table exists, if not create it
CREATE TABLE IF NOT EXISTS forum_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id)
);

-- If table exists but missing foreign key, add it
DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_reports_reporter_id_fkey' 
        AND table_name = 'forum_reports'
    ) THEN
        -- Try to add the foreign key (may fail if data inconsistency)
        BEGIN
            ALTER TABLE forum_reports 
            ADD CONSTRAINT forum_reports_reporter_id_fkey 
            FOREIGN KEY (reporter_id) REFERENCES profiles(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key, possibly data inconsistency';
        END;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated Users Can Insert Reports" ON forum_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON forum_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON forum_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON forum_reports;

-- Create policies
CREATE POLICY "Authenticated Users Can Insert Reports" ON forum_reports 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Admins can view all reports" ON forum_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update reports" ON forum_reports
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete reports" ON forum_reports
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
