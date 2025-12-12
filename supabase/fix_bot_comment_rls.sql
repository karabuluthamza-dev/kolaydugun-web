-- ==============================================================================
-- FIX FORUM COMMENTS FOREIGN KEY CONSTRAINT
-- ==============================================================================
-- Sorun: forum_comments.user_id -> users tablosuna FK constraint var
-- Botlar sadece profiles tablosunda, users tablosunda yok
-- Çözüm: FK constraint'i kaldır

-- 1. forum_comments user_id FK constraint'i kaldır
ALTER TABLE public.forum_comments 
DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey;

ALTER TABLE public.forum_comments 
DROP CONSTRAINT IF EXISTS forum_comments_user_id_users_fkey;

ALTER TABLE public.forum_comments 
DROP CONSTRAINT IF EXISTS fk_forum_comments_user_id;

-- 2. forum_posts için de aynısını yap (varsa)
ALTER TABLE public.forum_posts 
DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;

ALTER TABLE public.forum_posts 
DROP CONSTRAINT IF EXISTS forum_posts_user_id_users_fkey;

ALTER TABLE public.forum_posts 
DROP CONSTRAINT IF EXISTS fk_forum_posts_user_id;

-- 3. RLS'yi tekrar aç (güvenlik için)
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

SELECT 'Foreign key constraints removed! Bot comments should work now.' as result;
