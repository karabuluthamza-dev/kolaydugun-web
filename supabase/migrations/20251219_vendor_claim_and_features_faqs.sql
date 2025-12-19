-- ============================================
-- Vendor Claim, Ranking, and AI Insights FAQs
-- Supporting TR, DE, EN
-- ============================================

INSERT INTO public.site_faqs (category, question_tr, question_en, question_de, answer_tr, answer_en, answer_de, display_order, is_active)
VALUES
-- VENDOR CLAIM
('vendors', 
 'İşletme profilimi nasıl sahiplenebilirim?',
 'How can I claim my business profile?',
 'Wie kann ich mein Unternehmensprofil beanspruchen?',
 'Sayfanızdaki "Bu İşletmeyi Sahiplen" butonuna tıklayıp formu doldurarak talep oluşturabilirsiniz. Yönetici onayından sonra profil size devredilir.',
 'Click the "Claim This Business" button on your page and fill out the form to create a request. After admin approval, the profile will be transferred to you.',
 'Klicken Sie auf die Schaltfläche „Dieses Unternehmen beanspruchen“ auf Ihrer Seite und füllen Sie das Formular aus, um eine Anfrage zu erstellen. Nach der Admin-Genehmigung wird das Profil an Sie übertragen.',
 31, true),

-- SUCCESS SCORE
('vendors',
 'Sıralama puanı (Success Score) nedir ve nasıl hesaplanır?',
 'What is the Success Score and how is it calculated?',
 'Was ist der Erfolgs-Score (Success Score) und wie wird er berechnet?',
 'Profil doluluğu, fotoğraf kalitesi, yorumlar ve dönüşüm oranlarınıza göre AI tarafından hesaplanır. Yüksek puan, üst sıralarda görünmenizi sağlar.',
 'It is calculated by AI based on your profile completeness, photo quality, reviews, and conversion rates. A high score ensures you appear higher in rankings.',
 'Er wird von der KI basierend auf Ihrer Profilvollständigkeit, Fotoqualität, Bewertungen und Konversionsraten berechnet. Eine hohe Punktzahl sorgt dafür, dass Sie weiter oben erscheinen.',
 32, true),

-- BOOSTING
('vendors',
 'Nasıl daha üst sıralara çıkabilirim?',
 'How can I move up in the rankings?',
 'Wie kann ich in der Rangliste weiter nach oben kommen?',
 'Kaliteli fotoğraflar ekleyerek, yorum sayınızı artırarak ve AI tavsiyelerini uygulayarak puanınızı artırabilirsiniz.',
 'You can increase your score by adding high-quality photos, increasing your review count, and implementing AI recommendations.',
 'Sie können Ihre Punktzahl erhöhen, indem Sie hochwertige Fotos hinzufügen, die Anzahl Ihrer Bewertungen steigern und die KI-Empfehlungen umsetzen.',
 33, true),

-- TOP 3 REWARDS
('vendors',
 'Sıralamada ilk 3''e girmenin avantajları nelerdir?',
 'What are the benefits of being in the Top 3 rankings?',
 'Was sind die Vorteile, wenn man in die Top 3 der Rangliste kommt?',
 '"Ücretsiz Vitrin" ödülü kazanma fırsatı yakalar ve arama sonuçlarında en üstte, özel vurguyla görünürsünüz.',
 'You get a chance to win a "Free Vitrine" reward and appear at the very top of search results with special emphasis.',
 'Sie haben die Chance, eine „Kostenlose Vitrine“-Prämie zu gewinnen, und erscheinen ganz oben in den Suchergebnissen, mit spezieller Hervorhebung.',
 34, true),

-- AI UPDATE FREQUENCY
('vendors',
 'AI Performans Analizi raporu ne sıklıkla güncellenir?',
 'How often is the AI Performance Analysis report updated?',
 'Wie oft wird der KI-Leistungsanalysebericht aktualisiert?',
 'Verileriniz haftalık olarak analiz edilir ve raporunuz her Pazartesi sabahı güncellenir.',
 'Your data is analyzed weekly and your report is updated every Monday morning.',
 'Ihre Daten werden wöchentlich analysiert und Ihr Bericht wird jeden Montagmorgen aktualisiert.',
 35, true),

-- CLAIMED BADGE (GENERAL)
('general',
 'Onaylı (Sahiplenilmiş) profil ne anlama gelir?',
 'What does a Claimed profile mean?',
 'Was bedeutet ein beanspruchtes (Claimed) Profil?',
 'İşletmenin gerçek sahibi tarafından doğrulandığını ve platformda aktif olduğunu gösterir. Güvenilirliği simgeler.',
 'It indicates that the business has been verified by the actual owner and is active on the platform. It symbolizes trustworthiness.',
 'Es zeigt an, dass das Unternehmen vom eigentlichen Inhaber verifiziert wurde und auf der Plattform aktiv ist. Es steht für Zuverlässigkeit.',
 6, true);
