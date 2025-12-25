-- FAQ Additions for Live Request System
-- Date: 2024-12-25
-- Category: vendors

-- 1. Canlı İstek Paneli nedir?
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Canlı İstek Paneli nedir?',
    'Was ist das Live-Wunsch-Panel?',
    'What is the Live Request Panel?',
    'Canlı İstek Paneli, düğün sırasında misafirlerin anlık olarak müzik isteği gönderebildiği, bahşiş verebildiği ve DJ/Müzisyen ile etkileşime girebildiği interaktif bir sistemdir. Bu panel sayesinde misafir memnuniyetini artırabilir ve yeni gelir modelleri (kredi/bahşiş) oluşturabilirsiniz.',
    'Das Live-Wunsch-Panel ist ein interaktives System, mit dem Gäste während der Hochzeit Musikwünsche senden, Trinkgeld geben und mit dem DJ/Musiker interagieren können. Es erhöht die Gästezufriedenheit und bietet neue Einnahmodelle.',
    'The Live Request Panel is an interactive system where guests can send music requests, give tips, and interact with the DJ/Musician during the wedding. It increases guest satisfaction and offers new revenue models.',
    55, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Canlı İstek Paneli nedir?');

-- 2. Ücretsiz deneme süresi bittikten sonra ne olur?
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Ücretsiz deneme süresi bittikten sonra ne olur?',
    'Was passiert nach Ablauf der Testversion?',
    'What happens after the free trial ends?',
    '24 saatlik ücretsiz deneme süreniz dolduğunda sistem otomatik olarak kilitlenir. Panel erişimine devam etmek için 20 kredi karşılığında günlük geçiş alabilir veya Premium pakete yükselterek sınırsız erişim sağlayabilirsiniz.',
    'Nach Ablauf der 24-stündigen Testphase wird das System gesperrt. Um fortzufahren, können Sie einen Tagespass für 20 Credits erwerben oder auf Premium upgraden.',
    'After the 24-hour trial ends, the system will lock automatically. To continue, you can purchase a daily pass for 20 credits or upgrade to the Premium plan for unlimited access.',
    56, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Ücretsiz deneme süresi bittikten sonra ne olur?');

-- 3. Kredi ile 24 saatlik erişim nasıl çalışır?
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Kredi ile 24 saatlik erişim nasıl çalışır?',
    'Wie funktioniert der 24-Stunden-Zugang mit Credits?',
    'How does 24-hour access with credits work?',
    'Eğer Premium paketiniz yoksa, sadece ihtiyacınız olan günlerde (düğün günü vb.) 20 kredi harcayarak Canlı İstek Paneli''ni 24 saatliğine aktif edebilirsiniz. Krediler bakiyenizden düşülür ve süre bittiğinde panel tekrar kilitlenir.',
    'Wenn Sie kein Premium-Paket haben, können Sie das Panel für 24 Stunden aktivieren, indem Sie 20 Credits ausgeben. Dies ist ideal für einzelne Hochzeitstage.',
    'If you don''t have a Premium plan, you can activate the panel for 24 hours by spending 20 credits. This is ideal for specific wedding days.',
    57, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Kredi ile 24 saatlik erişim nasıl çalışır?');

-- 4. Premium paketin avantajları nelerdir?
INSERT INTO public.site_faqs (category, question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order, is_active)
SELECT 
    'vendors',
    'Premium paketin avantajları nelerdir?',
    'Was sind die Vorteile des Premium-Pakets?',
    'What are the advantages of the Premium plan?',
    'Premium paket üyeleri Canlı İstek Paneli''ne herhangi bir kredi harcamadan sınırsız erişim sağlarlar. Ayrıca listede üst sıralarda görünme, onaylı rozeti ve gelişmiş istatistikler gibi birçok ek avantaja sahip olurlar.',
    'Premium-Mitglieder haben unbegrenzten Zugriff auf das Live-Wunsch-Panel ohne Credit-Einsatz. Zudem erhalten sie Top-Platzierungen und ein verifiziertes Badge.',
    'Premium members have unlimited access to the Live Request Panel without spending credits. They also get top placement and a verified badge.',
    58, true
WHERE NOT EXISTS (SELECT 1 FROM public.site_faqs WHERE question_tr = 'Premium paketin avantajları nelerdir?');
