-- ==============================================================================
-- UPDATE get_top_active_users FUNCTION TO INCLUDE forum_avatar_url
-- ==============================================================================
-- Bu fonksiyon En Aktif Üyeler widget'ı için kullanılıyor

-- Önce eski fonksiyonu sil
DROP FUNCTION IF EXISTS get_top_active_users();

CREATE OR REPLACE FUNCTION get_top_active_users()
RETURNS TABLE (
    user_id uuid,
    first_name text,
    last_name text,
    avatar_url text,
    forum_avatar_url text,
    message_count bigint
)
LANGUAGE sql
STABLE
AS $$
    WITH user_counts AS (
        SELECT 
            p.id as user_id,
            p.first_name,
            p.last_name,
            p.avatar_url,
            p.forum_avatar_url,
            (
                SELECT COUNT(*)::bigint 
                FROM forum_comments fc 
                WHERE fc.user_id = p.id AND fc.status = 'published'
            ) + (
                SELECT COUNT(*)::bigint 
                FROM forum_posts fp 
                WHERE fp.user_id = p.id AND fp.status = 'published'
            ) as message_count
        FROM profiles p
        WHERE p.first_name IS NOT NULL  -- İsmi olan kullanıcılar
          AND p.first_name != ''
    )
    SELECT * FROM user_counts 
    WHERE message_count > 0  -- En az 1 mesajı olanlar
    ORDER BY message_count DESC
    LIMIT 5;
$$;

SELECT 'get_top_active_users function fixed - only active users with names!' as result;
