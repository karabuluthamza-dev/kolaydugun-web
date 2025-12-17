-- REAL CONTENT FOR SHOP ADMIN PANEL
-- Based on: AdminShopPlans.jsx and AdminShopSettings.jsx
-- Multi-language: TR, DE, EN

-- 1. SHOP FAQS (Sık Sorulan Sorular)

-- CATEGORY: GENERAL (Genel)
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'general',
    'KolayDugun Shop nedir?',
    'Was ist der KolayDugun Shop?',
    'What is KolayDugun Shop?',
    'KolayDugun Shop, düğün sektöründeki hizmet sağlayıcıların (DJ, Fotoğrafçı, Organizasyon vb.) kendi dijital veya fiziksel ürünlerini satabilecekleri, paketlerini sergileyebilecekleri bir pazaryeridir.',
    'Der KolayDugun Shop ist ein Marktplatz, auf dem Dienstleister der Hochzeitsbranche (DJs, Fotografen, Planer usw.) ihre digitalen oder physischen Produkte verkaufen und ihre Pakete präsentieren können.',
    'KolayDugun Shop is a marketplace where wedding industry service providers (DJs, Photographers, Planners, etc.) can sell their digital or physical products and showcase their packages.',
    1,
    true
);

-- CATEGORY: PLANS (Faturalandırma/Planlar - Plans category mapping to 'billing' or similar. We used 'billing' in UI)
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'billing',
    'Hangi paketleri seçebilirim?',
    'Welche Pakete kann ich wählen?',
    'Which plans can I choose?',
    'Üç farklı paketimiz bulunmaktadır:\n\n1. **Starter (€19/ay)**: 5 Ürün Limiti\n2. **Business (€39/ay)**: 20 Ürün Limiti + İstatistikler\n3. **Premium (€69/ay)**: Sınırsız Ürün + VIP Rozeti + Öncelikli Listeleme',
    'Wir haben drei verschiedene Pakete:\n\n1. **Starter (€19/Monat)**: 5 Produkte\n2. **Business (€39/Monat)**: 20 Produkte + Statistiken\n3. **Premium (€69/Monat)**: Unbegrenzte Produkte + VIP-Abzeichen + Prioritätsanzeige',
    'We offer three different plans:\n\n1. **Starter (€19/mo)**: 5 Product Limit\n2. **Business (€39/mo)**: 20 Product Limit + Analytics\n3. **Premium (€69/mo)**: Unlimited Products + VIP Badge + Priority Listing',
    2,
    true
),
(
    'billing',
    'Fiyatlara KDV dahil mi?',
    'Sind die Preise inklusive MwSt.?',
    'Do prices include VAT?',
    'Hayır, belirtilen paket fiyatları net rakamlardır. Faturanıza yasal olarak **%19 KDV (MwSt)** eklenir.',
    'Nein, die angegebenen Paketpreise sind Nettopreise. Gesetzlich werden **19% MwSt.** zu Ihrer Rechnung hinzugefügt.',
    'No, the listed plan prices are net. Legally, **19% VAT (MwSt)** is added to your invoice.',
    3,
    true
);

-- CATEGORY: PRODUCTS (Ürünler)
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'products',
    'Ürün onayı ne kadar sürer?',
    'Wie lange dauert die Produktgenehmigung?',
    'How long does product approval take?',
    'Yüklediğiniz ürünler editörlerimiz tarafından incelenir. Genellikle **24-48 saat** içinde onaylanır veya düzeltme talebi iletilir.',
    'Ihre hochgeladenen Produkte werden von unseren Redakteuren überprüft. Normalerweise werden sie innerhalb von **24-48 Stunden** genehmigt oder es wird eine Korrektur angefordert.',
    'Your uploaded products are reviewed by our editors. Typically approved within **24-48 hours** or a correction request is sent.',
    4,
    true
),
(
    'products',
    'Ürün görsel kuralları nelerdir?',
    'Was sind die Regeln für Produktbilder?',
    'What are the product image rules?',
    'Görseller **kare (1:1)** formatta ve yüksek çözünürlükte olmalıdır. Üzerinde logo, filigran veya iletişim bilgisi bulunan görseller kabul edilmez.',
    'Bilder müssen im **quadratischen (1:1)** Format und hochauflösend sein. Bilder mit Logos, Wasserzeichen oder Kontaktinformationen werden nicht akzeptiert.',
    'Images must be in **square (1:1)** format and high resolution. Images with logos, watermarks, or contact info are not accepted.',
    5,
    true
);

-- CATEGORY: AFFILIATE (Affiliate)
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'affiliate',
    'Affiliate geliri ne kadar?',
    'Wie hoch ist das Affiliate-Einkommen?',
    'How much is affiliate income?',
    'Davet ettiğiniz her yeni mağaza sahibi için, yaptıkları ilk paket ödemesinin **%10**''unu komisyon olarak kazanırsınız.',
    'Für jeden neuen Shop-Besitzer, den Sie einladen, erhalten Sie **10%** der ersten Paketzahlung als Provision.',
    'For every new shop owner you invite, you earn **10%** of their first plan payment as commission.',
    6,
    true
),
(
    'affiliate',
    'Cookie süresi nedir?',
    'Was ist die Cookie-Dauer?',
    'What is the cookie duration?',
    'Referans linkiniz tıklandıktan sonra **30 gün** boyunca geçerlidir. Bu süre içinde yapılan kayıtlar sizin referansınız sayılır.',
    'Ihr Empfehlungslink ist **30 Tage** nach dem Klick gültig. Registrierungen innerhalb dieses Zeitraums zählen als Ihre Empfehlung.',
    'Your referral link is valid for **30 days** after clicking. Registrations within this period count as your referral.',
    7,
    true
);

-- 2. SHOP ANNOUNCEMENTS (Duyurular)

-- WELCOME MESSAGE
INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned) VALUES 
(
    'info',
    '👋 KolayDugun Shop''a Hoş Geldiniz!',
    '👋 Willkommen im KolayDugun Shop!',
    '👋 Welcome to KolayDugun Shop!',
    'Shop paneliniz artık aktif! Profilinizi düzenleyerek ve ilk ürünlerinizi ekleyerek satış yapmaya başlayabilirsiniz.
    
    📌 **Başlarken:**
    1. Mağaza Ayarları''ndan profil fotoğrafınızı yükleyin.
    2. "Ürünlerim" menüsünden hizmet veya ürünlerinizi ekleyin.
    3. Onay sürecini takip edin.',
    
    'Ihr Shop-Panel ist jetzt aktiv! Sie können mit dem Verkauf beginnen, indem Sie Ihr Profil bearbeiten und Ihre ersten Produkte hinzufügen.
    
    📌 **Erste Schritte:**
    1. Laden Sie Ihr Profilbild in den Shop-Einstellungen hoch.
    2. Fügen Sie Ihre Dienstleistungen oder Produkte über das Menü "Meine Produkte" hinzu.
    3. Verfolgen Sie den Genehmigungsprozess.',
    
    'Your Shop panel is now active! You can start selling by editing your profile and adding your first products.
    
    📌 **Getting Started:**
    1. Upload your profile picture in Shop Settings.
    2. Add your services or products from the "My Products" menu.
    3. Follow the approval process.',
    ARRAY['starter', 'business', 'premium'],
    true,
    true
);

-- LAUNCH ANNOUNCEMENT
INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned) VALUES 
(
    'new_feature',
    '🚀 Shop Sistemi Yayında!',
    '🚀 Shop System ist live!',
    '🚀 Shop System is Live!',
    'Uzun süredir üzerinde çalıştığımız pazaryeri sistemimiz yayına girdi. Artık ürünlerinizi binlerce potansiyel müşteriye ulaştırabilirsiniz. Detaylar ve kullanım ipuçları için SSS bölümünü incelemeyi unutmayın.',
    'Unser Marktplatz-System, an dem wir schon lange arbeiten, ist jetzt live. Jetzt können Sie Tausende potenzieller Kunden erreichen. Vergessen Sie nicht, den FAQ-Bereich für Details und Tipps zu besuchen.',
    'Our marketplace system, which we have been working on for a long time, is now live. Now you can reach thousands of potential customers. Do not forget to check the FAQ section for details and tips.',
    ARRAY['starter', 'business', 'premium'],
    true,
    false
);
