-- Demo Data for Shop Admin Panel (FAQs and Announcements)

-- 1. FAQs
INSERT INTO public.shop_faqs (
    category,
    question_tr, question_de, question_en,
    answer_tr, answer_de, answer_en,
    display_order,
    is_active
) VALUES 
(
    'general',
    'Mağazamı nasıl açabilirim?',
    'Wie kann ich meinen Shop eröffnen?',
    'How can I open my shop?',
    'Mağaza başvurusu yaptıktan sonra ekibimiz 24 saat içinde başvurunuzu inceler. Onaylandığında ürün yüklemeye başlayabilirsiniz.',
    'Nachdem Sie Ihren Shop beantragt haben, prüft unser Team Ihren Antrag innerhalb von 24 Stunden. Nach der Genehmigung können Sie mit dem Hochladen von Produkten beginnen.',
    'After applying for a shop, our team reviews your application within 24 hours. Once approved, you can start uploading products.',
    1,
    true
),
(
    'products',
    'Ürün görselleri nasıl olmalı?',
    'Wie sollten Produktbilder sein?',
    'What should product images look like?',
    'Görseller kare (1:1) formatta ve yüksek çözünürlükte olmalıdır. Bulanık veya logolu görseller kabul edilmez.',
    'Bilder sollten quadratisch (1:1) und hochauflösend sein. Verschwommene Bilder oder Bilder mit Logos werden nicht akzeptiert.',
    'Images should be square (1:1) and high resolution. Blurry images or images with logos are not accepted.',
    2,
    true
),
(
    'billing',
    'Ödemeler ne zaman yapılır?',
    'Wann werden Zahlungen getätigt?',
    'When are payments made?',
    'Satışlarınızın ödemesi her ayın 1. ve 15. gününde hesabınıza yatırılır.',
    'Zahlungen für Ihre Verkäufe werden am 1. und 15. eines jeden Monats auf Ihr Konto überwiesen.',
    'Payments for your sales are deposited into your account on the 1st and 15th of every month.',
    3,
    true
);

-- 2. Announcement (Welcome)
INSERT INTO public.shop_announcements (
    type,
    title_tr, title_de, title_en,
    content_tr, content_de, content_en,
    target_plans,
    is_active,
    is_pinned
) VALUES (
    'info',
    '👋 Hoşgeldiniz! Başarılı satışlar için ipuçları', 
    '👋 Willkommen! Tipps für erfolgreiche Verkäufe', 
    '👋 Welcome! Tips for successful sales',
    'Mağazanızı öne çıkarmak için profil fotoğrafınızı güncelleyin ve en az 5 ürün ekleyin. Bol kazançlar!',
    'Um Ihren Shop hervorzuheben, aktualisieren Sie Ihr Profilbild und fügen Sie mindestens 5 Produkte hinzu. Viel Erfolg!',
    'To make your shop stand out, update your profile picture and add at least 5 products. Good luck!',
    ARRAY['starter', 'business', 'premium'],
    true,
    false
);
