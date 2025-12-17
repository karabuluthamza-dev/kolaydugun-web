-- Shop Announcements & FAQs Migration
-- Tedarikçi paneli için SSS ve Admin Bildirimleri

-- =====================================================
-- 1. SHOP ANNOUNCEMENTS (Admin → Tedarikçilere Bildirim)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-language title
    title_tr TEXT NOT NULL,
    title_de TEXT,
    title_en TEXT,
    
    -- Multi-language content
    content_tr TEXT NOT NULL,
    content_de TEXT,
    content_en TEXT,
    
    -- Type: info, warning, new_feature, update, important
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'new_feature', 'update', 'important')),
    
    -- Target: all, starter, business, premium (hangi planlara gönderilsin)
    target_plans TEXT[] DEFAULT ARRAY['starter', 'business', 'premium'],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false, -- Sabit bildirim (üstte göster)
    
    -- Dates
    publish_at TIMESTAMPTZ DEFAULT NOW(), -- Zamanlanmış yayın
    expires_at TIMESTAMPTZ, -- Geçerlilik süresi (null = süresiz)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SHOP ANNOUNCEMENT READS (Okunma Takibi)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES shop_announcements(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shop_accounts(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Her mağaza bir bildirimi sadece 1 kez okuyabilir
    UNIQUE(announcement_id, shop_id)
);

-- =====================================================
-- 3. SHOP FAQS (Sık Sorulan Sorular)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-language question
    question_tr TEXT NOT NULL,
    question_de TEXT,
    question_en TEXT,
    
    -- Multi-language answer (Markdown destekli)
    answer_tr TEXT NOT NULL,
    answer_de TEXT,
    answer_en TEXT,
    
    -- Kategorilendirme
    category TEXT DEFAULT 'general', -- general, products, affiliate, billing, account
    
    -- Sıralama ve durum
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shop_announcements_active ON shop_announcements(is_active, publish_at);
CREATE INDEX IF NOT EXISTS idx_shop_announcements_type ON shop_announcements(type);
CREATE INDEX IF NOT EXISTS idx_shop_announcement_reads_shop ON shop_announcement_reads(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_faqs_active ON shop_faqs(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_shop_faqs_category ON shop_faqs(category);

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================
ALTER TABLE shop_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_faqs ENABLE ROW LEVEL SECURITY;

-- Announcements: Everyone can read active ones, only admin can modify
CREATE POLICY "Anyone can view active announcements" ON shop_announcements
    FOR SELECT USING (is_active = true AND publish_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admin can manage announcements" ON shop_announcements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- Announcement Reads: Users can mark their own reads
CREATE POLICY "Users can read announcement reads" ON shop_announcement_reads
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reads" ON shop_announcement_reads
    FOR INSERT WITH CHECK (
        shop_id IN (SELECT id FROM shop_accounts WHERE user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- FAQs: Everyone can read active ones, only admin can modify
CREATE POLICY "Anyone can view active FAQs" ON shop_faqs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage FAQs" ON shop_faqs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

-- =====================================================
-- 6. SAMPLE DATA - FAQs
-- =====================================================
INSERT INTO shop_faqs (question_tr, question_de, question_en, answer_tr, answer_de, answer_en, category, display_order) VALUES
(
    'Nasıl ürün eklerim?',
    'Wie füge ich ein Produkt hinzu?',
    'How do I add a product?',
    '**Ürünlerim** menüsüne gidin ve **+ Yeni Ürün Ekle** butonuna tıklayın. Ürün bilgilerini girin, resimler ekleyin ve kaydedin. Ürününüz onay için gönderilecektir.',
    'Gehen Sie zum Menü **Meine Produkte** und klicken Sie auf **+ Neues Produkt hinzufügen**. Geben Sie die Produktinformationen ein, fügen Sie Bilder hinzu und speichern Sie. Ihr Produkt wird zur Genehmigung eingereicht.',
    'Go to **My Products** menu and click **+ Add New Product**. Enter product details, add images and save. Your product will be submitted for approval.',
    'products',
    1
),
(
    'Ürün limiti nedir?',
    'Was ist das Produktlimit?',
    'What is the product limit?',
    'Her plan farklı ürün limitine sahiptir:\n\n- **Starter**: 5 ürün\n- **Business**: 20 ürün\n- **Premium**: Sınırsız\n\nLimitinizi artırmak için planınızı yükseltin.',
    'Jeder Plan hat ein unterschiedliches Produktlimit:\n\n- **Starter**: 5 Produkte\n- **Business**: 20 Produkte\n- **Premium**: Unbegrenzt\n\nUpgraden Sie Ihren Plan, um Ihr Limit zu erhöhen.',
    'Each plan has different product limits:\n\n- **Starter**: 5 products\n- **Business**: 20 products\n- **Premium**: Unlimited\n\nUpgrade your plan to increase your limit.',
    'products',
    2
),
(
    'Affiliate sistemi nasıl çalışır?',
    'Wie funktioniert das Affiliate-System?',
    'How does the affiliate system work?',
    '**Affiliate Kodunuz** ile yeni mağaza sahipleri davet edebilirsiniz. Davet ettiğiniz kişi ücretli plana geçtiğinde, ilk ay **%10**, sonraki aylar **%5** komisyon kazanırsınız!\n\n📍 Affiliate kodunuzu **Başlangıç** sayfasında bulabilirsiniz.',
    'Mit Ihrem **Affiliate-Code** können Sie neue Shop-Besitzer einladen. Wenn die eingeladene Person auf einen kostenpflichtigen Plan umsteigt, erhalten Sie **10%** im ersten Monat und **5%** in den Folgemonaten!\n\n📍 Ihren Affiliate-Code finden Sie auf der **Übersicht**-Seite.',
    'With your **Affiliate Code**, you can invite new shop owners. When someone you invite upgrades to a paid plan, you earn **10%** commission the first month and **5%** thereafter!\n\n📍 Find your affiliate code on the **Dashboard** page.',
    'affiliate',
    3
),
(
    'Planımı nasıl yükseltirim?',
    'Wie upgrade ich meinen Plan?',
    'How do I upgrade my plan?',
    'Planınızı yükseltmek için iletişime geçin. PayPal veya banka transferi ile ödeme yapabilirsiniz.\n\n📧 info@kolaydugun.de',
    'Um Ihren Plan zu upgraden, kontaktieren Sie uns. Sie können per PayPal oder Banküberweisung bezahlen.\n\n📧 info@kolaydugun.de',
    'To upgrade your plan, contact us. You can pay via PayPal or bank transfer.\n\n📧 info@kolaydugun.de',
    'billing',
    4
),
(
    'Ürünlerim ne zaman onaylanır?',
    'Wann werden meine Produkte genehmigt?',
    'When will my products be approved?',
    'Ürünler genellikle **24-48 saat** içinde incelenir. Ürününüz uygunsa onaylanır, aksi halde red sebebi bildirilir.',
    'Produkte werden normalerweise innerhalb von **24-48 Stunden** überprüft. Wenn Ihr Produkt den Richtlinien entspricht, wird es genehmigt, andernfalls wird der Ablehnungsgrund mitgeteilt.',
    'Products are typically reviewed within **24-48 hours**. If your product meets guidelines, it will be approved; otherwise, the rejection reason will be provided.',
    'products',
    5
),
(
    'İstatistikler ne anlama geliyor?',
    'Was bedeuten die Statistiken?',
    'What do the statistics mean?',
    '📊 **İstatistikler** sayfasında:\n\n- **Görüntüleme**: Ürünleriniz kaç kez görüntülendi\n- **Tıklama**: Kaç kez iletişim butonuna tıklandı\n- **Paylaşım**: Kaç kez paylaşıldı\n\n*Not: İstatistikler Business ve Premium planlarda mevcuttur.*',
    '📊 Auf der **Statistiken**-Seite:\n\n- **Ansichten**: Wie oft Ihre Produkte angesehen wurden\n- **Klicks**: Wie oft auf den Kontakt-Button geklickt wurde\n- **Shares**: Wie oft geteilt wurde\n\n*Hinweis: Statistiken sind in Business- und Premium-Plänen verfügbar.*',
    '📊 On the **Analytics** page:\n\n- **Views**: How many times your products were viewed\n- **Clicks**: How many times contact button was clicked\n- **Shares**: How many times shared\n\n*Note: Analytics are available in Business and Premium plans.*',
    'general',
    6
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. SAMPLE ANNOUNCEMENTS
-- =====================================================
INSERT INTO shop_announcements (title_tr, title_de, title_en, content_tr, content_de, content_en, type, is_pinned) VALUES
(
    '🎉 Shop Marketplace''e Hoş Geldiniz!',
    '🎉 Willkommen im Shop Marketplace!',
    '🎉 Welcome to Shop Marketplace!',
    'KolayDugun Shop Marketplace''e hoş geldiniz! Burada ürünlerinizi sergileyebilir, müşterilerinizle iletişim kurabilir ve işinizi büyütebilirsiniz.\n\nHerhangi bir sorunuz için **SSS** bölümüne göz atın veya bizimle iletişime geçin.',
    'Willkommen im KolayDugun Shop Marketplace! Hier können Sie Ihre Produkte präsentieren, mit Kunden kommunizieren und Ihr Geschäft ausbauen.\n\nBei Fragen werfen Sie einen Blick auf den **FAQ**-Bereich oder kontaktieren Sie uns.',
    'Welcome to KolayDugun Shop Marketplace! Here you can showcase your products, communicate with customers, and grow your business.\n\nFor any questions, check out the **FAQ** section or contact us.',
    'info',
    true
)
ON CONFLICT DO NOTHING;

-- Done!
COMMENT ON TABLE shop_announcements IS 'Admin bildirimleri - tedarikçilere duyurular';
COMMENT ON TABLE shop_faqs IS 'Sık sorulan sorular - tedarikçi yardım merkezi';
