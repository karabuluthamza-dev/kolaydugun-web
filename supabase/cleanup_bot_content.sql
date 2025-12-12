-- ==============================================================================
-- TÜM TEST POSTLARINI VE YORUMLARINI SİL
-- ==============================================================================
-- DİKKAT: Bu TÜM forum içeriğini siler! Sadece test ortamı için!

-- Önce tüm postları listele (kontrol için)
SELECT id, title, slug, user_id, created_at 
FROM forum_posts 
ORDER BY created_at DESC;

-- Eğer yukarıdaki listede silmek istediğiniz postları gördüyseniz,
-- aşağıdaki DELETE komutlarını çalıştırın:

-- 1. Tüm post beğenilerini sil (varsa)
DELETE FROM forum_post_likes;

-- 2. Tüm yorumları sil
DELETE FROM forum_comments;

-- 3. Tüm postları sil
DELETE FROM forum_posts;

SELECT 'All forum content deleted!' as result;
