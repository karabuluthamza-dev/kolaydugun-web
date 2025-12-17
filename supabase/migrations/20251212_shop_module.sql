-- Shop Module Database Schema
-- Created: 2025-12-12
-- Purpose: Boutique Collection + Vendor Shop System

-- ============================================
-- SHOP CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shop_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name JSONB NOT NULL DEFAULT '{"tr": "", "de": "", "en": ""}',
    description JSONB DEFAULT '{"tr": "", "de": "", "en": ""}',
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_shop_categories_active ON shop_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_categories_order ON shop_categories(display_order);

-- ============================================
-- SHOP PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shop_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES shop_categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    title JSONB NOT NULL DEFAULT '{"tr": "", "de": "", "en": ""}',
    description JSONB DEFAULT '{"tr": "", "de": "", "en": ""}',
    image_url TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    product_type TEXT NOT NULL DEFAULT 'boutique' CHECK (product_type IN ('boutique', 'vendor', 'amazon')),
    amazon_url TEXT,
    amazon_asin TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    rejection_reason TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_vendor ON shop_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_type ON shop_products(product_type);

-- ============================================
-- SHOP INQUIRIES TABLE (Boutique Contact)
-- ============================================
CREATE TABLE IF NOT EXISTS shop_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_inquiries_status ON shop_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_shop_inquiries_product ON shop_inquiries(product_id);

-- ============================================
-- SHOP CLICKS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS shop_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES shop_products(id) ON DELETE CASCADE,
    click_type TEXT NOT NULL CHECK (click_type IN ('view', 'button', 'share')),
    referrer_page TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_clicks_product ON shop_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_clicks_date ON shop_clicks(clicked_at);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_shop_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS shop_categories_updated_at ON shop_categories;
CREATE TRIGGER shop_categories_updated_at
    BEFORE UPDATE ON shop_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_updated_at();

DROP TRIGGER IF EXISTS shop_products_updated_at ON shop_products;
CREATE TRIGGER shop_products_updated_at
    BEFORE UPDATE ON shop_products
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_clicks ENABLE ROW LEVEL SECURITY;

-- SHOP CATEGORIES POLICIES
-- Everyone can view active categories
CREATE POLICY "shop_categories_select_public" ON shop_categories
    FOR SELECT USING (is_active = true);

-- Admin can do everything
CREATE POLICY "shop_categories_admin_all" ON shop_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- SHOP PRODUCTS POLICIES
-- Everyone can view approved products
CREATE POLICY "shop_products_select_public" ON shop_products
    FOR SELECT USING (status = 'approved');

-- Vendors can view/manage their own products
CREATE POLICY "shop_products_vendor_select" ON shop_products
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shop_products_vendor_insert" ON shop_products
    FOR INSERT WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
        AND product_type = 'vendor'
    );

CREATE POLICY "shop_products_vendor_update" ON shop_products
    FOR UPDATE USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "shop_products_vendor_delete" ON shop_products
    FOR DELETE USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- Admin can do everything
CREATE POLICY "shop_products_admin_all" ON shop_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- SHOP INQUIRIES POLICIES
-- Anyone can insert inquiries (contact form)
CREATE POLICY "shop_inquiries_insert_public" ON shop_inquiries
    FOR INSERT WITH CHECK (true);

-- Admin can view/manage all inquiries
CREATE POLICY "shop_inquiries_admin_all" ON shop_inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- SHOP CLICKS POLICIES
-- Anyone can insert clicks (tracking)
CREATE POLICY "shop_clicks_insert_public" ON shop_clicks
    FOR INSERT WITH CHECK (true);

-- Admin can view all clicks
CREATE POLICY "shop_clicks_admin_select" ON shop_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- SAMPLE CATEGORIES (Optional)
-- ============================================
INSERT INTO shop_categories (slug, name, description, display_order, is_active)
VALUES 
    ('gelinlik-aksesuarlari', 
     '{"tr": "Gelinlik Aksesuarları", "de": "Brautaccessoires", "en": "Bridal Accessories"}',
     '{"tr": "Taçlar, peçeler ve daha fazlası", "de": "Kronen, Schleier und mehr", "en": "Tiaras, veils and more"}',
     1, true),
    ('dugun-dekorasyonu',
     '{"tr": "Düğün Dekorasyonu", "de": "Hochzeitsdekoration", "en": "Wedding Decoration"}',
     '{"tr": "Masa süsleri ve dekoratif ürünler", "de": "Tischdeko und dekorative Produkte", "en": "Table decorations and decorative items"}',
     2, true),
    ('davetiyeler',
     '{"tr": "Davetiyeler", "de": "Einladungen", "en": "Invitations"}',
     '{"tr": "Düğün davetiyeleri ve save the date kartları", "de": "Hochzeitseinladungen und Save-the-Date-Karten", "en": "Wedding invitations and save the date cards"}',
     3, true),
    ('hediyeler',
     '{"tr": "Hediyeler", "de": "Geschenke", "en": "Gifts"}',
     '{"tr": "Nikah şekerleri ve hatıra hediyeleri", "de": "Gastgeschenke und Andenken", "en": "Wedding favors and keepsakes"}',
     4, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get pending products count for admin
CREATE OR REPLACE FUNCTION get_pending_products_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM shop_products WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get product click stats
CREATE OR REPLACE FUNCTION get_product_click_stats(p_product_id UUID)
RETURNS TABLE(view_count BIGINT, button_count BIGINT, share_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE click_type = 'view') as view_count,
        COUNT(*) FILTER (WHERE click_type = 'button') as button_count,
        COUNT(*) FILTER (WHERE click_type = 'share') as share_count
    FROM shop_clicks
    WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
