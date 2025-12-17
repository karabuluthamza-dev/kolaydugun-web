-- Shop & Mağaza FAQ entries
-- Clear distinction between main shop and vendor shops
-- 3 language support: TR, DE, EN

INSERT INTO site_faqs (
    category,
    question_tr,
    question_de,
    question_en,
    answer_tr,
    answer_de,
    answer_en,
    display_order,
    is_active
) VALUES 

-- Ana Shop (Amazon) nedir?
(
    'general',
    'Mağaza bölümünde ne tür ürünler bulabilirim?',
    'Welche Produkte finde ich im Shop-Bereich?',
    'What kind of products can I find in the shop section?',
    'Mağaza bölümümüzde düğün hazırlığınız için özenle seçilmiş ürünler bulabilirsiniz: dekorasyon malzemeleri, masa süslemeleri, hediye fikirleri, gelin aksesuarları ve daha fazlası. Ürünlerimiz kalite standartlarına göre editörlerimiz tarafından seçilmektedir.',
    'In unserem Shop-Bereich finden Sie sorgfältig ausgewählte Produkte für Ihre Hochzeitsvorbereitung: Dekorationsmaterialien, Tischdekorationen, Geschenkideen, Brautaccessoires und mehr. Unsere Produkte werden von unseren Redakteuren nach Qualitätsstandards ausgewählt.',
    'In our shop section, you can find carefully curated products for your wedding preparation: decoration materials, table decorations, gift ideas, bridal accessories and more. Our products are selected by our editors based on quality standards.',
    100,
    true
),

-- Tedarikçi mağaza sistemi
(
    'vendors',
    'Tedarikçi olarak kendi mağazamı açabilir miyim?',
    'Kann ich als Anbieter meinen eigenen Shop eröffnen?',
    'Can I open my own shop as a vendor?',
    'Evet! Tedarikçi olarak KolayDugun platformunda kendi mağazanızı açabilirsiniz. Mağazanızda dijital davetiyeler, süslemeler, hediye paketleri ve düğünle ilgili her türlü ürünü satabilirsiniz. Başvuru için Mağaza menüsünden başvuru formunu doldurun.',
    'Ja! Als Anbieter können Sie Ihren eigenen Shop auf der KolayDugun-Plattform eröffnen. In Ihrem Shop können Sie digitale Einladungen, Dekorationen, Geschenkpakete und alle Arten von Hochzeitsprodukten verkaufen. Füllen Sie das Bewerbungsformular im Shop-Menü aus.',
    'Yes! As a vendor, you can open your own shop on the KolayDugun platform. In your shop, you can sell digital invitations, decorations, gift packages and all kinds of wedding products. Fill out the application form from the Shop menu.',
    101,
    true
),

-- Mağaza başvuru süreci
(
    'vendors',
    'Mağaza başvuru süreci nasıl işliyor?',
    'Wie funktioniert der Shop-Bewerbungsprozess?',
    'How does the shop application process work?',
    'Mağaza açmak için: 1) Tedarikçi hesabınızla giriş yapın, 2) Mağaza menüsünden başvuru formunu doldurun, 3) İşletme bilgilerinizi ve ürün kategorinizi belirtin, 4) Başvurunuz incelendikten sonra onay alın. Onay sonrası hemen ürün eklemeye başlayabilirsiniz.',
    'Um einen Shop zu eröffnen: 1) Melden Sie sich mit Ihrem Anbieterkonto an, 2) Füllen Sie das Bewerbungsformular im Shop-Menü aus, 3) Geben Sie Ihre Geschäftsinformationen und Produktkategorie an, 4) Erhalten Sie nach Prüfung die Genehmigung. Nach der Genehmigung können Sie sofort Produkte hinzufügen.',
    'To open a shop: 1) Log in with your vendor account, 2) Fill out the application form from the Shop menu, 3) Specify your business information and product category, 4) Get approval after review. After approval, you can start adding products immediately.',
    102,
    true
),

-- Demo mağaza
(
    'general',
    'Demo mağazayı nasıl görebilirim?',
    'Wie kann ich den Demo-Shop sehen?',
    'How can I see the demo shop?',
    'Tedarikçi panelindeki Mağaza bölümünden veya ana sayfadaki promosyon alanından demo mağazayı inceleyebilirsiniz. Demo mağazada gerçek ürün örnekleri ve yönetim paneli önizlemesi görebilirsiniz. Bu sayede mağaza deneyimini satın almadan önce test edebilirsiniz.',
    'Sie können den Demo-Shop im Shop-Bereich des Anbieter-Panels oder im Werbebereich auf der Startseite ansehen. Im Demo-Shop sehen Sie echte Produktbeispiele und eine Vorschau des Verwaltungspanels. So können Sie die Shop-Erfahrung vor dem Kauf testen.',
    'You can view the demo shop from the Shop section in the vendor panel or from the promotion area on the homepage. In the demo shop, you can see real product examples and a management panel preview. This way, you can test the shop experience before purchasing.',
    103,
    true
),

-- Ana mağazada ürün sergileme
(
    'vendors',
    'Ürünlerim ana mağazada da görünebilir mi?',
    'Können meine Produkte auch im Hauptshop erscheinen?',
    'Can my products also appear in the main shop?',
    'Evet! Ana mağazamızda çiftlerin en çok aradığı ürünler sergilenmektedir. Ürününüzün burada yer alması için başvuru yapabilirsiniz. Başvuruda beklentiler: yüksek kaliteli görseller, detaylı ürün açıklamaları ve doğru bilgiler. Her başvuru ekibimiz tarafından değerlendirilir. Not: Kendi mağazanızda istediğiniz ürünü özgürce ekleyebilirsiniz.',
    'Ja! In unserem Hauptshop werden die von Paaren meistgesuchten Produkte präsentiert. Sie können sich bewerben, damit Ihr Produkt hier erscheint. Erwartungen bei der Bewerbung: hochwertige Bilder, detaillierte Produktbeschreibungen und korrekte Informationen. Jede Bewerbung wird von unserem Team geprüft. Hinweis: In Ihrem eigenen Shop können Sie frei Produkte hinzufügen.',
    'Yes! Our main shop displays the most searched products by couples. You can apply for your product to appear here. Application expectations: high-quality images, detailed product descriptions and accurate information. Every application is reviewed by our team. Note: In your own shop, you can freely add products.',
    104,
    true
),

-- Affiliate programı
(
    'vendors',
    'Affiliate programı nasıl çalışır?',
    'Wie funktioniert das Affiliate-Programm?',
    'How does the affiliate program work?',
    'Mağaza sahiplerine özel bir referans kodu verilir. Bu kodu paylaşarak yeni tedarikçiler veya müşteriler getirdiğinizde kazanç elde edersiniz. Kazançlarınızı mağaza panelinizden takip edebilir ve belirli tutara ulaştığınızda çekim talep edebilirsiniz.',
    'Shop-Inhaber erhalten einen speziellen Empfehlungscode. Wenn Sie diesen Code teilen und neue Anbieter oder Kunden gewinnen, verdienen Sie Geld. Sie können Ihre Einnahmen in Ihrem Shop-Panel verfolgen und bei Erreichen eines bestimmten Betrags eine Auszahlung beantragen.',
    'Shop owners receive a special referral code. When you share this code and bring new vendors or customers, you earn money. You can track your earnings from your shop panel and request a withdrawal when you reach a certain amount.',
    105,
    true
);
