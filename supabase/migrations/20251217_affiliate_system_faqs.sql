-- Migration: Comprehensive Affiliate System FAQs (3 Languages)
-- Category: affiliate (matching existing pattern)

-- ============================================
-- AFFILIATE PROGRAM FAQs - Corrected Format
-- ============================================

-- FAQ 1: What is the affiliate program?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Affiliate programi nedir?',
    'Was ist das Affiliate-Programm?',
    'What is the affiliate program?',
    'Affiliate programi, platformumuzu veya urunlerinizi tanitarak komisyon kazanmanizi saglayan bir sistemdir.

Iki tur affiliate var:

1. Platform Affiliate: Kendi referans linkinizi paylasarak yeni tedarikçiler kazandirirsiniz. Onlar abonelik satin aldiginda %10 komisyon kazanirsiniz.

2. Urun Affiliate: Diger tedarikcilerin urunlerini paylasabilirsiniz. Tiklamalar takip edilir, komisyon tedarikçiler arasinda belirlenir.

Baslamak icin Affiliate paneline gidin ve linkinizi kopyalayin!',
    
    'Das Affiliate-Programm ermöglicht es Ihnen, Provisionen zu verdienen, indem Sie unsere Plattform oder Ihre Produkte bewerben.

Es gibt zwei Arten von Affiliates:

1. Plattform-Affiliate: Teilen Sie Ihren Empfehlungslink, um neue Anbieter zu gewinnen. Wenn diese ein Abonnement kaufen, verdienen Sie 10% Provision.

2. Produkt-Affiliate: Sie können Produkte anderer Anbieter teilen. Klicks werden verfolgt, Provisionen werden zwischen den Anbietern vereinbart.

Gehen Sie zum Affiliate-Panel und kopieren Sie Ihren Link!',
    
    'The affiliate program allows you to earn commission by promoting our platform or your products.

There are two types of affiliates:

1. Platform Affiliate: Share your referral link to bring in new vendors. When they purchase a subscription, you earn 10% commission.

2. Product Affiliate: You can share other vendors products. Clicks are tracked, commissions are determined between vendors.

Go to the Affiliate panel and copy your link to get started!',
    100, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate programi nedir?');

-- FAQ 2: How to get affiliate link?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Affiliate linkimi nasil alirim?',
    'Wie bekomme ich meinen Affiliate-Link?',
    'How do I get my affiliate link?',
    'Affiliate linkinizi alma adimlari:

1. Panel > Affiliate menusune gidin
2. Ust kisimda affiliate kodunuz gorunecek (orn: G773YSTQ)
3. Linki Kopyala butonuna tiklayin
4. Link otomatik olarak kopyalanir

Link formati:
kolaydugun.de/shop/basvuru?ref=KODUNUZ

Bu linki sosyal medyada, WhatsApp gruplarinda veya web sitenizde paylasabilirsiniz!',
    
    'Schritte zum Erhalt Ihres Affiliate-Links:

1. Gehen Sie zu Panel > Affiliate
2. Oben sehen Sie Ihren Affiliate-Code (z.B. G773YSTQ)
3. Klicken Sie auf Link kopieren
4. Der Link wird automatisch kopiert

Link-Format:
kolaydugun.de/shop/basvuru?ref=IHRCODE

Teilen Sie diesen Link in sozialen Medien, WhatsApp-Gruppen oder auf Ihrer Website!',
    
    'Steps to get your affiliate link:

1. Go to Panel > Affiliate
2. You will see your affiliate code at the top (e.g., G773YSTQ)
3. Click Copy Link
4. The link is automatically copied

Link format:
kolaydugun.de/shop/basvuru?ref=YOURCODE

Share this link on social media, WhatsApp groups, or your website!',
    101, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate linkimi nasil alirim?');

-- FAQ 3: How to create campaign links?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Kampanya linki nasil olusturulur?',
    'Wie erstelle ich Kampagnen-Links?',
    'How do I create campaign links?',
    'Farkli platformlarda paylasimlarinizi takip etmek icin kampanya linkleri olusturabilirsiniz:

1. Affiliate > Yeni Kampanya butonuna tiklayin
2. Kampanya adi girin (orn: Instagram Reklami, TikTok Video)
3. Otomatik olarak benzersiz bir slug olusturulur
4. Kaydet > Kampanya linkiniz hazir!

Ornek kampanya linki:
kolaydugun.de/shop/basvuru?ref=G773YSTQ&c=instagram

Bu sayede hangi kampanyadan kac tiklama geldigini gorebilirsiniz.',
    
    'Sie können Kampagnen-Links erstellen, um Ihre Shares auf verschiedenen Plattformen zu verfolgen:

1. Klicken Sie auf Affiliate > Neue Kampagne
2. Geben Sie einen Kampagnennamen ein (z.B. Instagram-Werbung, TikTok-Video)
3. Ein eindeutiger Slug wird automatisch erstellt
4. Speichern > Ihr Kampagnen-Link ist fertig!

Beispiel Kampagnen-Link:
kolaydugun.de/shop/basvuru?ref=G773YSTQ&c=instagram

So können Sie sehen, wie viele Klicks von welcher Kampagne kamen.',
    
    'You can create campaign links to track your shares across different platforms:

1. Click Affiliate > New Campaign
2. Enter a campaign name (e.g., Instagram Ad, TikTok Video)
3. A unique slug is automatically generated
4. Save > Your campaign link is ready!

Example campaign link:
kolaydugun.de/shop/basvuru?ref=G773YSTQ&c=instagram

This way you can see how many clicks came from each campaign.',
    102, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Kampanya linki nasil olusturulur?');

-- FAQ 4: What is the commission rate?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Komisyon orani nedir?',
    'Wie hoch ist die Provisionsrate?',
    'What is the commission rate?',
    'Platform Affiliate Komisyonu:
- Yeni tedarikci getirdiginizde: %10
- Ornek: 49 Euro Pro abonelik = 4.90 Euro komisyon

Urun Affiliate:
- Urun komisyonlari tedarikçiler arasinda belirlenir
- Platform sadece tiklamalari takip eder
- Komisyon odemeleri dogrudan tedarikçiler arasinda yapilir

Not: Komisyon oranlari admin tarafindan guncellenebilir.',
    
    'Plattform-Affiliate-Provision:
- Wenn Sie einen neuen Anbieter bringen: 10%
- Beispiel: 49 Euro Pro-Abo = 4,90 Euro Provision

Produkt-Affiliate:
- Produktprovisionen werden zwischen Anbietern vereinbart
- Die Plattform verfolgt nur Klicks
- Provisionszahlungen erfolgen direkt zwischen den Anbietern

Hinweis: Provisionssätze können vom Admin aktualisiert werden.',
    
    'Platform Affiliate Commission:
- When you bring a new vendor: 10%
- Example: 49 Euro Pro subscription = 4.90 Euro commission

Product Affiliate:
- Product commissions are determined between vendors
- Platform only tracks clicks
- Commission payments are made directly between vendors

Note: Commission rates can be updated by admin.',
    103, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Komisyon orani nedir?');

-- FAQ 5: When do I get paid?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Komisyonumu ne zaman alirim?',
    'Wann bekomme ich meine Provision?',
    'When do I get my commission?',
    'Platform Affiliate odemeleri:
1. Referans verdiginiz tedarikci abonelik satin alir
2. PayPal odemesi onaylanir
3. Komisyonunuz Beklemede olarak gorunur
4. Her ayin sonunda odemeler yapilir
5. Minimum odeme tutari: 20 Euro

Odeme yontemleri:
- PayPal
- Banka havalesi

Panelden kazanclarinizi ve odeme gecmisinizi takip edebilirsiniz.',
    
    'Plattform-Affiliate-Zahlungen:
1. Der von Ihnen geworbene Anbieter kauft ein Abonnement
2. Die PayPal-Zahlung wird bestätigt
3. Ihre Provision erscheint als Ausstehend
4. Zahlungen erfolgen am Ende jedes Monats
5. Mindestauszahlungsbetrag: 20 Euro

Zahlungsmethoden:
- PayPal
- Banküberweisung

Sie können Ihre Einnahmen und Zahlungshistorie im Panel verfolgen.',
    
    'Platform Affiliate payments:
1. The vendor you referred purchases a subscription
2. PayPal payment is confirmed
3. Your commission appears as Pending
4. Payments are made at the end of each month
5. Minimum payout amount: 20 Euro

Payment methods:
- PayPal
- Bank transfer

You can track your earnings and payment history in the panel.',
    104, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Komisyonumu ne zaman alirim?');

-- FAQ 6: How to share products with affiliate links?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Urunleri affiliate linkiyle nasil paylasirim?',
    'Wie teile ich Produkte mit Affiliate-Links?',
    'How do I share products with affiliate links?',
    'Kendi urunlerinizi affiliate takibiyle paylasmak icin:

1. Urunlerim sayfasina gidin
2. Paylasmak istediginiz urunun yanindaki Link Olustur butonuna tiklayin
3. Acilan pencereden kampanya secin (opsiyonel)
4. Linki kopyalayin veya direkt WhatsApp/Facebook ta paylasin

Olusan link formati:
kolaydugun.de/shop/urun/urun-adi-xxxx?ref=KODUNUZ&c=kampanya

Bu sayede hangi kampanyadan kac tiklama geldigini takip edebilirsiniz.',
    
    'Um Ihre Produkte mit Affiliate-Tracking zu teilen:

1. Gehen Sie zur Seite Meine Produkte
2. Klicken Sie auf Link erstellen neben dem Produkt
3. Wählen Sie eine Kampagne aus dem Fenster (optional)
4. Kopieren Sie den Link oder teilen Sie ihn direkt auf WhatsApp/Facebook

Generiertes Link-Format:
kolaydugun.de/shop/urun/produkt-name-xxxx?ref=IHRCODE&c=kampagne

So können Sie verfolgen, wie viele Klicks von welcher Kampagne kamen.',
    
    'To share your products with affiliate tracking:

1. Go to My Products page
2. Click Create Link button next to the product
3. Select a campaign from the popup (optional)
4. Copy the link or share directly on WhatsApp/Facebook

Generated link format:
kolaydugun.de/shop/urun/product-name-xxxx?ref=YOURCODE&c=campaign

This way you can track how many clicks came from each campaign.',
    105, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Urunleri affiliate linkiyle nasil paylasirim?');

-- FAQ 7: Do I need to pay commission for product referrals?
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Urun referanslari icin komisyon odemem gerekiyor mu?',
    'Muss ich Provision für Produktempfehlungen zahlen?',
    'Do I need to pay commission for product referrals?',
    'Hayir, platform komisyon talep etmez.

Urun satislari icin komisyon sistemi tamamen tedarikçiler arasindadir:

1. Platform sadece tiklamalari takip eder
2. Satis olup olmadigini bilmiyoruz (odeme entegrasyonu yok)
3. Komisyon oranini siz belirlersiniz
4. Odemeyi dogrudan yaparsıniz (banka, PayPal, nakit vb.)

Oneri: Diger tedarikçilerle is birligi yapmadan once komisyon oranini netlestirin.',
    
    'Nein, die Plattform verlangt keine Provision.

Das Provisionssystem für Produktverkäufe liegt vollständig zwischen den Anbietern:

1. Die Plattform verfolgt nur Klicks
2. Wir wissen nicht, ob ein Verkauf stattgefunden hat
3. Sie bestimmen den Provisionssatz
4. Sie zahlen direkt (Bank, PayPal, Bargeld usw.)

Empfehlung: Klären Sie den Provisionssatz, bevor Sie mit anderen Anbietern zusammenarbeiten.',
    
    'No, the platform does not charge commission.

The commission system for product sales is entirely between vendors:

1. The platform only tracks clicks
2. We do not know if a sale occurred
3. You determine the commission rate
4. You pay directly (bank, PayPal, cash, etc.)

Recommendation: Clarify the commission rate before collaborating with other vendors.',
    106, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Urun referanslari icin komisyon odemem gerekiyor mu?');

-- FAQ 8: Tips for successful affiliate promotion
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Affiliate basarisi icin ipuclari',
    'Tipps für erfolgreiche Affiliate-Werbung',
    'Tips for successful affiliate promotion',
    'Etkili tanitim stratejileri:

1. Hedef kitlenizi taniyin
   - Dugun sektorundeki is arkadaslariniza ulasin
   - DJ, fotografci, mekan sahipleri ideal hedefler

2. Dogru platformlari kullanin
   - WhatsApp is gruplari
   - LinkedIn sektor gruplari
   - Instagram hikayeleri

3. Kisisel deneyiminizi paylasin
   - Platformu neden sevdiginizi anlatin
   - Somut faydalardan bahsedin

4. Kampanya takibi yapin
   - Her platform icin ayri kampanya olusturun
   - Hangi kanalin daha iyi calistigini analiz edin

5. Duzenli olun
   - Haftada en az 2-3 paylasim yapin
   - Farkli icerik formatlari deneyin',
    
    'Effektive Werbestrategien:

1. Kennen Sie Ihre Zielgruppe
   - Erreichen Sie Kollegen in der Hochzeitsbranche
   - DJs, Fotografen, Veranstaltungsorte sind ideale Ziele

2. Nutzen Sie die richtigen Plattformen
   - WhatsApp-Geschäftsgruppen
   - LinkedIn-Branchengruppen
   - Instagram-Stories

3. Teilen Sie Ihre persönliche Erfahrung
   - Erklären Sie, warum Sie die Plattform mögen
   - Sprechen Sie über konkrete Vorteile

4. Verfolgen Sie Kampagnen
   - Erstellen Sie separate Kampagnen für jede Plattform
   - Analysieren Sie, welcher Kanal besser funktioniert

5. Seien Sie konsequent
   - Teilen Sie mindestens 2-3 Mal pro Woche
   - Probieren Sie verschiedene Inhaltsformate',
    
    'Effective promotion strategies:

1. Know your target audience
   - Reach out to colleagues in the wedding industry
   - DJs, photographers, venue owners are ideal targets

2. Use the right platforms
   - WhatsApp business groups
   - LinkedIn industry groups
   - Instagram stories

3. Share your personal experience
   - Explain why you love the platform
   - Talk about concrete benefits

4. Track campaigns
   - Create separate campaigns for each platform
   - Analyze which channel works better

5. Be consistent
   - Share at least 2-3 times per week
   - Try different content formats',
    107, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Affiliate basarisi icin ipuclari');

-- FAQ 9: Minimum payout threshold
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 'affiliate',
    'Minimum odeme tutari var mi?',
    'Gibt es einen Mindestauszahlungsbetrag?',
    'Is there a minimum payout amount?',
    'Evet, minimum odeme tutari 20 Euro dur.

Bu limit asagidaki nedenlerle konulmustur:
- Islem maliyetlerini azaltmak
- Daha verimli odeme yonetimi

Limitin altindaysaniz:
- Kazanciniz bir sonraki aya devredilir
- Birikimli toplam 20 Euro ya ulastiginda odeme planlanir

Ornek:
- Ocak: 15 Euro kazandiniz > Devir
- Subat: 8 Euro kazandiniz > Toplam: 23 Euro
- Subat sonu: 23 Euro odenecek

Panelden guncel bakiyenizi ve beklenen odeme tarihini gorebilirsiniz.',
    
    'Ja, der Mindestauszahlungsbetrag beträgt 20 Euro.

Dieses Limit wurde aus folgenden Gründen festgelegt:
- Reduzierung der Transaktionskosten
- Effizientere Zahlungsverwaltung

Wenn Sie unter dem Limit sind:
- Ihre Einnahmen werden auf den nächsten Monat übertragen
- Bei kumulativer Summe von 20 Euro wird die Zahlung geplant

Beispiel:
- Januar: 15 Euro verdient > Übertrag
- Februar: 8 Euro verdient > Gesamt: 23 Euro
- Ende Februar: 23 Euro werden ausgezahlt

Sie können Ihren aktuellen Kontostand und das erwartete Zahlungsdatum im Panel sehen.',
    
    'Yes, the minimum payout amount is 20 Euro.

This limit was set for the following reasons:
- Reduce transaction costs
- More efficient payment management

If you are under the limit:
- Your earnings roll over to the next month
- When cumulative total reaches 20 Euro, payment is scheduled

Example:
- January: 15 Euro earned > Rollover
- February: 8 Euro earned > Total: 23 Euro
- End of February: 23 Euro to be paid

You can see your current balance and expected payment date in the panel.',
    108, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Minimum odeme tutari var mi?');
