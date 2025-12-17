-- APPEND NEW CONTENT (ADDITIVE)
-- Mevcut verileri silmez, sadece yeni konuları ekler.
-- Eklenen Konular: Güven Rozetleri, Fiyat Sor, Toplu Silme, Ana Shop, Görsel Linkleri

-- 1. SHOP FAQS (Yeni Konular)

-- Display Settings / Profile
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general', 'Güven rozetlerini nasıl açabilirim?', 'Wie aktiviere ich Vertrauensabzeichen?', 'How can I enable trust badges?',
       '**Mağaza Profili** ayarlarında "Görüntüleme Ayarları" kısmından Güven Rozetlerini açabilirsiniz. Bu, müşterilerinize doğrulanmış satıcı olduğunuzu gösterir.',
       'Sie können Vertrauensabzeichen in den **Shop-Profil**-Einstellungen unter "Anzeigeeinstellungen" aktivieren.',
       'You can enable Trust Badges in **Shop Profile** settings under "Display Settings".',
       8, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Güven rozetlerini nasıl açabilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general', 'Canlı ziyaretçi sayısı nedir?', 'Was ist die Live-Besucherzahl?', 'What is live viewer count?',
       'Bu özellik aktif edildiğinde, ürün sayfanızda o an ürüne bakan potansiyel müşteri sayısını gösterir. "FOMO" etkisi yaratarak satışı teşvik edebilir.',
       'Wenn aktiviert, zeigt dies, wie viele potenzielle Kunden das Produkt gerade ansehen.',
       'When enabled, this shows how many potential customers are currently viewing the product.',
       9, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Canlı ziyaretçi sayısı nedir?');

-- Products / Image Hosting
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products', 'Resim linki (URL) nasıl alırım?', 'Wie erhalte ich einen Bildlink (URL)?', 'How do I get an image link (URL)?',
       'Resimlerinizi **Imgur, ImgBB veya Google Drive** gibi sitelere yükleyin. Resme sağ tıklayıp "Resim adresini kopyala" diyerek aldığınız linki forma yapıştırın.',
       'Laden Sie Bilder auf **Imgur, ImgBB oder Google Drive** hoch. Rechtsklick auf das Bild und "Bildadresse kopieren".',
       'Upload images to **Imgur, ImgBB or Google Drive**. Right click image and "Copy image address", then paste into form.',
       10, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Resim linki (URL) nasıl alırım?');

-- Products / Price on Request
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products', 'Fiyat yazmak zorunlu mu?', 'Ist die Preisangabe obligatorisch?', 'Is entering a price mandatory?',
       'Hayır. Ürün eklerken **"Fiyat istek üzerine"** kutucuğunu işaretlerseniz fiyat yerine "Fiyat Sor" butonu görünür.',
       'Nein. Wenn Sie **"Preis auf Anfrage"** markieren, erscheint statt des Preises eine Schaltfläche "Preis anfragen".',
       'No. If you check **"Price on request"**, a "Ask for Price" button will appear instead of the price.',
       11, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Fiyat yazmak zorunlu mu?');

-- Products / Main Shop
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products', '"Ana Shop Başvurusu" ne işe yarar?', 'Was bewirkt der "Hauptshop-Antrag"?', 'What does "Main Shop Request" do?',
       'Ürününüzün sadece kendi profilinizde değil, **KolayDugun Genel Vitrini**''nde (tüm çiftlerin arama yaptığı yer) görünmesini sağlar. Editör onayından sonra yayınlanır.',
       'Es ermöglicht, dass Ihr Produkt im **KolayDugun Hauptschaufenster** erscheint.',
       'It allows your product to appear in the **KolayDugun Main Storefront**.',
       12, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = '"Ana Shop Başvurusu" ne işe yarar?');

-- Products / Bulk Delete
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products', 'Toplu ürün nasıl silerim?', 'Wie lösche ich mehrere Produkte?', 'How do I bulk delete products?',
       'Ürün listesinde sol taraftaki kutucukları seçerek veya "Tümünü Seç" diyerek, üstte çıkan kırmızı **"Sil"** butonu ile çoklu işlem yapabilirsiniz.',
       'Wählen Sie Produkte in der Liste aus und verwenden Sie die rote Schaltfläche **"Löschen"**.',
       'Select products in the list and use the red **"Delete"** button.',
       13, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Toplu ürün nasıl silerim?');

-- 2. ANNOUNCEMENT (Update)
INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned)
SELECT 'update', '💡 İpucu: Satışlarınızı Artırın', '💡 Tipp: Verkäufe steigern', '💡 Tip: Increase Sales',
       'Mağaza Ayarları''ndan "Güven Rozetleri"ni açarak müşterilerinize güven verebilirsiniz. Ayrıca "Fiyat İstek Üzerine" seçeneği ile özel teklifler sunabilirsiniz.',
       'Aktivieren Sie "Vertrauensabzeichen" in den Einstellungen, um Vertrauen aufzubauen.',
       'Enable "Trust Badges" in settings to build trust.',
       ARRAY['starter', 'business', 'premium'], true, false
WHERE NOT EXISTS (SELECT 1 FROM public.shop_announcements WHERE title_tr = '💡 İpucu: Satışlarınızı Artırın');
