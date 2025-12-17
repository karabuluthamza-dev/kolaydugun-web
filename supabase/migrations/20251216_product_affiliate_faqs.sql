-- Product Affiliate System FAQs
-- Migration: 20251216_product_affiliate_faqs.sql

-- Add affiliate category FAQs
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Ürünlerim için affiliate linki nasıl oluştururum?',
'Wie erstelle ich einen Affiliate-Link für meine Produkte?',
'How do I create an affiliate link for my products?',
'1. Mağaza Paneli → Ürünlerim bölümüne gidin
2. Paylaşmak istediğiniz ürünü bulun
3. Ürünün yanındaki 📤 "Affiliate Link" butonuna tıklayın
4. Otomatik oluşturulan linki kopyalayın
5. WhatsApp, Facebook veya sosyal medyada paylaşın

💡 İpucu: Her ürün için unique link oluşturulur ve satışlar otomatik takip edilir.',
'1. Gehen Sie zu Shop-Panel → Meine Produkte
2. Finden Sie das Produkt, das Sie teilen möchten
3. Klicken Sie auf die 📤 "Affiliate-Link"-Schaltfläche neben dem Produkt
4. Kopieren Sie den automatisch generierten Link
5. Teilen Sie auf WhatsApp, Facebook oder sozialen Medien

💡 Tipp: Für jedes Produkt wird ein eindeutiger Link erstellt und Verkäufe werden automatisch verfolgt.',
'1. Go to Shop Panel → My Products
2. Find the product you want to share
3. Click the 📤 "Affiliate Link" button next to the product
4. Copy the automatically generated link
5. Share on WhatsApp, Facebook, or social media

💡 Tip: A unique link is created for each product and sales are automatically tracked.',
200, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Ürünlerim için affiliate linki nasıl oluştururum?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Affiliate komisyonu nasıl hesaplanır?',
'Wie wird die Affiliate-Provision berechnet?',
'How is affiliate commission calculated?',
'Komisyon Oranları:

📊 Standart Oran: %10
- Her satıştan %10 komisyon kazanırsınız

📈 Kademeli Sistem (Yakında):
- İlk 10 satış: %5
- 10-50 satış: %10
- 50+ satış: %15

Örnek:
- Ürün fiyatı: €100
- Komisyon (%10): €10
- Sizin kazancınız: €10

💡 İpucu: Daha fazla satış yaparsanız komisyon oranınız artar!',
'Provisionssätze:

📊 Standardsatz: 10%
- Sie verdienen 10% Provision pro Verkauf

📈 Gestaffeltes System (Demnächst):
- Erste 10 Verkäufe: 5%
- 10-50 Verkäufe: 10%
- 50+ Verkäufe: 15%

Beispiel:
- Produktpreis: €100
- Provision (10%): €10
- Ihr Verdienst: €10

💡 Tipp: Je mehr Sie verkaufen, desto höher wird Ihre Provision!',
'Commission Rates:

📊 Standard Rate: 10%
- You earn 10% commission per sale

📈 Tiered System (Coming Soon):
- First 10 sales: 5%
- 10-50 sales: 10%
- 50+ sales: 15%

Example:
- Product price: €100
- Commission (10%): €10
- Your earnings: €10

💡 Tip: The more you sell, the higher your commission rate!',
201, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate komisyonu nasıl hesaplanır?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Affiliate satışlarımı nasıl takip edebilirim?',
'Wie kann ich meine Affiliate-Verkäufe verfolgen?',
'How can I track my affiliate sales?',
'Affiliate Dashboard:

1. Mağaza Paneli → Affiliate bölümüne gidin
2. Görebileceğiniz bilgiler:
   - 📊 Toplam tıklama sayısı
   - 💰 Toplam kazanç
   - 🛒 Dönüşüm oranı
   - 📈 Ürün bazında performans

Raporlar:
- Günlük satış raporu
- Aylık kazanç özeti
- En çok satan ürünler
- Tıklama/satış oranı

💡 İpucu: Hangi ürünlerin daha iyi performans gösterdiğini görebilir ve stratejinizi buna göre ayarlayabilirsiniz.',
'Affiliate-Dashboard:

1. Gehen Sie zu Shop-Panel → Affiliate
2. Informationen, die Sie sehen können:
   - 📊 Gesamtanzahl der Klicks
   - 💰 Gesamtverdienst
   - 🛒 Conversion-Rate
   - 📈 Produktbasierte Leistung

Berichte:
- Täglicher Verkaufsbericht
- Monatliche Verdienstzusammenfassung
- Meistverkaufte Produkte
- Klick-/Verkaufsrate

💡 Tipp: Sie können sehen, welche Produkte besser abschneiden und Ihre Strategie entsprechend anpassen.',
'Affiliate Dashboard:

1. Go to Shop Panel → Affiliate
2. Information you can see:
   - 📊 Total click count
   - 💰 Total earnings
   - 🛒 Conversion rate
   - 📈 Product-based performance

Reports:
- Daily sales report
- Monthly earnings summary
- Best-selling products
- Click/sales ratio

💡 Tip: You can see which products perform better and adjust your strategy accordingly.',
202, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate satışlarımı nasıl takip edebilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Affiliate linkimi nerede paylaşabilirim?',
'Wo kann ich meinen Affiliate-Link teilen?',
'Where can I share my affiliate link?',
'En İyi Paylaşım Kanalları:

📱 Sosyal Medya:
- Instagram (Story, Bio, Post)
- Facebook (Grup, Sayfa, Profil)
- TikTok (Video açıklaması)
- Twitter/X

💬 Mesajlaşma:
- WhatsApp (Kişisel, Grup)
- Telegram
- Email

📝 İçerik:
- Blog yazıları
- YouTube video açıklamaları
- Forum gönderileri
- Ürün incelemeleri

🎯 En Etkili Stratejiler:
1. Kendi deneyiminizi paylaşın
2. Fotoğraf/video ile gösterin
3. Neden beğendiğinizi açıklayın
4. Hedef kitleye uygun platform seçin

⚠️ Dikkat: Spam yapmayın, organik paylaşım yapın!',
'Beste Sharing-Kanäle:

📱 Soziale Medien:
- Instagram (Story, Bio, Post)
- Facebook (Gruppe, Seite, Profil)
- TikTok (Videobeschreibung)
- Twitter/X

💬 Messaging:
- WhatsApp (Persönlich, Gruppe)
- Telegram
- Email

📝 Inhalt:
- Blog-Beiträge
- YouTube-Videobeschreibungen
- Forum-Posts
- Produktbewertungen

🎯 Effektivste Strategien:
1. Teilen Sie Ihre eigene Erfahrung
2. Zeigen Sie mit Foto/Video
3. Erklären Sie, warum Sie es mögen
4. Wählen Sie die richtige Plattform für Ihre Zielgruppe

⚠️ Achtung: Kein Spam, organisches Teilen!',
'Best Sharing Channels:

📱 Social Media:
- Instagram (Story, Bio, Post)
- Facebook (Group, Page, Profile)
- TikTok (Video description)
- Twitter/X

💬 Messaging:
- WhatsApp (Personal, Group)
- Telegram
- Email

📝 Content:
- Blog posts
- YouTube video descriptions
- Forum posts
- Product reviews

🎯 Most Effective Strategies:
1. Share your own experience
2. Show with photo/video
3. Explain why you like it
4. Choose the right platform for your audience

⚠️ Warning: No spam, organic sharing only!',
203, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate linkimi nerede paylaşabilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Affiliate kazancımı nasıl çekerim?',
'Wie kann ich meine Affiliate-Einnahmen abheben?',
'How can I withdraw my affiliate earnings?',
'Ödeme Süreci:

💰 Minimum Çekim: €50
📅 Ödeme Dönemi: Aylık
🏦 Ödeme Yöntemleri:
- Banka transferi (IBAN)
- PayPal
- Kredi kartı

Adımlar:
1. Mağaza Paneli → Affiliate → Ödemeler
2. Kazancınızı kontrol edin
3. "Ödeme Talep Et" butonuna tıklayın
4. Ödeme yöntemini seçin
5. Bilgilerinizi girin
6. Onaylayın

⏱️ İşlem Süresi:
- Talep: Anında
- İnceleme: 1-3 iş günü
- Ödeme: 3-5 iş günü

💡 İpucu: Minimum tutara ulaşmadan ödeme talep edemezsiniz.',
'Zahlungsprozess:

💰 Mindestauszahlung: €50
📅 Zahlungszeitraum: Monatlich
🏦 Zahlungsmethoden:
- Banküberweisung (IBAN)
- PayPal
- Kreditkarte

Schritte:
1. Shop-Panel → Affiliate → Zahlungen
2. Überprüfen Sie Ihre Einnahmen
3. Klicken Sie auf "Zahlung anfordern"
4. Wählen Sie die Zahlungsmethode
5. Geben Sie Ihre Informationen ein
6. Bestätigen Sie

⏱️ Bearbeitungszeit:
- Anfrage: Sofort
- Überprüfung: 1-3 Werktage
- Zahlung: 3-5 Werktage

💡 Tipp: Sie können keine Zahlung anfordern, bevor Sie den Mindestbetrag erreicht haben.',
'Payment Process:

💰 Minimum Withdrawal: €50
📅 Payment Period: Monthly
🏦 Payment Methods:
- Bank transfer (IBAN)
- PayPal
- Credit card

Steps:
1. Shop Panel → Affiliate → Payments
2. Check your earnings
3. Click "Request Payment"
4. Select payment method
5. Enter your information
6. Confirm

⏱️ Processing Time:
- Request: Instant
- Review: 1-3 business days
- Payment: 3-5 business days

💡 Tip: You cannot request payment before reaching the minimum amount.',
204, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate kazancımı nasıl çekerim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Birden fazla kişiye aynı linki verdim, kimden geldiğini nasıl anlarım?',
'Ich habe mehreren Personen denselben Link gegeben, wie erkenne ich, von wem er kommt?',
'I gave the same link to multiple people, how do I know who it came from?',
'Unique Tracking Sistemi:

🔑 Her Shop Owner''a Unique Kod:
- Sizin kodunuz: ref=G773YSTQ
- Başka shop: ref=A123BCDE
- Her kod farklı kişiye ait

📊 Tracking Nasıl Çalışır:

1. Link Formatı:
   kolaydugun.de/shop/urun/dj-paketi?ref=G773YSTQ
                                          ↑
                                    Sizin unique kodunuz

2. Birisi Tıklayınca:
   - ref parametresi yakalanır
   - Cookie''ye kaydedilir (30 gün)
   - Satın alırsa size bağlanır

3. Raporlarda Görebilirsiniz:
   - Hangi üründen kaç tıklama
   - Hangi üründen kaç satış
   - Toplam kazanç

💡 Önemli: Aynı linki 100 kişiye verseniz bile, hepsi sizin kodunuzla gelir ve size komisyon kazandırır!',
'Unique Tracking-System:

🔑 Jeder Shop-Besitzer hat einen eindeutigen Code:
- Ihr Code: ref=G773YSTQ
- Anderer Shop: ref=A123BCDE
- Jeder Code gehört einer anderen Person

📊 Wie funktioniert Tracking:

1. Link-Format:
   kolaydugun.de/shop/urun/dj-paketi?ref=G773YSTQ
                                          ↑
                                    Ihr eindeutiger Code

2. Wenn jemand klickt:
   - ref-Parameter wird erfasst
   - In Cookie gespeichert (30 Tage)
   - Bei Kauf wird Ihnen zugeordnet

3. In Berichten sehen Sie:
   - Wie viele Klicks pro Produkt
   - Wie viele Verkäufe pro Produkt
   - Gesamtverdienst

💡 Wichtig: Auch wenn Sie denselben Link an 100 Personen senden, kommen alle mit Ihrem Code und Sie verdienen Provision!',
'Unique Tracking System:

🔑 Each Shop Owner Has a Unique Code:
- Your code: ref=G773YSTQ
- Another shop: ref=A123BCDE
- Each code belongs to a different person

📊 How Tracking Works:

1. Link Format:
   kolaydugun.de/shop/urun/dj-paketi?ref=G773YSTQ
                                          ↑
                                    Your unique code

2. When Someone Clicks:
   - ref parameter is captured
   - Saved in cookie (30 days)
   - If they purchase, linked to you

3. In Reports You See:
   - How many clicks per product
   - How many sales per product
   - Total earnings

💡 Important: Even if you send the same link to 100 people, they all come with your code and you earn commission!',
205, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Birden fazla kişiye aynı linki verdim, kimden geldiğini nasıl anlarım?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Affiliate programı için ücret var mı?',
'Gibt es eine Gebühr für das Affiliate-Programm?',
'Is there a fee for the affiliate program?',
'Tamamen Ücretsiz! 🎉

✅ Katılım Ücreti: €0
✅ Aylık Ücret: €0
✅ Link Oluşturma: €0
✅ Komisyon Kesintisi: Yok

Nasıl Kazanıyoruz:
- Siz satış yaparsınız → Komisyon kazanırsınız
- Platform satış yapar → Kendi payını alır
- Herkes kazanır! 🤝

Örnek:
- Ürün fiyatı: €100
- Sizin komisyonunuz: €10 (%10)
- Platform geliri: €90
- Müşteri ürünü alır: €100

💡 Risk Yok: Sadece satış yaptığınızda kazanırsınız, hiçbir ön ödeme yok!',
'Völlig kostenlos! 🎉

✅ Teilnahmegebühr: €0
✅ Monatliche Gebühr: €0
✅ Link-Erstellung: €0
✅ Provisionsabzug: Keine

Wie wir verdienen:
- Sie machen Verkäufe → Sie verdienen Provision
- Plattform macht Verkäufe → Nimmt ihren Anteil
- Alle gewinnen! 🤝

Beispiel:
- Produktpreis: €100
- Ihre Provision: €10 (10%)
- Plattformeinnahmen: €90
- Kunde erhält Produkt: €100

💡 Kein Risiko: Sie verdienen nur, wenn Sie verkaufen, keine Vorauszahlung!',
'Completely Free! 🎉

✅ Joining Fee: €0
✅ Monthly Fee: €0
✅ Link Creation: €0
✅ Commission Deduction: None

How We Earn:
- You make sales → You earn commission
- Platform makes sales → Takes its share
- Everyone wins! 🤝

Example:
- Product price: €100
- Your commission: €10 (10%)
- Platform revenue: €90
- Customer gets product: €100

💡 No Risk: You only earn when you sell, no upfront payment!',
206, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate programı için ücret var mı?');
