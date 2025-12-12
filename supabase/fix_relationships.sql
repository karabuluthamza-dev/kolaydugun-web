-- Fix missing relationships for PostgREST joins

-- 1. Ensure forum_posts.user_id references profiles.id
-- This allows the query: .select('*, profile:user_id(...)')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_posts_user_id_fkey_profiles'
    ) THEN
        ALTER TABLE public.forum_posts 
        ADD CONSTRAINT forum_posts_user_id_fkey_profiles 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Ensure forum_posts.category_id references forum_categories.id
-- This allows the query: .select('*, category:category_id(...)')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_posts_category_id_fkey'
    ) THEN
        ALTER TABLE public.forum_posts 
        ADD CONSTRAINT forum_posts_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.forum_categories(id);
    END IF;
END $$;

-- 3. Reload Schema Cache (by notifying)
NOTIFY pgrst, 'reload config';
