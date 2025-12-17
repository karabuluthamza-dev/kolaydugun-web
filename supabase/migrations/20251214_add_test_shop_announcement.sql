-- Test Announcement for Shop System (3 Languages)
INSERT INTO public.shop_announcements (
    type,
    title_tr, title_de, title_en,
    content_tr, content_de, content_en,
    target_plans,
    is_active,
    is_pinned,
    created_at,
    updated_at
) VALUES (
    'new_feature',
    '🎉 Shop Sistemi Yayında! (Test)', 
    '🎉 Shop System ist live! (Test)', 
    '🎉 Shop System is Live! (Test)',
    'Bu bir otomatik test duyurusudur. Shop sistemini kontrol etmek için oluşturulmuştur. Keyifli satışlar!',
    'Dies ist eine automatische Testankündigung. Erstellt, um das Shopsystem zu überprüfen. Viel Spaß beim Verkauf!',
    'This is an automatic test announcement. Created to check the Shop system. Happy selling!',
    ARRAY['starter', 'business', 'premium'],
    true,
    true,
    now(),
    now()
);
