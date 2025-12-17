-- COMPREHENSIVE SHOP FAQ AND ANNOUNCEMENT CONTENT
-- Kapsamlı SSS ve Duyuru İçeriği (TR, DE, EN)
-- Mevcut içerikler korunur, sadece yeni eklenir (WHERE NOT EXISTS)

-- ============================================
-- PART 1: CLEANUP - Düzeltmeler ve Normalizasyon
-- ============================================

-- Mevcut kategori adlarını standartlaştır
UPDATE public.shop_faqs SET category = 'products' WHERE category = 'product';
UPDATE public.shop_faqs SET category = 'general' WHERE category = 'profile';

-- display_order'ları yeniden sırala
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at) * 10 as new_order
  FROM public.shop_faqs
)
UPDATE public.shop_faqs SET display_order = ranked.new_order
FROM ranked WHERE public.shop_faqs.id = ranked.id;

-- ============================================
-- PART 2: GENERAL CATEGORY - Genel Bilgiler
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general', 
  'Mağaza linkimi nerede bulabilirim?',
  'Wo finde ich meinen Shop-Link?',
  'Where can I find my shop link?',
  'Mağaza linkinizi **Başlangıç (Dashboard)** sayfasında "Mağaza Linkiniz" bölümünde bulabilirsiniz. Bu link, müşterilerinizin doğrudan mağazanıza ulaşmasını sağlar.

**Linki kopyalamak için:**
1. Dashboard sayfasına gidin
2. "Mağaza Linkiniz" kutusundaki linki seçin
3. "Kopyala" butonuna tıklayın

Bu linki sosyal medya hesaplarınızda, kartvizitlerinizde veya web sitenizde paylaşabilirsiniz.',
  'Sie finden Ihren Shop-Link auf der **Dashboard**-Seite im Abschnitt "Ihr Shop-Link". Dieser Link ermöglicht es Kunden, direkt zu Ihrem Shop zu gelangen.

**Um den Link zu kopieren:**
1. Gehen Sie zur Dashboard-Seite
2. Wählen Sie den Link im Feld "Ihr Shop-Link"
3. Klicken Sie auf "Kopieren"

Sie können diesen Link in sozialen Medien, Visitenkarten oder auf Ihrer Website teilen.',
  'You can find your shop link on the **Dashboard** page under "Your Shop Link" section. This link allows customers to reach your shop directly.

**To copy the link:**
1. Go to the Dashboard page
2. Select the link in the "Your Shop Link" field
3. Click the "Copy" button

You can share this link on social media, business cards, or your website.',
  5, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Mağaza linkimi nerede bulabilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general',
  'Panel menüsündeki bölümler nelerdir?',
  'Was sind die Menüabschnitte im Panel?',
  'What are the menu sections in the panel?',
  'Shop panelinizde aşağıdaki bölümler bulunur:

📊 **Başlangıç (Dashboard):** Genel bakış, istatistikler ve hızlı işlemler
📦 **Ürünlerim:** Ürün ekleme, düzenleme ve yönetim
🏷️ **Kategorilerim:** Özel mağaza kategorileri oluşturma
⚙️ **Profil:** Mağaza bilgileri ve görüntüleme ayarları
📈 **İstatistikler:** Detaylı performans raporları (Business+ plan)
🔗 **Affiliate:** Referans programı ve kazançlar
📚 **Yardım:** SSS ve duyurular

Her bölüm, mağazanızı profesyonelce yönetmeniz için tasarlanmıştır.',
  'Ihr Shop-Panel enthält folgende Bereiche:

📊 **Dashboard:** Übersicht, Statistiken und Schnellaktionen
📦 **Meine Produkte:** Produktverwaltung
🏷️ **Meine Kategorien:** Eigene Shop-Kategorien erstellen
⚙️ **Profil:** Shop-Informationen und Anzeigeeinstellungen
📈 **Statistiken:** Detaillierte Leistungsberichte (Business+ Plan)
🔗 **Affiliate:** Empfehlungsprogramm und Einnahmen
📚 **Hilfe:** FAQ und Ankündigungen',
  'Your shop panel includes the following sections:

📊 **Dashboard:** Overview, statistics, and quick actions
📦 **My Products:** Product management
🏷️ **My Categories:** Create custom shop categories
⚙️ **Profile:** Shop information and display settings
📈 **Analytics:** Detailed performance reports (Business+ plan)
🔗 **Affiliate:** Referral program and earnings
📚 **Help:** FAQ and announcements',
  6, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Panel menüsündeki bölümler nelerdir?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'general',
  'Çoklu dil desteği nasıl çalışır?',
  'Wie funktioniert die Mehrsprachigkeit?',
  'How does multi-language support work?',
  'KolayDugun Shop **Türkçe, Almanca ve İngilizce** olmak üzere 3 dili destekler.

**Nasıl kullanılır:**
- Ürün ve kategori eklerken her dil için ayrı başlık ve açıklama girebilirsiniz
- Türkçe zorunludur, diğer diller opsiyoneldir
- Ziyaretçiler siteyi hangi dilde görüntülüyorsa, o dildeki içeriği görür
- Almanca veya İngilizce boş bırakılırsa Türkçe içerik gösterilir

**İpucu:** Almanya''da yaşayan Türk çiftlere ulaşmak için hem Türkçe hem Almanca içerik girmenizi öneririz.',
  'KolayDugun Shop unterstützt 3 Sprachen: **Türkisch, Deutsch und Englisch**.

**Verwendung:**
- Bei Produkten und Kategorien können Sie für jede Sprache separate Titel und Beschreibungen eingeben
- Türkisch ist Pflicht, andere Sprachen sind optional
- Besucher sehen Inhalte in der von ihnen gewählten Sprache
- Wenn Deutsch oder Englisch leer ist, wird der türkische Inhalt angezeigt

**Tipp:** Wir empfehlen, sowohl türkische als auch deutsche Inhalte einzugeben.',
  'KolayDugun Shop supports 3 languages: **Turkish, German, and English**.

**How to use:**
- When adding products and categories, you can enter separate titles and descriptions for each language
- Turkish is required, other languages are optional
- Visitors see content in their selected language
- If German or English is empty, Turkish content will be shown

**Tip:** We recommend entering both Turkish and German content to reach Turkish couples in Germany.',
  7, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Çoklu dil desteği nasıl çalışır?');

-- ============================================
-- PART 3: PRODUCTS CATEGORY - Ürün Yönetimi
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products',
  'Ürün eklerken hangi bilgileri girmem gerekiyor?',
  'Welche Informationen muss ich beim Hinzufügen eines Produkts eingeben?',
  'What information do I need to enter when adding a product?',
  '**Zorunlu alanlar:**
- ✅ Ürün Adı (Türkçe)

**Önerilen alanlar:**
- 📸 Ürün görselleri (URL olarak)
- 💰 Fiyat veya "Fiyat istek üzerine" seçeneği
- 📝 Açıklama (ne kadar detaylı olursa o kadar iyi)
- 🏷️ Kategori seçimi

**Opsiyonel alanlar:**
- 📞 WhatsApp, telefon, e-posta
- 🔗 Harici link (kendi sitenize yönlendirme)
- 🌍 Almanca ve İngilizce çeviriler

**İpucu:** Detaylı açıklama ve kaliteli görseller, satış şansınızı artırır!',
  '**Pflichtfelder:**
- ✅ Produktname (Türkisch)

**Empfohlene Felder:**
- 📸 Produktbilder (als URL)
- 💰 Preis oder "Preis auf Anfrage"
- 📝 Beschreibung (je detaillierter, desto besser)
- 🏷️ Kategorieauswahl

**Optionale Felder:**
- 📞 WhatsApp, Telefon, E-Mail
- 🔗 Externer Link
- 🌍 Deutsche und englische Übersetzungen',
  '**Required fields:**
- ✅ Product Name (Turkish)

**Recommended fields:**
- 📸 Product images (as URL)
- 💰 Price or "Price on request"
- 📝 Description (the more detailed the better)
- 🏷️ Category selection

**Optional fields:**
- 📞 WhatsApp, phone, email
- 🔗 External link
- 🌍 German and English translations',
  15, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Ürün eklerken hangi bilgileri girmem gerekiyor?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products',
  'Ürün durumları ne anlama geliyor?',
  'Was bedeuten die Produktstatus?',
  'What do product statuses mean?',
  'Ürünleriniz 3 farklı durumda olabilir:

✅ **Onaylı (Approved):**
Ürününüz yayında ve müşteriler tarafından görüntülenebilir. Kendi mağazanıza eklediğiniz ürünler otomatik olarak onaylanır.

⏳ **Bekliyor (Pending):**
Ürününüz "Ana Shop Başvurusu" ile KolayDugun ana vitrininde gösterilmek üzere editör onayı bekliyor.

❌ **Reddedildi (Rejected):**
Ana Shop başvurunuz reddedildi. Red sebebini ürün detayında görebilir ve gerekli düzeltmeleri yaparak tekrar başvurabilirsiniz.

**Not:** Kendi mağazanızdaki ürünler her zaman görünür, Ana Shop başvurusu sadece ek görünürlük içindir.',
  'Ihre Produkte können 3 verschiedene Status haben:

✅ **Genehmigt:** Ihr Produkt ist live und für Kunden sichtbar.

⏳ **Ausstehend:** Ihr Produkt wartet auf redaktionelle Genehmigung für das Hauptschaufenster.

❌ **Abgelehnt:** Ihr Hauptshop-Antrag wurde abgelehnt. Den Grund sehen Sie in den Produktdetails.',
  'Your products can have 3 different statuses:

✅ **Approved:** Your product is live and visible to customers.

⏳ **Pending:** Your product is awaiting editorial approval for the main storefront.

❌ **Rejected:** Your main shop request was rejected. You can see the reason in product details.',
  16, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Ürün durumları ne anlama geliyor?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'products',
  'Bir ürünü nasıl düzenlerim veya silerim?',
  'Wie bearbeite oder lösche ich ein Produkt?',
  'How do I edit or delete a product?',
  '**Ürün Düzenleme:**
1. Ürünlerim sayfasına gidin
2. Düzenlemek istediğiniz ürünün sağındaki ✏️ (kalem) ikonuna tıklayın
3. Açılan formda gerekli değişiklikleri yapın
4. "Kaydet" butonuna tıklayın

**Tek Ürün Silme:**
1. Ürün satırındaki 🗑️ (çöp kutusu) ikonuna tıklayın
2. Açılan onay kutusunda ✓ (onay) butonuna tıklayın

**Toplu Silme:**
1. Silmek istediğiniz ürünlerin solundaki kutucukları işaretleyin
2. "Tümünü Seç" ile hepsini seçebilirsiniz
3. Üstte beliren "Sil" butonuna tıklayın
4. Onaylayın

⚠️ **Dikkat:** Silinen ürünler geri getirilemez!',
  '**Produkt bearbeiten:**
1. Gehen Sie zu "Meine Produkte"
2. Klicken Sie auf das ✏️ Symbol
3. Nehmen Sie die gewünschten Änderungen vor
4. Klicken Sie auf "Speichern"

**Produkt löschen:**
1. Klicken Sie auf das 🗑️ Symbol
2. Bestätigen Sie mit ✓

**Mehrere löschen:**
1. Wählen Sie die Produkte aus
2. Klicken Sie auf "Löschen"
3. Bestätigen Sie

⚠️ **Achtung:** Gelöschte Produkte können nicht wiederhergestellt werden!',
  '**Edit a product:**
1. Go to "My Products"
2. Click the ✏️ icon
3. Make the desired changes
4. Click "Save"

**Delete a product:**
1. Click the 🗑️ icon
2. Confirm with ✓

**Bulk delete:**
1. Select multiple products
2. Click "Delete"
3. Confirm

⚠️ **Warning:** Deleted products cannot be recovered!',
  17, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Bir ürünü nasıl düzenlerim veya silerim?');

-- ============================================
-- PART 4: PROFILE CATEGORY - Mağaza Profili
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'profile',
  'Logo ve kapak görseli nasıl eklerim?',
  'Wie füge ich Logo und Titelbild hinzu?',
  'How do I add a logo and cover image?',
  'Logo ve kapak görseli eklemek için harici URL kullanmanız gerekir:

**Adım adım:**
1. Görselinizi **Imgur.com**, **ImgBB.com** veya **Google Drive**''a yükleyin
2. Görsel linkini kopyalayın (Sağ tık → "Resim adresini kopyala")
3. Profil sayfasındaki ilgili alana yapıştırın
4. "Değişiklikleri Kaydet" butonuna tıklayın

**Önerilen boyutlar:**
- 📷 Logo: 200x200 piksel (kare)
- 🖼️ Kapak: 1200x400 piksel (geniş)

**İpucu:** Şeffaf arka planlı PNG logo kullanırsanız daha profesyonel görünür.',
  'Um Logo und Titelbild hinzuzufügen, müssen Sie eine externe URL verwenden:

**Schritt für Schritt:**
1. Laden Sie Ihr Bild auf **Imgur.com**, **ImgBB.com** oder **Google Drive** hoch
2. Kopieren Sie den Bildlink (Rechtsklick → "Bildadresse kopieren")
3. Fügen Sie ihn in das entsprechende Feld auf der Profilseite ein
4. Klicken Sie auf "Änderungen speichern"

**Empfohlene Größen:**
- 📷 Logo: 200x200 Pixel (quadratisch)
- 🖼️ Titelbild: 1200x400 Pixel (breit)',
  'To add a logo and cover image, you need to use an external URL:

**Step by step:**
1. Upload your image to **Imgur.com**, **ImgBB.com** or **Google Drive**
2. Copy the image link (Right-click → "Copy image address")
3. Paste it into the relevant field on the Profile page
4. Click "Save Changes"

**Recommended sizes:**
- 📷 Logo: 200x200 pixels (square)
- 🖼️ Cover: 1200x400 pixels (wide)',
  25, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Logo ve kapak görseli nasıl eklerim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'profile',
  'Görüntüleme Ayarları nelerdir?',
  'Was sind die Anzeigeeinstellungen?',
  'What are Display Settings?',
  'Görüntüleme Ayarları, ürün sayfalarınızda hangi bilgilerin gösterileceğini kontrol eder:

👁️ **Görüntüleme Sayısı:**
Ürünün kaç kez görüntülendiğini müşterilere gösterir. Popüler ürünler için güven oluşturur.

✓ **Stok Durumu:**
"Stokta Var" rozetini gösterir. Müşterilere ürünün hazır olduğunu belirtir.

🛡️ **Güven Rozetleri:**
"Doğrulanmış Satıcı", "Hızlı Teslimat" gibi rozetleri gösterir. Profesyonellik algısı yaratır.

**Öneri:** Tüm seçenekleri açık tutmanızı öneririz, bu müşteri güvenini artırır.',
  'Die Anzeigeeinstellungen steuern, welche Informationen auf Ihren Produktseiten angezeigt werden:

👁️ **Aufrufzähler:** Zeigt, wie oft das Produkt angesehen wurde.

✓ **Lagerstatus:** Zeigt das "Auf Lager" Badge.

🛡️ **Vertrauensabzeichen:** Zeigt "Verifizierter Verkäufer", "Schnelle Lieferung" usw.

**Empfehlung:** Wir empfehlen, alle Optionen zu aktivieren.',
  'Display Settings control what information appears on your product pages:

👁️ **View Count:** Shows how many times the product has been viewed.

✓ **Stock Status:** Shows the "In Stock" badge.

🛡️ **Trust Badges:** Shows "Verified Seller", "Fast Shipping" etc.

**Recommendation:** We recommend enabling all options.',
  26, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Görüntüleme Ayarları nelerdir?');

-- ============================================
-- PART 5: CATEGORIES - Özel Kategoriler
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'categories',
  'Özel kategori neden oluşturmalıyım?',
  'Warum sollte ich eigene Kategorien erstellen?',
  'Why should I create custom categories?',
  'Özel kategoriler, mağazanızı organize etmenizi ve müşterilerin aradıklarını kolayca bulmalarını sağlar.

**Faydaları:**
- 🗂️ Ürünlerinizi mantıklı gruplara ayırabilirsiniz
- 🔍 Müşteriler istedikleri ürün tipini hızlıca bulur
- 💼 Profesyonel bir mağaza görüntüsü oluşturur
- 📊 Hangi kategorilerin popüler olduğunu takip edebilirsiniz

**Örnek kategoriler:**
- Düğün Davetiye Setleri
- Kına Gecesi Ürünleri
- Gelin Aksesuarları
- DJ Ses Sistemleri

Her kategori için özel emoji ikon seçebilirsiniz!',
  'Eigene Kategorien helfen Ihnen, Ihren Shop zu organisieren und Kunden das Finden zu erleichtern.

**Vorteile:**
- 🗂️ Produkte logisch gruppieren
- 🔍 Kunden finden schneller, was sie suchen
- 💼 Professionelles Erscheinungsbild
- 📊 Beliebte Kategorien verfolgen

Sie können für jede Kategorie ein eigenes Emoji-Symbol wählen!',
  'Custom categories help you organize your shop and make it easier for customers to find products.

**Benefits:**
- 🗂️ Group products logically
- 🔍 Customers find what they want faster
- 💼 Professional appearance
- 📊 Track popular categories

You can choose a custom emoji icon for each category!',
  35, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Özel kategori neden oluşturmalıyım?');

-- ============================================
-- PART 6: ANALYTICS - İstatistikler
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'analytics',
  'İstatistik paneline nasıl erişirim?',
  'Wie greife ich auf das Statistik-Panel zu?',
  'How do I access the analytics panel?',
  'İstatistik paneli **Business** ve **Premium** plan sahiplerinin kullanımına açıktır.

**Erişim için:**
1. Sol menüden "İstatistikler" seçeneğine tıklayın
2. Tarih aralığını seçin (7, 30 veya 90 gün)
3. Detaylı raporları inceleyin

**Takip edilen metrikler:**
- 👁️ Sayfa ve ürün görüntülemeleri
- 💬 İletişim tıklamaları (WhatsApp, telefon, e-posta)
- 🔗 Paylaşım sayıları
- 📈 Günlük trend grafikleri

**Starter plan kullanıcıları:** Panele erişim için planınızı yükseltmeniz gerekir.',
  'Das Statistik-Panel ist für **Business** und **Premium** Planinhaber verfügbar.

**Zugriff:**
1. Klicken Sie im Menü auf "Statistiken"
2. Wählen Sie den Zeitraum (7, 30 oder 90 Tage)
3. Analysieren Sie die Berichte

**Verfolgte Metriken:**
- 👁️ Seiten- und Produktaufrufe
- 💬 Kontaktklicks
- 🔗 Shares
- 📈 Tägliche Trends',
  'The analytics panel is available for **Business** and **Premium** plan holders.

**To access:**
1. Click "Analytics" in the menu
2. Select time range (7, 30 or 90 days)
3. Review the reports

**Tracked metrics:**
- 👁️ Page and product views
- 💬 Contact clicks
- 🔗 Shares
- 📈 Daily trends',
  45, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'İstatistik paneline nasıl erişirim?');

-- ============================================
-- PART 7: BILLING - Paketler ve Ödeme
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'billing',
  'Planlar arasındaki farklar nelerdir?',
  'Was sind die Unterschiede zwischen den Plänen?',
  'What are the differences between plans?',
  '**📦 STARTER (Başlangıç):**
- 5 ürün limiti
- Temel mağaza sayfası
- Standart destek

**💼 BUSINESS (İş):**
- 20 ürün limiti
- ✅ İstatistik paneli erişimi
- Öncelikli destek
- Özel kategoriler

**👑 PREMIUM (VIP):**
- Sınırsız ürün
- Tüm özellikler
- VIP rozeti (mağazanızda görünür)
- Öncelikli listeleme (arama sonuçlarında üstte)
- 7/24 Premium destek

**Not:** Almanya''da tüm fiyatlara %19 KDV (MwSt) eklenir.',
  '**📦 STARTER:**
- 5 Produkte
- Basis-Shopseite
- Standard-Support

**💼 BUSINESS:**
- 20 Produkte
- ✅ Statistik-Panel
- Prioritäts-Support
- Eigene Kategorien

**👑 PREMIUM (VIP):**
- Unbegrenzte Produkte
- Alle Funktionen
- VIP-Badge
- Prioritäts-Listung
- 24/7 Premium-Support

**Hinweis:** Alle Preise zzgl. 19% MwSt.',
  '**📦 STARTER:**
- 5 products
- Basic shop page
- Standard support

**💼 BUSINESS:**
- 20 products
- ✅ Analytics panel
- Priority support
- Custom categories

**👑 PREMIUM (VIP):**
- Unlimited products
- All features
- VIP badge
- Priority listing
- 24/7 Premium support

**Note:** All prices plus 19% VAT.',
  55, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Planlar arasındaki farklar nelerdir?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'billing',
  'Plan sürem dolduğunda ne olur?',
  'Was passiert, wenn mein Plan abläuft?',
  'What happens when my plan expires?',
  'Plan süreniz dolduğunda:

1. **Mağazanız:** Geçici olarak görünmez olur
2. **Ürünleriniz:** Silinmez, saklanır
3. **Verileriniz:** Tamamı korunur

**Yenileme için:**
- Aynı veya farklı bir plan satın alabilirsiniz
- Yeniledikten sonra mağazanız tekrar aktif olur
- Hiçbir veri kaybı yaşanmaz

**İpucu:** Plan bitiş tarihinizi Dashboard''da görebilirsiniz. Süresi dolmadan yenilemenizi öneririz.',
  'Wenn Ihr Plan abläuft:

1. **Ihr Shop:** Wird vorübergehend unsichtbar
2. **Ihre Produkte:** Werden nicht gelöscht, sondern gespeichert
3. **Ihre Daten:** Bleiben vollständig erhalten

Nach der Verlängerung wird Ihr Shop wieder aktiv.',
  'When your plan expires:

1. **Your shop:** Becomes temporarily invisible
2. **Your products:** Are not deleted, just stored
3. **Your data:** Is fully preserved

After renewal, your shop becomes active again.',
  56, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Plan sürem dolduğunda ne olur?');

-- ============================================
-- PART 8: AFFILIATE - Referans Programı
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
  'Affiliate programı nasıl çalışır?',
  'Wie funktioniert das Affiliate-Programm?',
  'How does the affiliate program work?',
  'Affiliate programı ile referans vererek kazanç sağlayabilirsiniz:

**Nasıl çalışır:**
1. 🔗 Affiliate sayfasından özel referans linkinizi kopyalayın
2. 📢 Bu linki arkadaşlarınız, sosyal medya veya web sitenizde paylaşın
3. 👤 Birisi linkinizden başvuru yapar ve onaylanırsa
4. 💰 İlk ödeme tutarının **%10''unu** komisyon olarak kazanırsınız

**Örnek:**
Referansınız 100€''luk Business plan alırsa, siz 10€ kazanırsınız!

**Kazançlarınızı takip edin:**
- Tıklama sayısı
- Dönüşüm oranı
- Bekleyen ve ödenen kazançlar

Hepsi Affiliate sayfasında görüntülenir.',
  'Mit dem Affiliate-Programm können Sie durch Empfehlungen verdienen:

**So funktioniert es:**
1. 🔗 Kopieren Sie Ihren Empfehlungslink
2. 📢 Teilen Sie ihn mit Freunden oder in sozialen Medien
3. 👤 Wenn jemand sich anmeldet und genehmigt wird
4. 💰 Verdienen Sie **10%** der ersten Zahlung

Alle Statistiken sehen Sie auf der Affiliate-Seite.',
  'With the affiliate program, you can earn by referring others:

**How it works:**
1. 🔗 Copy your referral link from the Affiliate page
2. 📢 Share it with friends or on social media
3. 👤 When someone signs up and gets approved
4. 💰 You earn **10%** of their first payment

Track all your stats on the Affiliate page.',
  65, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate programı nasıl çalışır?');

-- ============================================
-- PART 9: ACCOUNT - Hesap Yönetimi (Yeni Kategori)
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'account',
  'Shop paneline nasıl giriş yaparım?',
  'Wie melde ich mich im Shop-Panel an?',
  'How do I log in to the shop panel?',
  'Shop panelinize giriş yapmak için:

1. **Giriş Yap** butonuna tıklayın
2. Kayıtlı e-posta adresinizi ve şifrenizi girin
3. Sol menüden "Shop Paneli" veya "Mağazam" seçeneğine tıklayın

**Şifrenizi mi unuttunuz?**
Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak şifre sıfırlama e-postası alabilirsiniz.

**Önemli:** Shop paneline sadece onaylanmış mağaza sahipleri erişebilir. Başvurunuz henüz onaylanmadıysa, onay e-postasını bekleyin.',
  'Um sich im Shop-Panel anzumelden:

1. Klicken Sie auf "Anmelden"
2. Geben Sie Ihre E-Mail und Ihr Passwort ein
3. Wählen Sie "Shop-Panel" im Menü

**Passwort vergessen?**
Klicken Sie auf "Passwort vergessen" auf der Anmeldeseite.',
  'To log in to your shop panel:

1. Click the "Login" button
2. Enter your registered email and password
3. Select "Shop Panel" from the menu

**Forgot your password?**
Click "Forgot Password" on the login page.',
  75, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Shop paneline nasıl giriş yaparım?');

-- ============================================
-- PART 10: SUPPORT - Destek (Yeni Kategori)
-- ============================================

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'support',
  'Teknik bir sorun yaşadım, ne yapmalıyım?',
  'Ich habe ein technisches Problem, was soll ich tun?',
  'I have a technical issue, what should I do?',
  'Teknik bir sorunla karşılaştığınızda:

**1. Sayfayı yenileyin** (F5 veya Ctrl+R)
Basit sorunlar genellikle sayfa yenilemesiyle çözülür.

**2. Tarayıcı önbelleğini temizleyin**
Ctrl+Shift+Delete ile önbelleği temizleyin ve tekrar deneyin.

**3. Farklı tarayıcı deneyin**
Chrome, Firefox veya Edge''de test edin.

**4. Bizimle iletişime geçin**
Sorun devam ederse, aşağıdaki bilgilerle bize ulaşın:
- Hangi sayfada sorun yaşadığınız
- Hata mesajı varsa ekran görüntüsü
- Kullandığınız tarayıcı ve cihaz

📧 E-posta: info@kolaydugun.de',
  'Bei einem technischen Problem:

**1. Seite aktualisieren** (F5)
**2. Browser-Cache leeren** (Ctrl+Shift+Delete)
**3. Anderen Browser versuchen**
**4. Kontaktieren Sie uns** mit Screenshot und Details

📧 E-Mail: info@kolaydugun.de',
  'If you encounter a technical issue:

**1. Refresh the page** (F5)
**2. Clear browser cache** (Ctrl+Shift+Delete)
**3. Try a different browser**
**4. Contact us** with screenshot and details

📧 Email: info@kolaydugun.de',
  85, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Teknik bir sorun yaşadım, ne yapmalıyım?');

-- ============================================
-- PART 11: NEW ANNOUNCEMENTS - Yeni Duyurular
-- ============================================

INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned)
SELECT 'info',
  '📊 İstatistik Paneli Business+ Planlarda!',
  '📊 Statistik-Panel in Business+ Plänen!',
  '📊 Analytics Panel in Business+ Plans!',
  'Business ve Premium plan sahipleri artık detaylı istatistik paneline erişebilir! Sayfa görüntülemeleri, iletişim tıklamaları ve günlük trendleri takip edin.',
  'Business und Premium Planinhaber können jetzt auf das detaillierte Statistik-Panel zugreifen!',
  'Business and Premium plan holders can now access the detailed analytics panel!',
  ARRAY['starter'], true, false
WHERE NOT EXISTS (SELECT 1 FROM public.shop_announcements WHERE title_tr = '📊 İstatistik Paneli Business+ Planlarda!');

INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned)
SELECT 'info',
  '💡 SEO İpucu: Açıklamalarınızı Zenginleştirin',
  '💡 SEO-Tipp: Bereichern Sie Ihre Beschreibungen',
  '💡 SEO Tip: Enrich Your Descriptions',
  'Ürün açıklamalarınızda detaylı bilgi verin: malzeme, boyut, teslimat süresi gibi bilgiler hem müşterilere yardımcı olur hem de arama sonuçlarında öne çıkmanızı sağlar.',
  'Geben Sie detaillierte Informationen in Ihren Produktbeschreibungen: Material, Größe, Lieferzeit usw.',
  'Provide detailed information in your product descriptions: material, size, delivery time, etc.',
  ARRAY['starter', 'business', 'premium'], true, false
WHERE NOT EXISTS (SELECT 1 FROM public.shop_announcements WHERE title_tr = '💡 SEO İpucu: Açıklamalarınızı Zenginleştirin');

INSERT INTO public.shop_announcements (type, title_tr, title_de, title_en, content_tr, content_de, content_en, target_plans, is_active, is_pinned)
SELECT 'new_feature',
  '🏷️ Özel Kategoriler Artık Aktif!',
  '🏷️ Eigene Kategorien jetzt verfügbar!',
  '🏷️ Custom Categories Now Available!',
  'Artık mağazanız için özel kategoriler oluşturabilirsiniz! Sol menüden "Kategorilerim" bölümüne giderek ürünlerinizi kendi belirlediğiniz kategorilere ayırabilirsiniz.',
  'Sie können jetzt eigene Kategorien für Ihren Shop erstellen! Gehen Sie zu "Meine Kategorien" im Menü.',
  'You can now create custom categories for your shop! Go to "My Categories" from the menu.',
  ARRAY['starter', 'business', 'premium'], true, false
WHERE NOT EXISTS (SELECT 1 FROM public.shop_announcements WHERE title_tr = '🏷️ Özel Kategoriler Artık Aktif!');

-- ============================================
-- FINAL: Sıralama Düzeltmesi
-- ============================================

WITH ranked_faqs AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY display_order, created_at) as new_rank
  FROM public.shop_faqs
)
UPDATE public.shop_faqs
SET display_order = ranked_faqs.new_rank
FROM ranked_faqs
WHERE public.shop_faqs.id = ranked_faqs.id;
