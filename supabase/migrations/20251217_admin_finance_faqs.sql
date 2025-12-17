-- Finans Modülü - Admin FAQ'ları
-- Bu SQL Supabase Dashboard'da çalıştırılmalıdır

INSERT INTO shop_faqs (question_tr, answer_tr, question_de, answer_de, question_en, answer_en, category, "order", is_published)
VALUES

-- Finans Genel
('Finans panelindeki veriler nereden geliyor?', 
 E'Finans paneli 4 farklı kaynaktan veri çeker:\n\n1. **Gelirler (income_records)**: Manuel eklenen gelir kayıtları\n2. **Giderler (expense_records)**: Manuel eklenen gider kayıtları\n3. **PayPal Gelirleri (transactions)**: Vendor''ların PayPal ile satın aldığı kredi paketleri\n4. **Affiliate Ödemeleri (shop_affiliate_earnings)**: Mağaza sahiplerine ödenen komisyonlar\n\nPayPal verileri otomatik, diğerleri manuel girilir.',
 'Woher kommen die Daten im Finanzpanel?',
 E'Das Finanzpanel bezieht Daten aus 4 verschiedenen Quellen:\n\n1. **Einnahmen (income_records)**: Manuell eingegebene Einnahmen\n2. **Ausgaben (expense_records)**: Manuell eingegebene Ausgaben\n3. **PayPal-Einnahmen (transactions)**: Kreditpakete, die Anbieter mit PayPal gekauft haben\n4. **Affiliate-Zahlungen (shop_affiliate_earnings)**: An Shopinhaber gezahlte Provisionen',
 'Where does the Finance panel data come from?',
 E'The Finance panel pulls data from 4 different sources:\n\n1. **Income (income_records)**: Manually added income records\n2. **Expenses (expense_records)**: Manually added expense records\n3. **PayPal Income (transactions)**: Credit packages purchased by vendors via PayPal\n4. **Affiliate Payouts (shop_affiliate_earnings)**: Commissions paid to shop owners',
 'admin-finance', 1, true),

-- PayPal Gelirleri
('PayPal Gelirleri tab''ında ne görüyorum?',
 E'Bu tab, tedarikçilerin (vendor) PayPal ile satın aldığı kredi paketlerini gösterir.\n\n**Gösterilen bilgiler:**\n- Tarih\n- Tedarikçi adı\n- Satın alınan kredi miktarı\n- Ödeme tutarı (EUR)\n- Onay durumu\n- PayPal Order ID\n\n**Veri kaynağı:** transactions tablosu (type = ''credit_purchase'')',
 'Was sehe ich im Tab PayPal-Einnahmen?',
 'Dieser Tab zeigt die von Anbietern mit PayPal gekauften Kreditpakete.',
 'What do I see in the PayPal Income tab?',
 'This tab shows credit packages purchased by vendors using PayPal.',
 'admin-finance', 2, true),

-- Affiliate Ödemeleri
('Affiliate Ödemeleri tab''ında ne görüyorum?',
 E'Bu tab, mağaza sahiplerine PayPal ile ödenen affiliate komisyonlarını gösterir.\n\n**Gösterilen bilgiler:**\n- Ödeme tarihi\n- Mağaza adı\n- Komisyon tutarı\n- PayPal Batch ID\n\n**Veri kaynağı:** shop_affiliate_earnings tablosu (status = ''paid'')\n\nNot: Sadece "paid" durumundaki ödemeler burada görünür.',
 'Was sehe ich im Tab Affiliate-Zahlungen?',
 'Dieser Tab zeigt die an Shopinhaber mit PayPal gezahlten Affiliate-Provisionen.',
 'What do I see in the Affiliate Payouts tab?',
 'This tab shows affiliate commissions paid to shop owners via PayPal.',
 'admin-finance', 3, true),

-- PayPal Sandbox vs Live
('PayPal Sandbox ve Live arasındaki fark nedir?',
 E'**Sandbox (Test Ortamı):**\n- Gerçek para transferi olmaz\n- Test hesaplar kullanılır\n- developer.paypal.com/dashboard/applications/sandbox\n\n**Live (Canlı Ortam):**\n- Gerçek para transferi yapılır\n- Gerçek PayPal hesapları kullanılır\n- developer.paypal.com/dashboard/applications/live\n\n**Credentials Yerleri:**\n- Frontend (.env): VITE_PAYPAL_CLIENT_ID\n- Backend (Supabase Secrets): PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE',
 'Was ist der Unterschied zwischen PayPal Sandbox und Live?',
 'Sandbox ist die Testumgebung ohne echte Zahlungen. Live ist für echte Transaktionen.',
 'What is the difference between PayPal Sandbox and Live?',
 'Sandbox is the test environment with no real money. Live is for real transactions.',
 'admin-finance', 4, true),

-- Komisyon Akışı
('Affiliate komisyon akışı nasıl işliyor?',
 E'1. **Referral Link Tıklanır:** Mağaza sahibinin affiliate linki tıklanır\n2. **Başvuru Yapılır:** Yeni mağaza başvurusu oluşturulur (referrer_id kaydedilir)\n3. **Onay Verilir:** Admin başvuruyu onaylar → komisyon "pending" olarak oluşur\n4. **Ödeme Yapılır:** Admin /admin/shop-commissions sayfasından PayPal butonuna basar\n5. **Komisyon Ödenir:** PayPal payout API ile ödeme yapılır → status "paid" olur\n6. **Finans''ta Görünür:** /admin/finance → Affiliate Ödemeleri tab''ında görünür',
 'Wie funktioniert der Affiliate-Provisionsfluss?',
 'Referral-Link geklickt → Bewerbung → Genehmigung → Provision erstellt → PayPal-Auszahlung → In Finanzen sichtbar.',
 'How does the affiliate commission flow work?',
 'Referral link clicked → Application created → Approved → Commission created → PayPal payout → Visible in Finance.',
 'admin-finance', 5, true),

-- Kredi Satın Alma Akışı  
('Vendor kredi satın alma akışı nasıl işliyor?',
 E'1. **Vendor panele girer:** /vendor/dashboard\n2. **Cüzdan sekmesi:** Kredi Paketleri görüntülenir\n3. **Paket seçer:** PayPal butonu açılır\n4. **PayPal ile ödeme:** Sandbox/Live hesapla ödeme yapılır\n5. **Transaction kaydı:** transactions tablosuna kayıt eklenir\n6. **Kredi eklenir:** vendors.credit_balance güncellenir\n7. **Finans''ta görünür:** /admin/finance → PayPal Gelirleri tab''ında görünür',
 'Wie funktioniert der Kreditkauf für Anbieter?',
 'Anbieter-Dashboard → Wallet → Paket auswählen → PayPal-Zahlung → Kredit wird hinzugefügt.',
 'How does vendor credit purchase work?',
 'Vendor dashboard → Wallet → Select package → PayPal payment → Credit added.',
 'admin-finance', 6, true),

-- Önemli Tablolar
('Finans için hangi veritabanı tabloları önemli?',
 E'**Gelir/Gider (Manuel):**\n- income_records: Manuel gelir kayıtları\n- expense_records: Manuel gider kayıtları\n- recurring_income: Düzenli gelirler\n- recurring_expenses: Düzenli giderler\n- budget_vs_actual: Bütçe hedefleri\n\n**PayPal İşlemleri (Otomatik):**\n- transactions: Vendor kredi satın alımları\n- shop_affiliate_earnings: Affiliate komisyonları\n\n**İlişkili Tablolar:**\n- vendors: Tedarikçi bilgileri (credit_balance)\n- shop_accounts: Mağaza bilgileri (paypal_email)',
 'Welche Datenbanktabellen sind für Finanzen wichtig?',
 'income_records, expense_records, transactions, shop_affiliate_earnings sind die Haupttabellen.',
 'Which database tables are important for Finance?',
 'income_records, expense_records, transactions, shop_affiliate_earnings are the main tables.',
 'admin-finance', 7, true),

-- Sorun Giderme
('PayPal ödemesi başarısız olursa ne yapmalıyım?',
 E'**Kontrol Listesi:**\n\n1. **Credentials doğru mu?**\n   - Supabase > Edge Functions > Secrets\n   - PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE\n\n2. **Mağazanın paypal_email''i var mı?**\n   - shop_accounts.paypal_email alanı dolu olmalı\n\n3. **Edge Function deploy edildi mi?**\n   - supabase functions deploy paypal-payout\n\n4. **Error logları:**\n   - Supabase > Edge Functions > paypal-payout > Logs\n\n**Sık Hatalar:**\n- "Client Authentication failed" → Credentials yanlış\n- "Shop not found" → Mağaza kaydı eksik veya RLS sorunu\n- "PayPal email not found" → paypal_email kolonu boş',
 'Was soll ich tun, wenn die PayPal-Zahlung fehlschlägt?',
 'Credentials prüfen, paypal_email sicherstellen, Edge Function Logs überprüfen.',
 'What should I do if PayPal payment fails?',
 'Check credentials, ensure paypal_email exists, review Edge Function logs.',
 'admin-finance', 8, true);
