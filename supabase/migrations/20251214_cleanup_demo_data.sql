-- CLEANUP DEMO DATA
-- Test ve demo için eklenen verileri temizler

-- 1. Demo Duyuruları Sil
DELETE FROM public.shop_announcements 
WHERE title_tr IN (
    '🎉 Shop Sistemi Yayında! (Test)', 
    '👋 Hoşgeldiniz!',
    '👋 Hoşgeldiniz! Başarılı satışlar için ipuçları'
);

-- 2. Demo SSS'leri Sil
DELETE FROM public.shop_faqs 
WHERE question_tr IN (
    'Mağazamı nasıl açabilirim?',
    'Ürün görselleri nasıl olmalı?',
    'Ödemeler ne zaman yapılır?',
    'Nasıl ürün eklerim?',
    'Ürün limiti nedir?',
    'Affiliate sistemi nasıl çalışır?',
    'Planımı nasıl yükseltirim?',
    'Ürünlerim ne zaman onaylanır?',
    'İstatistikler ne anlama geliyor?'
);
