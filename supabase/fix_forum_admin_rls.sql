-- ==============================================================================
-- FORUM ADMIN RLS FIX
-- ==============================================================================
-- Bu script admin kullanıcıların forum postları ve yorumları üzerinde
-- tam kontrol sahibi olmasını sağlar

-- 1. Forum Posts için Admin SELECT politikası ekle
-- Admin tüm postları görebilmeli (published, hidden, banned dahil)
DROP POLICY IF EXISTS "Admin View All Posts" ON public.forum_posts;
CREATE POLICY "Admin View All Posts" ON public.forum_posts 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Forum Comments için Admin SELECT politikası ekle
DROP POLICY IF EXISTS "Admin View All Comments" ON public.forum_comments;
CREATE POLICY "Admin View All Comments" ON public.forum_comments 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Moderation Logs için INSERT politikası
DROP POLICY IF EXISTS "Admin Insert Logs" ON public.moderation_logs;
CREATE POLICY "Admin Insert Logs" ON public.moderation_logs 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Moderation Logs için SELECT politikası
DROP POLICY IF EXISTS "Admin View Logs" ON public.moderation_logs;
CREATE POLICY "Admin View Logs" ON public.moderation_logs 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Forum Reports için Admin politikaları
DROP POLICY IF EXISTS "Admin View Reports" ON public.forum_reports;
CREATE POLICY "Admin View Reports" ON public.forum_reports 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Update Reports" ON public.forum_reports;
CREATE POLICY "Admin Update Reports" ON public.forum_reports 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Test: Bu script'i çalıştırdıktan sonra admin:
-- - Tüm post ve yorumları görebilmeli
-- - Gizle/Yayınla/Sil işlemlerini yapabilmeli
-- - Moderation loglara kayıt ekleyebilmeli

SELECT 'Forum Admin RLS policies created successfully!' as result;
