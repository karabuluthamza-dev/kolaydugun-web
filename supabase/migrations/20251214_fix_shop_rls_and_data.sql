-- FIX RLS and INSERT DEMO DATA
-- Bu dosya hem yetkilendirme sorununu çözer hem de eksik verileri tamamlar

-- 1. RLS Policy Fix (Yetkilendirme Düzeltmesi)
-- auth.users tablosuna erişim yerine auth.jwt() kullanımı daha güvenli ve hatasızdır
DROP POLICY IF EXISTS "Admin can manage announcements" ON shop_announcements;
DROP POLICY IF EXISTS "Admin can manage FAQs" ON shop_faqs;

CREATE POLICY "Admin can manage announcements" ON shop_announcements
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can manage FAQs" ON shop_faqs
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 2. Demo Duyuru Ekle (Eğer yoksa)
INSERT INTO public.shop_announcements (
    type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned
)
SELECT 'new_feature', '🎉 Shop Sistemi Yayında! (Test)', '🎉 Shop System ist live! (Test)', '🎉 Shop System is Live! (Test)',
       'Bu bir otomatik test duyurusudur. Shop sistemini kontrol etmek için oluşturulmuştur.', 
       'Dies ist eine automatische Testankündigung.', 
       'This is an automatic test announcement.',
       ARRAY['starter', 'business', 'premium'], true, true
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_announcements WHERE title_tr = '🎉 Shop Sistemi Yayında! (Test)'
);

INSERT INTO public.shop_announcements (
    type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned
)
SELECT 'info', '👋 Hoşgeldiniz!', '👋 Willkommen!', '👋 Welcome!',
       'Mağazanızı öne çıkarmak için profil fotoğrafınızı güncelleyin.', 
       'Profilbild aktualisieren.', 
       'Update profile picture.',
       ARRAY['starter', 'business', 'premium'], true, false
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_announcements WHERE title_tr = '👋 Hoşgeldiniz!'
);

-- 3. Demo SSS Ekle (Eğer yoksa)
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general', 'Mağazamı nasıl açabilirim?', 'Wie kann ich meinen Shop eröffnen?', 'How can I open my shop?',
       'Başvurunuz onaylandıktan sonra panelden yönetebilirsiniz.', '...', '...', 1, true
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Mağazamı nasıl açabilirim?'
);

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products', 'Ürün görselleri nasıl olmalı?', 'Wie sollten Produktbilder sein?', 'What should product images look like?',
       'Kare (1:1) formatta ve yüksek çözünürlükte olmalıdır.', '...', '...', 2, true
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Ürün görselleri nasıl olmalı?'
);
