-- COMPREHENSIVE REAL CONTENT FOR SHOP ADMIN PANEL
-- Based on deep analysis of: 
-- Plan Limits, Tax Rules, Affiliate logic
-- ShopOwnerProducts.jsx (Bulk actions, Main Shop Request, Statuses)
-- ShopOwnerProfile.jsx (Display settings, Trust badges, Multi-language)

-- 1. CLEANUP (Mevcut olanları temizle ki dublike olmasın)
DELETE FROM public.shop_faqs;
DELETE FROM public.shop_announcements;

-- 2. SHOP FAQS (Sık Sorulan Sorular)

-- ----------------------------------------------------------------
-- CATEGORY: GENERAL (Genel Bilgiler)
-- ----------------------------------------------------------------
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'general',
    'KolayDugun Shop nedir?',
    'Was ist der KolayDugun Shop?',
    'What is KolayDugun Shop?',
    'KolayDugun Shop, düğün sektöründeki hizmet sağlayıcıların dijital veya fiziksel ürünlerini satabilecekleri profesyonel bir pazaryeridir.',
    'Der KolayDugun Shop ist ein professioneller Marktplatz, auf dem Dienstleister der Hochzeitsbranche digitale oder physische Produkte verkaufen können.',
    'KolayDugun Shop is a professional marketplace where wedding industry service providers can sell digital or physical products.',
    1,
    true
),
(
    'general',
    'Güven rozetlerini nasıl açarım?',
    'Wie aktiviere ich Vertrauensabzeichen?',
    'How do I enable trust badges?',
    '**Mağaza Profili > Görüntüleme Ayarları** bölümünden "Güven Rozetleri" seçeneğini aktif edebilirsiniz. Bu rozetler (Hızlı Teslimat, Doğrulanmış Satıcı vb.) müşteri güvenini artırır.',
    'Sie können die Option "Vertrauensabzeichen" im Bereich **Shop-Profil > Anzeigeeinstellungen** aktivieren. Diese Abzeichen (Schnelle Lieferung, Verifizierter Verkäufer usw.) erhöhen das Kundenvertrauen.',
    'You can enable "Trust Badges" in the **Shop Profile > Display Settings** section. These badges (Fast Delivery, Verified Seller, etc.) increase customer trust.',
    2,
    true
);

-- ----------------------------------------------------------------
-- CATEGORY: PRODUCTS (Ürün Yönetimi)
-- ----------------------------------------------------------------
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'products',
    'Ürün görsellerini nasıl yüklerim?',
    'Wie lade ich Produktbilder hoch?',
    'How do I upload product images?',
    'Sistemimiz harici görsel bağlantılarını destekler. Görsellerinizi **Imgur, ImgBB veya Google Drive** gibi servislere yükleyip, aldığınız "Doğrudan Bağlantı (Direct Link)" URL''lerini ürün formuna yapıştırmalısınız.',
    'Unser System unterstützt externe Bildlinks. Laden Sie Ihre Bilder auf Dienste wie **Imgur, ImgBB oder Google Drive** hoch und fügen Sie die "Direktlink"-URLs in das Produktformular ein.',
    'Our system supports external image links. Upload your images to services like **Imgur, ImgBB or Google Drive** and paste the "Direct Link" URLs into the product form.',
    10,
    true
),
(
    'products',
    'Aynı anda birden fazla ürün silebilir miyim?',
    'Kann ich mehrere Produkte gleichzeitig löschen?',
    'Can I delete multiple products at once?',
    'Evet. Ürün listesinde sol taraftaki kutucukları işaretleyerek veya "Tümünü Seç" diyerek toplu seçim yapabilir, ardından **"Sil"** butonu ile çoklu silme işlemi yapabilirsiniz.',
    'Ja. Sie können mehrere Produkte auswählen, indem Sie die Kästchen auf der linken Seite markieren oder "Alle auswählen" verwenden, und dann mit der Schaltfläche **"Löschen"** mehrere Produkte entfernen.',
    'Yes. You can select multiple products by checking the boxes on the left or using "Select All", then use the **"Delete"** button to perform a bulk delete.',
    11,
    true
),
(
    'products',
    '"Ana Shop Başvurusu" nedir?',
    'Was ist der "Hauptshop-Antrag"?',
    'What is "Main Shop Request"?',
    'Ürününüzü sadece kendi sayfanızda değil, KolayDugun''ün ana pazaryeri vitrininde de sergilemek isterseniz bu kutucuğu işaretleyin. Editör onayından sonra ürününüz binlerce çiftin görebileceği ana kategorilerde listelenir.',
    'Wenn Sie Ihr Produkt nicht nur auf Ihrer eigenen Seite, sondern auch im Hauptmarktplatz von KolayDugun präsentieren möchten, markieren Sie dieses Kästchen. Nach der redaktionellen Genehmigung wird Ihr Produkt in den Hauptkategorien gelistet.',
    'If you want to showcase your product not only on your own page but also in the main KolayDugun marketplace, check this box. After editorial approval, your product will be listed in main categories visible to thousands of couples.',
    12,
    true
);

-- ----------------------------------------------------------------
-- CATEGORY: BILLING (Paketler ve Ödeme)
-- ----------------------------------------------------------------
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'billing',
    'Paket limitleri nelerdir?',
    'Was sind die Paketlimits?',
    'What are the plan limits?',
    '**Starter:** 5 Ürün\n**Business:** 20 Ürün + İstatistik Paneli\n**Premium:** Sınırsız Ürün + VIP Rozeti + Öncelikli Listeleme.\nFiyatlara %19 KDV (MwSt) dahildir değildir.',
    '**Starter:** 5 Produkte\n**Business:** 20 Produkte + Statistik-Panel\n**Premium:** Unbegrenzte Produkte + VIP-Abzeichen + Prioritätsanzeige.\nPreise verstehen sich zzgl. 19% MwSt.',
    '**Starter:** 5 Products\n**Business:** 20 Products + Analytics Panel\n**Premium:** Unlimited Products + VIP Badge + Priority Listing.\nPrices exclude 19% VAT.',
    20,
    true
);

-- ----------------------------------------------------------------
-- CATEGORY: AFFILIATE
-- ----------------------------------------------------------------
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active) VALUES 
(
    'affiliate',
    'Ne kadar kazanabilirim?',
    'Wie viel kann ich verdienen?',
    'How much can I earn?',
    'Sizin referans kodunuzla kayıt olan her mağazanın ilk paket ödemesinden **%10** komisyon kazanırsınız. Kazancınızı "Cüzdanım" sayfasından takip edebilir ve çekim talebi oluşturabilirsiniz.',
    'Sie verdienen **10%** Provision auf die erste Paketzahlung jedes Shops, der sich mit Ihrem Empfehlungscode anmeldet. Sie können Ihre Einnahmen auf der Seite "Mein Wallet" verfolgen und eine Auszahlung beantragen.',
    'You earn **10%** commission on the first plan payment of every shop that registers with your referral code. You can track your earnings on the "My Wallet" page and request withdrawal.',
    30,
    true
);

-- 3. SHOP ANNOUNCEMENTS (Duyurular)

-- Welcome
INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned) VALUES 
(
    'info',
    '👋 KolayDugun Shop''a Hoş Geldiniz!',
    '👋 Willkommen im KolayDugun Shop!',
    '👋 Welcome to KolayDugun Shop!',
    'Shop paneliniz hazır! Satışa başlamak için:\n\n1. **Profil:** Ayarlardan logonuzu ve kapak görselinizi yükleyin.\n2. **Ürünler:** Ürünlerinizi ekleyin (görsel linki kullanmayı unutmayın).\n3. **Başvuru:** Ürünlerinizi ana vitrinde göstermek için başvuru kutucuğunu işaretleyin.',
    'Ihr Shop-Panel ist bereit! Um mit dem Verkauf zu beginnen:\n\n1. **Profil:** Laden Sie Ihr Logo und Titelbild hoch.\n2. **Produkte:** Fügen Sie Ihre Produkte hinzu (vergessen Sie nicht, Bildlinks zu verwenden).\n3. **Bewerbung:** Markieren Sie das Bewerbungsfeld, um Ihre Produkte im Hauptschaufenster anzuzeigen.',
    'Your Shop panel is ready! To start selling:\n\n1. **Profile:** Upload your logo and cover image via settings.\n2. **Products:** Add your products (remember to use image links).\n3. **Application:** Check the application box to show your products in the main storefront.',
    ARRAY['starter', 'business', 'premium'],
    true,
    true
);

-- Launch
INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned) VALUES 
(
    'new_feature',
    '🚀 Yeni Özellik: Toplu Ürün Yönetimi',
    '🚀 Neues Feature: Massenproduktverwaltung',
    '🚀 New Feature: Bulk Product Management',
    'Artık ürün listesinde çoklu seçim yaparak birden fazla ürünü tek seferde silebilirsiniz. Zamandan tasarruf edin!',
    'Sie können jetzt mehrere Produkte in der Produktliste auswählen und gleichzeitig löschen. Sparen Sie Zeit!',
    'You can now select multiple products in the product list and delete them at once. Save time!',
    ARRAY['starter', 'business', 'premium'],
    true,
    false
);
