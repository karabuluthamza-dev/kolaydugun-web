-- MASTER FAQ CLEANUP & ORGANIZATION
-- Tüm FAQ'ları düzenle, tekrarları kaldır, eksikleri ekle
-- Tarih: 2024-12-16

-- ============================================
-- PART 1: SITE_FAQS TEMİZLİK (Ana Site SSS)
-- ============================================

-- Tekrar eden soruları kaldır (question_tr bazında)
DELETE FROM public.site_faqs 
WHERE id NOT IN (
    SELECT DISTINCT ON (question_tr) id 
    FROM public.site_faqs 
    ORDER BY question_tr, created_at ASC
);

-- Shop Marketplace FAQs - Sadece yoksa ekle (WHERE NOT EXISTS)
-- 1. Mağaza bölümünde ne tür ürünler bulabilirim?
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'general',
    'Mağaza bölümünde ne tür ürünler bulabilirim?',
    'Welche Produkte finde ich im Shop-Bereich?',
    'What kind of products can I find in the shop section?',
    'Mağaza bölümümüzde düğün hazırlığınız için özenle seçilmiş ürünler bulabilirsiniz: dekorasyon malzemeleri, masa süslemeleri, hediye fikirleri, gelin aksesuarları ve daha fazlası. Ürünlerimiz kalite standartlarına göre editörlerimiz tarafından seçilmektedir.',
    'In unserem Shop-Bereich finden Sie sorgfältig ausgewählte Produkte für Ihre Hochzeitsvorbereitung: Dekorationsmaterialien, Tischdekorationen, Geschenkideen, Brautaccessoires und mehr.',
    'In our shop section, you can find carefully curated products for your wedding preparation: decoration materials, table decorations, gift ideas, bridal accessories and more.',
    80, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Mağaza bölümünde ne tür ürünler bulabilirim?');

-- 2. Tedarikçi olarak mağaza açma
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Tedarikçi olarak kendi mağazamı açabilir miyim?',
    'Kann ich als Anbieter meinen eigenen Shop eröffnen?',
    'Can I open my own shop as a vendor?',
    'Evet! Tedarikçi olarak KolayDugun platformunda kendi mağazanızı açabilirsiniz. Mağazanızda dijital davetiyeler, süslemeler, hediye paketleri ve düğünle ilgili her türlü ürünü satabilirsiniz. Başvuru için Mağaza menüsünden başvuru formunu doldurun.',
    'Ja! Als Anbieter können Sie Ihren eigenen Shop auf der KolayDugun-Plattform eröffnen. Füllen Sie das Bewerbungsformular im Shop-Menü aus.',
    'Yes! As a vendor, you can open your own shop on the KolayDugun platform. Fill out the application form from the Shop menu.',
    31, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Tedarikçi olarak kendi mağazamı açabilir miyim?');

-- 3. Demo mağaza
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'general',
    'Demo mağazayı nasıl görebilirim?',
    'Wie kann ich den Demo-Shop sehen?',
    'How can I see the demo shop?',
    'Tedarikçi panelindeki Mağaza bölümünden veya ana sayfadaki promosyon alanından demo mağazayı inceleyebilirsiniz. Demo mağazada gerçek ürün örnekleri ve yönetim paneli önizlemesi görebilirsiniz.',
    'Sie können den Demo-Shop im Anbieter-Panel oder auf der Startseite ansehen. Im Demo-Shop sehen Sie echte Produktbeispiele.',
    'You can view the demo shop from the vendor panel or homepage. In the demo shop, you can see real product examples.',
    81, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Demo mağazayı nasıl görebilirim?');

-- 4. Ana mağazada ürün sergileme
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Ürünlerim ana mağazada da görünebilir mi?',
    'Können meine Produkte auch im Hauptshop erscheinen?',
    'Can my products also appear in the main shop?',
    'Evet! Ana mağazamızda çiftlerin en çok aradığı ürünler sergilenmektedir. Ürününüzün burada yer alması için başvuru yapabilirsiniz. Başvuruda beklentiler: yüksek kaliteli görseller, detaylı ürün açıklamaları ve doğru bilgiler. Her başvuru ekibimiz tarafından değerlendirilir. Not: Kendi mağazanızda istediğiniz ürünü özgürce ekleyebilirsiniz.',
    'Ja! Sie können sich bewerben, damit Ihr Produkt im Hauptshop erscheint. Erwartungen: hochwertige Bilder, detaillierte Beschreibungen. In Ihrem eigenen Shop können Sie frei Produkte hinzufügen.',
    'Yes! You can apply for your product to appear in the main shop. Expectations: high-quality images, detailed descriptions. In your own shop, you can freely add products.',
    32, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Ürünlerim ana mağazada da görünebilir mi?');

-- ============================================
-- PART 2: SIRALA - Kategori bazında düzenle
-- ============================================

-- General kategorisi: 1-20
UPDATE public.site_faqs SET display_order = 1 WHERE question_tr LIKE 'KolayDugun nedir%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 2 WHERE question_tr LIKE 'Platform kullanımı ücretli%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 3 WHERE question_tr LIKE 'Hangi dillerde%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 4 WHERE question_tr LIKE 'Hangi şehirlerde%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 5 WHERE question_tr LIKE 'Verilerim güvende%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 6 WHERE question_tr LIKE 'Mağaza bölümünde%' AND category = 'general';
UPDATE public.site_faqs SET display_order = 7 WHERE question_tr LIKE 'Demo mağaza%' AND category = 'general';

-- Couples kategorisi: 21-40
UPDATE public.site_faqs SET display_order = 21 WHERE question_tr LIKE 'Nasıl üye olabilirim%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 22 WHERE question_tr LIKE 'Tedarikçilerden nasıl teklif%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 23 WHERE question_tr LIKE 'Düğün web sitesi%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 24 WHERE question_tr LIKE 'Bütçe planlayıcı%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 25 WHERE question_tr LIKE 'Favorilere ekleme%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 26 WHERE question_tr LIKE 'Yapılacaklar listesi%' AND category = 'couples';
UPDATE public.site_faqs SET display_order = 27 WHERE question_tr LIKE 'Oturma planı%' AND category = 'couples';

-- Vendors kategorisi: 41-60
UPDATE public.site_faqs SET display_order = 41 WHERE question_tr LIKE 'Tedarikçi olarak nasıl kayıt%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 42 WHERE question_tr LIKE 'Hangi paketler var%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 43 WHERE question_tr LIKE 'Lead sistemi nasıl%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 44 WHERE question_tr LIKE 'Kredi sistemi nedir%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 45 WHERE question_tr LIKE 'Profilimi nasıl öne%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 46 WHERE question_tr LIKE 'Fotoğraf galerisi%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 47 WHERE question_tr LIKE 'Müşterilerle nasıl iletişim%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 48 WHERE question_tr LIKE 'Video ve sosyal medya%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 49 WHERE question_tr LIKE 'Harita konumu%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 50 WHERE question_tr LIKE 'Paketimi nasıl değiştirebilirim%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 51 WHERE question_tr LIKE 'Tedarikçi olarak kendi mağazamı%' AND category = 'vendors';
UPDATE public.site_faqs SET display_order = 52 WHERE question_tr LIKE 'Ürünlerim ana mağazada%' AND category = 'vendors';

-- Payment kategorisi: 61-70
UPDATE public.site_faqs SET display_order = 61 WHERE question_tr LIKE 'Hangi ödeme yöntemlerini%' AND category = 'payment';
UPDATE public.site_faqs SET display_order = 62 WHERE question_tr LIKE 'Kredi satın alma%' AND category = 'payment';
UPDATE public.site_faqs SET display_order = 63 WHERE question_tr LIKE 'İptal ve iade%' AND category = 'payment';
UPDATE public.site_faqs SET display_order = 64 WHERE question_tr LIKE 'Fatura alabilir%' AND category = 'payment';

-- Technical kategorisi: 71-80
UPDATE public.site_faqs SET display_order = 71 WHERE question_tr LIKE 'Şifremi unuttum%' AND category = 'technical';
UPDATE public.site_faqs SET display_order = 72 WHERE question_tr LIKE 'Mobil uygulama%' AND category = 'technical';
UPDATE public.site_faqs SET display_order = 73 WHERE question_tr LIKE 'Hangi tarayıcılar%' AND category = 'technical';
UPDATE public.site_faqs SET display_order = 74 WHERE question_tr LIKE 'Teknik bir sorun%' AND category = 'technical';

-- ============================================
-- PART 3: GEREKSİZ SORULARI KALDIR
-- ============================================

-- Hesap silme soruları çift var, birini kaldır (couples & vendors ayrı kalabilir)
-- Shop Marketplace tekrar soruları (eski versiyon) kaldır - created_at ile sırala
DELETE FROM public.site_faqs 
WHERE question_tr = 'Shop Marketplace nedir?' 
AND id NOT IN (
    SELECT DISTINCT ON (question_tr) id 
    FROM public.site_faqs 
    WHERE question_tr = 'Shop Marketplace nedir?'
    ORDER BY question_tr, created_at ASC
    LIMIT 1
);

-- ============================================
-- PART 4: SHOP_FAQS TEMİZLİK (Mağaza Paneli SSS)
-- ============================================

-- Tekrar edenleri kaldır
DELETE FROM public.shop_faqs 
WHERE id NOT IN (
    SELECT DISTINCT ON (question_tr) id 
    FROM public.shop_faqs 
    ORDER BY question_tr, created_at ASC
);

-- Kategorileri standardize et
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'profile';
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'categories';
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'analytics';
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'account';
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'support';

-- Kalan kategoriler: general, products, billing, affiliate

-- ============================================
-- DONE
-- ============================================
