-- Create FAQ table for Amazon Shop page
CREATE TABLE IF NOT EXISTS shop_page_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_tr TEXT NOT NULL,
    question_de TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_tr TEXT NOT NULL,
    answer_de TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE shop_page_faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Anyone can view active FAQs" ON shop_page_faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON shop_page_faqs;

-- Public can read active FAQs
CREATE POLICY "Anyone can view active FAQs"
    ON shop_page_faqs
    FOR SELECT
    USING (is_active = true);

-- Only admins can manage FAQs
CREATE POLICY "Admins can manage FAQs"
    ON shop_page_faqs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert sample FAQs
INSERT INTO shop_page_faqs (question_tr, question_de, question_en, answer_tr, answer_de, answer_en, display_order) VALUES
(
    'Bu ürünler nedir?',
    'Was sind diese Produkte?',
    'What are these products?',
    'Bunlar editörlerimiz tarafından seçilmiş Amazon.de affiliate ürünleridir. Satın aldığınızda Amazon''dan teslim alırsınız ve güvenli ödeme garantisi vardır.',
    'Dies sind von unseren Redakteuren ausgewählte Affiliate-Produkte von Amazon.de. Beim Kauf erhalten Sie die Lieferung von Amazon mit sicherer Zahlungsgarantie.',
    'These are Amazon.de affiliate products curated by our editors. When you purchase, you receive delivery from Amazon with secure payment guarantee.',
    1
),
(
    'Tedarikçi olarak kendi ürünlerimi buraya ekleyebilir miyim?',
    'Kann ich als Anbieter meine eigenen Produkte hier hinzufügen?',
    'Can I add my own products here as a vendor?',
    'Bu bölümde genellikle Amazon ürünleri yayınlanır. Ancak kendi mağazanızdan kaliteli ürünleriniz varsa, admin onayıyla burada da yayınlanabilir! Mağaza panelinden ürünlerinizi ekleyin ve "Ana Mağazaya Başvur" ile gönderin. İnceleme sonrası uygun ürünleriniz burada da görünür.',
    'In diesem Bereich werden hauptsächlich Amazon-Produkte veröffentlicht. Wenn Sie jedoch hochwertige Produkte in Ihrem Shop haben, können diese nach Admin-Genehmigung auch hier veröffentlicht werden! Fügen Sie Ihre Produkte über Ihr Shop-Panel hinzu und senden Sie sie mit "Zum Hauptshop vorschlagen" ein. Nach Prüfung werden passende Produkte auch hier angezeigt.',
    'This section mainly features Amazon products. However, if you have quality products in your shop, they can also be featured here with admin approval! Add your products through your shop panel and submit them via "Submit to Main Shop". After review, suitable products will be displayed here too.',
    2
),
(
    'Kendi mağazamı nasıl açarım?',
    'Wie eröffne ich meinen eigenen Shop?',
    'How do I open my own shop?',
    'Ana menüden "Tedarikçiler İçin" bölümüne giderek başvuru yapabilirsiniz. Başvurunuz incelendikten sonra kendi mağaza sayfanız aktif olur ve ürünlerinizi listeleyebilirsiniz.',
    'Sie können sich über den Bereich "Für Anbieter" im Hauptmenü bewerben. Nach Prüfung Ihrer Bewerbung wird Ihre Shop-Seite aktiviert und Sie können Ihre Produkte listen.',
    'You can apply through the "For Vendors" section in the main menu. After your application is reviewed, your shop page will be activated and you can list your products.',
    3
),
(
    'Amazon Shop ve Tedarikçi Mağazası arasındaki fark nedir?',
    'Was ist der Unterschied zwischen Amazon Shop und Anbieter-Shops?',
    'What is the difference between Amazon Shop and Vendor Shops?',
    'Amazon Shop: Editör onaylı affiliate ürünler, hızlı göz atma. Tedarikçi Mağazası: Kendi ürünleriniz, tam kontrol, kişisel branding, doğrudan müşteri iletişimi. İki sistem birbirini tamamlar!',
    'Amazon Shop: Redaktionell genehmigte Affiliate-Produkte, schnelles Stöbern. Anbieter-Shops: Ihre eigenen Produkte, volle Kontrolle, persönliches Branding, direkte Kundenkommunikation. Beide Systeme ergänzen sich!',
    'Amazon Shop: Editor-approved affiliate products, quick browsing. Vendor Shops: Your own products, full control, personal branding, direct customer communication. Both systems complement each other!',
    4
),
(
    'Örnek bir tedarikçi mağazasını görebilir miyim?',
    'Kann ich einen Beispiel-Anbieter-Shop sehen?',
    'Can I see an example vendor shop?',
    'Elbette! DJ34 mağazamız mükemmel bir örnektir: /shop/magaza/dj34-istanbul-wedding-events-mj4uxnsf - Profesyonel bir mağazanın nasıl görünebileceğini burada görebilirsiniz.',
    'Natürlich! Unser DJ34-Shop ist ein perfektes Beispiel: /shop/magaza/dj34-istanbul-wedding-events-mj4uxnsf - Hier können Sie sehen, wie ein professioneller Shop aussehen kann.',
    'Of course! Our DJ34 shop is a perfect example: /shop/magaza/dj34-istanbul-wedding-events-mj4uxnsf - You can see how a professional shop can look here.',
    5
);

-- Create index for ordering (idempotent)
DROP INDEX IF EXISTS idx_shop_faqs_order;
CREATE INDEX idx_shop_faqs_order ON shop_page_faqs(display_order ASC) WHERE is_active = true;
