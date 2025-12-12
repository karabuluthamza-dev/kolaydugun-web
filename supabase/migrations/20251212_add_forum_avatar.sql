-- Add forum_avatar_url column to profiles table
-- Run this in Supabase SQL Editor

-- Add the new column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS forum_avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.forum_avatar_url IS 'Forum-specific avatar URL, separate from main profile avatar';

-- RLS policy: Allow users to update their own forum_avatar_url
DROP POLICY IF EXISTS "Users can update own forum_avatar" ON profiles;
CREATE POLICY "Users can update own forum_avatar" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
