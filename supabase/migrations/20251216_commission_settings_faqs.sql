-- Commission Settings FAQs
-- Migration: 20251216_commission_settings_faqs.sql

-- Add commission settings FAQs to shop_faqs table
INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Komisyon oranını nasıl değiştirebilirim?',
'Wie kann ich den Provisionssatz ändern?',
'How can I change the commission rate?',
'Komisyon oranı sistem yöneticisi tarafından belirlenir ve tüm shop owner''lar için geçerlidir.

**Default Oran:** %10

Eğer özel bir komisyon oranı almak istiyorsanız:
1. Destek ekibiyle iletişime geçin
2. Performansınızı ve satış hacminizi gösterin
3. Özel oran talebinde bulunun

💡 **İpucu:** Yüksek performans gösteren shop''lara özel oranlar verilebilir!',
'Der Provisionssatz wird vom Systemadministrator festgelegt und gilt für alle Shop-Besitzer.

**Standardsatz:** 10%

Wenn Sie einen speziellen Provisionssatz erhalten möchten:
1. Kontaktieren Sie das Support-Team
2. Zeigen Sie Ihre Leistung und Ihr Verkaufsvolumen
3. Fordern Sie einen speziellen Satz an

💡 **Tipp:** Hochleistungs-Shops können spezielle Sätze erhalten!',
'The commission rate is set by the system administrator and applies to all shop owners.

**Default Rate:** 10%

If you want to get a special commission rate:
1. Contact the support team
2. Show your performance and sales volume
3. Request a special rate

💡 **Tip:** High-performing shops can receive special rates!',
207, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Komisyon oranını nasıl değiştirebilirim?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Komisyon oranı ne zaman değişir?',
'Wann ändert sich der Provisionssatz?',
'When does the commission rate change?',
'Komisyon oranı şu durumlarda değişebilir:

**1. Platform Geneli Değişiklik**
- Yönetici default oranı değiştirirse
- Tüm shop''lar için geçerli olur
- Email ile bildirim gelir

**2. Özel Oran Verilmesi**
- Performansınıza göre
- Satış hacminize göre
- Özel anlaşma ile

**3. Promosyon Dönemleri**
- Özel kampanyalarda
- Sezonluk artışlar
- Geçici bonus oranları

📧 **Önemli:** Oran değişiklikleri her zaman önceden bildirilir!',
'Der Provisionssatz kann sich in folgenden Fällen ändern:

**1. Plattformweite Änderung**
- Wenn der Administrator den Standardsatz ändert
- Gilt für alle Shops
- Benachrichtigung per E-Mail

**2. Spezielle Satzgewährung**
- Basierend auf Ihrer Leistung
- Basierend auf Ihrem Verkaufsvolumen
- Durch spezielle Vereinbarung

**3. Aktionszeiträume**
- Bei speziellen Kampagnen
- Saisonale Erhöhungen
- Temporäre Bonussätze

📧 **Wichtig:** Satzänderungen werden immer im Voraus mitgeteilt!',
'The commission rate can change in the following cases:

**1. Platform-wide Change**
- If admin changes the default rate
- Applies to all shops
- Email notification sent

**2. Special Rate Grant**
- Based on your performance
- Based on your sales volume
- Through special agreement

**3. Promotional Periods**
- During special campaigns
- Seasonal increases
- Temporary bonus rates

📧 **Important:** Rate changes are always announced in advance!',
208, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Komisyon oranı ne zaman değişir?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Farklı ürünler için farklı komisyon oranları var mı?',
'Gibt es unterschiedliche Provisionssätze für verschiedene Produkte?',
'Are there different commission rates for different products?',
'Şu anda tüm ürünler için **tek bir komisyon oranı** geçerlidir.

**Mevcut Sistem:**
- Tüm ürünler: %10 (default)
- Kategori fark etmez
- Fiyat fark etmez

**Gelecek Özellik:** 🚀
Kategori bazlı komisyon sistemi planlanıyor:
- DJ Ekipmanı: %15
- Ses Sistemi: %10
- Işık Sistemi: %12
- vb.

💡 **Öneri:** Yüksek marjlı ürünlerinizi daha fazla tanıtın, daha fazla kazanırsınız!',
'Derzeit gilt **ein einziger Provisionssatz** für alle Produkte.

**Aktuelles System:**
- Alle Produkte: 10% (Standard)
- Kategorie spielt keine Rolle
- Preis spielt keine Rolle

**Zukünftige Funktion:** 🚀
Kategoriebasiertes Provisionssystem geplant:
- DJ-Ausrüstung: 15%
- Soundsystem: 10%
- Lichtsystem: 12%
- usw.

💡 **Tipp:** Bewerben Sie Ihre hochmargigen Produkte mehr, verdienen Sie mehr!',
'Currently, **a single commission rate** applies to all products.

**Current System:**
- All products: 10% (default)
- Category doesn''t matter
- Price doesn''t matter

**Future Feature:** 🚀
Category-based commission system planned:
- DJ Equipment: 15%
- Sound System: 10%
- Lighting System: 12%
- etc.

💡 **Tip:** Promote your high-margin products more, earn more!',
209, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Farklı ürünler için farklı komisyon oranları var mı?');

INSERT INTO public.shop_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT
'affiliate',
'Komisyon oranım neden değişti?',
'Warum hat sich mein Provisionssatz geändert?',
'Why did my commission rate change?',
'Komisyon oranınız şu nedenlerle değişmiş olabilir:

**1. Platform Geneli Güncelleme** 📢
- Yönetici default oranı değiştirdi
- Email bildirimi gönderildi
- Tüm shop''lar etkilendi

**2. Özel Oran Verildi** 🎉
- Performansınız ödüllendirildi
- Satış hedefinize ulaştınız
- Özel anlaşma yapıldı

**3. Promosyon Bitti** ⏰
- Geçici bonus sona erdi
- Normal orana dönüldü
- Önceden bildirildi

**4. Performans Düştü** 📉
- Satış hedefi tutturulamadı
- Müşteri şikayetleri
- Kalite sorunları

📧 **Kontrol:** Email kutunuzu kontrol edin, bildirim gönderilmiş olmalı!',
'Ihr Provisionssatz kann sich aus folgenden Gründen geändert haben:

**1. Plattformweites Update** 📢
- Administrator hat Standardsatz geändert
- E-Mail-Benachrichtigung gesendet
- Alle Shops betroffen

**2. Spezieller Satz gewährt** 🎉
- Ihre Leistung wurde belohnt
- Verkaufsziel erreicht
- Spezielle Vereinbarung getroffen

**3. Aktion beendet** ⏰
- Temporärer Bonus beendet
- Zurück zum Normalsatz
- Im Voraus mitgeteilt

**4. Leistung gesunken** 📉
- Verkaufsziel nicht erreicht
- Kundenbeschwerden
- Qualitätsprobleme

📧 **Prüfen:** Überprüfen Sie Ihren E-Mail-Posteingang, Benachrichtigung sollte gesendet worden sein!',
'Your commission rate may have changed for the following reasons:

**1. Platform-wide Update** 📢
- Admin changed default rate
- Email notification sent
- All shops affected

**2. Special Rate Granted** 🎉
- Your performance was rewarded
- Sales target reached
- Special agreement made

**3. Promotion Ended** ⏰
- Temporary bonus ended
- Returned to normal rate
- Announced in advance

**4. Performance Dropped** 📉
- Sales target not met
- Customer complaints
- Quality issues

📧 **Check:** Check your email inbox, notification should have been sent!',
210, true
WHERE NOT EXISTS (SELECT 1 FROM public.shop_faqs WHERE question_tr = 'Komisyon oranım neden değişti?');
