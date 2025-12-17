-- Gallery Management FAQs for Shop Owners
-- Migration: 20251216_gallery_management_faqs.sql

-- Add gallery category FAQs
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
'gallery', 
'Galeri''ye nasıl fotoğraf/video eklerim?',
'Wie füge ich Fotos/Videos zur Galerie hinzu?',
'How do I add photos/videos to the gallery?',
'1. Mağaza Paneli → Galeri bölümüne gidin
2. Yeni Ekle formunu doldurun:
   - Tür: Fotoğraf veya Video seçin
   - Albüm: Bir albüm seçin (opsiyonel)
   - URL: Görsel/video linkini yapıştırın
   - Başlık: Türkçe, Almanca, İngilizce başlıklar ekleyin
3. ➕ Ekle butonuna tıklayın

💡 İpucu: URL''yi yapıştırdıktan sonra önizleme otomatik gösterilir.',
'1. Gehen Sie zu Shop-Panel → Galerie
2. Füllen Sie das Formular "Neu hinzufügen" aus:
   - Typ: Wählen Sie Foto oder Video
   - Album: Wählen Sie ein Album (optional)
   - URL: Fügen Sie den Bild-/Videolink ein
   - Titel: Fügen Sie Titel auf Türkisch, Deutsch, Englisch hinzu
3. Klicken Sie auf ➕ Hinzufügen

💡 Tipp: Die Vorschau wird automatisch angezeigt, nachdem Sie die URL eingefügt haben.',
'1. Go to Shop Panel → Gallery
2. Fill in the "Add New" form:
   - Type: Select Photo or Video
   - Album: Select an album (optional)
   - URL: Paste the image/video link
   - Title: Add titles in Turkish, German, English
3. Click ➕ Add

💡 Tip: Preview is automatically shown after pasting the URL.',
100, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Galeri''ye nasıl fotoğraf/video eklerim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Hangi video platformlarını destekliyorsunuz?',
'Welche Videoplattformen werden unterstützt?',
'Which video platforms do you support?',
'✅ Desteklenen Platformlar:
- YouTube
- Vimeo
- TikTok
- Google Drive

Örnek URL''ler:
YouTube: https://www.youtube.com/watch?v=VIDEO_ID
Vimeo: https://vimeo.com/VIDEO_ID
TikTok: https://www.tiktok.com/@user/video/VIDEO_ID',
'✅ Unterstützte Plattformen:
- YouTube
- Vimeo
- TikTok
- Google Drive

Beispiel-URLs:
YouTube: https://www.youtube.com/watch?v=VIDEO_ID
Vimeo: https://vimeo.com/VIDEO_ID
TikTok: https://www.tiktok.com/@user/video/VIDEO_ID',
'✅ Supported Platforms:
- YouTube
- Vimeo
- TikTok
- Google Drive

Example URLs:
YouTube: https://www.youtube.com/watch?v=VIDEO_ID
Vimeo: https://vimeo.com/VIDEO_ID
TikTok: https://www.tiktok.com/@user/video/VIDEO_ID',
101, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Hangi video platformlarını destekliyorsunuz?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Albüm nasıl oluştururum?',
'Wie erstelle ich ein Album?',
'How do I create an album?',
'1. Albüm Oluştur bölümünü bulun
2. İkon seçin (📷, 🎥, 💍, vb.)
3. Albüm adı girin (Türkçe, Almanca, İngilizce)
4. Kapak görseli URL''si ekleyin (opsiyonel)
5. ➕ Albüm Ekle butonuna tıklayın

💡 İpucu: Kapak görseli belirtmezseniz, albümdeki ilk fotoğraf otomatik kullanılır.',
'1. Finden Sie den Abschnitt "Album erstellen"
2. Wählen Sie ein Symbol (📷, 🎥, 💍, usw.)
3. Geben Sie den Albumnamen ein (Türkisch, Deutsch, Englisch)
4. Fügen Sie die Cover-Bild-URL hinzu (optional)
5. Klicken Sie auf ➕ Album hinzufügen

💡 Tipp: Wenn Sie kein Cover-Bild angeben, wird automatisch das erste Foto im Album verwendet.',
'1. Find the "Create Album" section
2. Select an icon (📷, 🎥, 💍, etc.)
3. Enter album name (Turkish, German, English)
4. Add cover image URL (optional)
5. Click ➕ Add Album

💡 Tip: If you don''t specify a cover image, the first photo in the album will be used automatically.',
102, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Albüm nasıl oluştururum?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Lightbox nedir ve nasıl kullanılır?',
'Was ist Lightbox und wie wird es verwendet?',
'What is Lightbox and how to use it?',
'Lightbox, galeri resimlerine tıkladığınızda açılan büyük görünüm penceresidir. Müşterileriniz fotoğrafları detaylı inceleyebilir.

Özellikler:
🖱️ Resme tıklayınca açılır
⌨️ Klavye ile gezinme (← →)
✕ ESC ile kapatma
📊 Resim sayacı (5/15)

Klavye Kısayolları:
- ESC: Lightbox''ı kapat
- ← (Sol ok): Önceki resim
- → (Sağ ok): Sonraki resim',
'Lightbox ist das große Ansichtsfenster, das sich öffnet, wenn Sie auf Galeriebilder klicken. Ihre Kunden können Fotos im Detail betrachten.

Funktionen:
🖱️ Öffnet sich beim Klicken auf ein Bild
⌨️ Navigation mit Tastatur (← →)
✕ Schließen mit ESC
📊 Bildzähler (5/15)

Tastaturkürzel:
- ESC: Lightbox schließen
- ← (Linkspfeil): Vorheriges Bild
- → (Rechtspfeil): Nächstes Bild',
'Lightbox is the large view window that opens when you click on gallery images. Your customers can examine photos in detail.

Features:
🖱️ Opens when clicking on image
⌨️ Keyboard navigation (← →)
✕ Close with ESC
📊 Image counter (5/15)

Keyboard Shortcuts:
- ESC: Close lightbox
- ← (Left arrow): Previous image
- → (Right arrow): Next image',
103, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Lightbox nedir ve nasıl kullanılır?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Galeri resimlerini nasıl paylaşabilirim?',
'Wie kann ich Galeriebilder teilen?',
'How can I share gallery images?',
'2 Yöntem:

1. Tekli Paylaşım:
   - Her resmin sağ alt köşesindeki 📤 butonuna tıklayın
   - WhatsApp, Facebook veya Link Kopyala seçin

2. Albüm Paylaşımı:
   - Albüm sekmesinin yanındaki 📤 butonuna tıklayın
   - Tüm albüm tek linkle paylaşılır

Paylaşma Linkleri:
- Tekli: kolaydugun.de/shop/magaza/[adi]/galeri/[resim-id]
- Albüm: kolaydugun.de/shop/magaza/[adi]/galeri?album=[album-id]',
'2 Methoden:

1. Einzelfreigabe:
   - Klicken Sie auf die 📤-Schaltfläche in der unteren rechten Ecke jedes Bildes
   - Wählen Sie WhatsApp, Facebook oder Link kopieren

2. Albumfreigabe:
   - Klicken Sie auf die 📤-Schaltfläche neben der Albumregisterkarte
   - Das gesamte Album wird mit einem Link geteilt

Freigabelinks:
- Einzeln: kolaydugun.de/shop/magaza/[name]/galeri/[bild-id]
- Album: kolaydugun.de/shop/magaza/[name]/galeri?album=[album-id]',
'2 Methods:

1. Single Share:
   - Click the 📤 button in the bottom right corner of each image
   - Select WhatsApp, Facebook, or Copy Link

2. Album Share:
   - Click the 📤 button next to the album tab
   - The entire album is shared with a single link

Share Links:
- Single: kolaydugun.de/shop/magaza/[name]/galeri/[image-id]
- Album: kolaydugun.de/shop/magaza/[name]/galeri?album=[album-id]',
104, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Galeri resimlerini nasıl paylaşabilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Fotoğraf önizlemesi gösterilmiyor, ne yapmalıyım?',
'Die Fotovorschau wird nicht angezeigt, was soll ich tun?',
'Photo preview is not showing, what should I do?',
'Olası Nedenler:
❌ URL yanlış veya kırık
❌ Görsel public erişime kapalı
❌ CORS hatası

Çözümler:
✅ Imgur veya Google Drive kullanın
✅ Direct image link kullanın (.jpg, .png, .webp)
✅ URL''yi kontrol edin

Önerilen Hosting:
- Imgur.com (ücretsiz)
- Google Drive (public link)
- Dropbox (public link)',
'Mögliche Ursachen:
❌ URL ist falsch oder defekt
❌ Bild ist nicht öffentlich zugänglich
❌ CORS-Fehler

Lösungen:
✅ Verwenden Sie Imgur oder Google Drive
✅ Verwenden Sie einen direkten Bildlink (.jpg, .png, .webp)
✅ Überprüfen Sie die URL

Empfohlenes Hosting:
- Imgur.com (kostenlos)
- Google Drive (öffentlicher Link)
- Dropbox (öffentlicher Link)',
'Possible Causes:
❌ URL is wrong or broken
❌ Image is not publicly accessible
❌ CORS error

Solutions:
✅ Use Imgur or Google Drive
✅ Use direct image link (.jpg, .png, .webp)
✅ Check the URL

Recommended Hosting:
- Imgur.com (free)
- Google Drive (public link)
- Dropbox (public link)',
105, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Fotoğraf önizlemesi gösterilmiyor, ne yapmalıyım?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Albüm kapak görseli nasıl değiştirilir?',
'Wie ändere ich das Album-Coverbild?',
'How to change album cover image?',
'1. Albümün yanındaki ✏️ Düzenle butonuna tıklayın
2. Kapak Görseli URL alanını güncelleyin
3. 💾 Kaydet butonuna tıklayın

💡 İpucu: Kapak görseli belirtmezseniz, albümdeki ilk fotoğraf otomatik kullanılır.

En İyi Uygulamalar:
- Yüksek kaliteli görsel kullanın
- 16:9 veya 1:1 oran tercih edin
- Minimum 800x600px boyut',
'1. Klicken Sie auf die ✏️ Bearbeiten-Schaltfläche neben dem Album
2. Aktualisieren Sie das Feld "Cover-Bild-URL"
3. Klicken Sie auf 💾 Speichern

💡 Tipp: Wenn Sie kein Cover-Bild angeben, wird automatisch das erste Foto im Album verwendet.

Best Practices:
- Verwenden Sie hochwertige Bilder
- Bevorzugen Sie 16:9 oder 1:1 Verhältnis
- Mindestgröße 800x600px',
'1. Click the ✏️ Edit button next to the album
2. Update the "Cover Image URL" field
3. Click 💾 Save

💡 Tip: If you don''t specify a cover image, the first photo in the album will be used automatically.

Best Practices:
- Use high-quality images
- Prefer 16:9 or 1:1 ratio
- Minimum size 800x600px',
106, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Albüm kapak görseli nasıl değiştirilir?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'gallery',
'Galeri SEO''su nasıl optimize edilir?',
'Wie optimiere ich die Galerie-SEO?',
'How to optimize gallery SEO?',
'En İyi Uygulamalar:

1. ✅ Her resme başlık ekleyin
   - Açıklayıcı ve anahtar kelime içeren
   - 3 dilde (TR, DE, EN)

2. ✅ Albüm adlarını açıklayıcı yapın
   - "Düğün Fotoğrafları" yerine "Lüks Düğün Fotoğraf Çekimi Örnekleri"

3. ✅ Kaliteli görseller kullanın
   - Minimum 1200px genişlik
   - WebP formatı tercih edin

4. ✅ Sosyal medyada paylaşın
   - WhatsApp, Facebook, Instagram
   - Backlink oluşturur',
'Best Practices:

1. ✅ Fügen Sie jedem Bild einen Titel hinzu
   - Beschreibend und mit Schlüsselwörtern
   - In 3 Sprachen (TR, DE, EN)

2. ✅ Machen Sie Albumnamen beschreibend
   - Statt "Hochzeitsfotos" → "Luxus-Hochzeitsfotografie-Beispiele"

3. ✅ Verwenden Sie hochwertige Bilder
   - Mindestens 1200px Breite
   - Bevorzugen Sie WebP-Format

4. ✅ Teilen Sie in sozialen Medien
   - WhatsApp, Facebook, Instagram
   - Erstellt Backlinks',
'Best Practices:

1. ✅ Add title to each image
   - Descriptive and keyword-rich
   - In 3 languages (TR, DE, EN)

2. ✅ Make album names descriptive
   - Instead of "Wedding Photos" → "Luxury Wedding Photography Examples"

3. ✅ Use high-quality images
   - Minimum 1200px width
   - Prefer WebP format

4. ✅ Share on social media
   - WhatsApp, Facebook, Instagram
   - Creates backlinks',
107, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Galeri SEO''su nasıl optimize edilir?');
