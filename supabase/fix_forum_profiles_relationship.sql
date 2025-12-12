-- ==============================================================================
-- FORUM COMMENTS - PROFILES RELATIONSHIP FIX
-- ==============================================================================
-- This script fixes the relationship between forum_comments and profiles table
-- so that Supabase PostgREST can resolve profile:user_id(...) joins

-- forum_comments.user_id → auth.users(id) olarak tanımlı
-- AMA profiles.id = auth.users.id ile aynı olduğundan
-- Supabase'e bu ilişkiyi "hint" olarak vermemiz gerekiyor

-- Option 1: Create a foreign key from forum_comments to profiles
-- Bu sadece profiles'da karşılığı olan user_id'ler için çalışır

-- Önce mevcut constraint'i kontrol et ve varsa atla
DO $$
BEGIN
    -- Check if the FK already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_comments_user_id_profiles_fk'
        AND table_name = 'forum_comments'
    ) THEN
        -- Add FK to profiles table
        ALTER TABLE public.forum_comments
        ADD CONSTRAINT forum_comments_user_id_profiles_fk
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key forum_comments_user_id_profiles_fk created successfully!';
    ELSE
        RAISE NOTICE 'Foreign key already exists, skipping...';
    END IF;
END $$;

-- Same fix for forum_posts if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_posts_user_id_profiles_fk'
        AND table_name = 'forum_posts'
    ) THEN
        ALTER TABLE public.forum_posts
        ADD CONSTRAINT forum_posts_user_id_profiles_fk
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key forum_posts_user_id_profiles_fk created successfully!';
    ELSE
        RAISE NOTICE 'Foreign key for forum_posts already exists, skipping...';
    END IF;
END $$;

-- Verify the relationships
SELECT 
    tc.table_name,
    tc.constraint_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('forum_comments', 'forum_posts')
AND ccu.table_name = 'profiles';
