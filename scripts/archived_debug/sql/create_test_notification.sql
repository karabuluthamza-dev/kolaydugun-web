-- Test Notification
-- Run this in Supabase SQL Editor to create a test notification

SELECT create_notification(
    'review',
    'high',
    'Test Bildirimi - Sistem Çalışıyor! 🎉',
    'Bu bir test bildirimidir. Bildirim sisteminiz başarıyla kuruldu ve çalışıyor!',
    NULL,
    'test'
);
