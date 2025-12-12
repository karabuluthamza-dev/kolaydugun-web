-- Create forum_likes table for post/comment likes
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.forum_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure user can only like once per post/comment
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- Enable RLS
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read likes" ON public.forum_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert likes" ON public.forum_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own likes" ON public.forum_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to insert likes (for bots)
CREATE POLICY "Admins can insert any likes" ON public.forum_likes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON public.forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment ON public.forum_likes(comment_id);
