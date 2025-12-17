-- Shop Rental Marketplace - Database Updates
-- Date: 2025-12-12
-- Purpose: Add contact fields, vendor shop settings, and shop plans

-- ============================================
-- 1. SHOP_PRODUCTS - New Contact Fields
-- ============================================

-- WhatsApp number for direct customer contact
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Email for inquiries
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Phone number
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- External URL (vendor's website, Instagram, etc.)
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Price display options
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN DEFAULT false;

-- View tracking
ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ============================================
-- 2. VENDORS - Shop Settings
-- ============================================

-- Is shop feature enabled for this vendor?
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS shop_enabled BOOLEAN DEFAULT false;

-- How many products can this vendor add?
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS shop_product_limit INTEGER DEFAULT 0;

-- Current shop plan (none, starter, business, premium)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS shop_plan TEXT DEFAULT 'none';

-- When does the shop plan expire?
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS shop_plan_expires_at TIMESTAMPTZ;

-- ============================================
-- 3. SHOP_PLANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shop_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL DEFAULT '{"tr": "", "de": "", "en": ""}',
    description JSONB DEFAULT '{"tr": "", "de": "", "en": ""}',
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    product_limit INTEGER NOT NULL DEFAULT 5,
    features JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INSERT DEFAULT SHOP PLANS
-- ============================================

INSERT INTO shop_plans (slug, name, description, price_monthly, price_yearly, product_limit, features, is_featured, display_order)
VALUES 
    ('starter', 
     '{"tr": "Starter", "de": "Starter", "en": "Starter"}',
     '{"tr": "Küçük işletmeler için ideal başlangıç paketi", "de": "Ideales Startpaket für kleine Unternehmen", "en": "Ideal starter package for small businesses"}',
     19.00, 190.00, 5,
     '[
        {"tr": "5 ürün listeleme", "de": "5 Produktlistungen", "en": "5 product listings"},
        {"tr": "WhatsApp butonu", "de": "WhatsApp-Button", "en": "WhatsApp button"},
        {"tr": "Temel istatistikler", "de": "Grundlegende Statistiken", "en": "Basic statistics"},
        {"tr": "E-posta desteği", "de": "E-Mail-Support", "en": "Email support"}
     ]',
     false, 1),
     
    ('business',
     '{"tr": "Business", "de": "Business", "en": "Business"}',
     '{"tr": "Büyüyen işletmeler için profesyonel paket", "de": "Professionelles Paket für wachsende Unternehmen", "en": "Professional package for growing businesses"}',
     39.00, 390.00, 20,
     '[
        {"tr": "20 ürün listeleme", "de": "20 Produktlistungen", "en": "20 product listings"},
        {"tr": "WhatsApp butonu", "de": "WhatsApp-Button", "en": "WhatsApp button"},
        {"tr": "Öncelikli listeleme", "de": "Prioritäre Listung", "en": "Priority listing"},
        {"tr": "Detaylı istatistikler", "de": "Detaillierte Statistiken", "en": "Detailed statistics"},
        {"tr": "Öncelikli destek", "de": "Prioritärer Support", "en": "Priority support"}
     ]',
     true, 2),
     
    ('premium',
     '{"tr": "Premium", "de": "Premium", "en": "Premium"}',
     '{"tr": "Maksimum görünürlük ve sınırsız özellikler", "de": "Maximale Sichtbarkeit und unbegrenzte Funktionen", "en": "Maximum visibility and unlimited features"}',
     69.00, 690.00, -1, -- -1 means unlimited
     '[
        {"tr": "Sınırsız ürün listeleme", "de": "Unbegrenzte Produktlistungen", "en": "Unlimited product listings"},
        {"tr": "WhatsApp butonu", "de": "WhatsApp-Button", "en": "WhatsApp button"},
        {"tr": "Ana sayfada öne çıkarma", "de": "Hervorhebung auf der Startseite", "en": "Featured on homepage"},
        {"tr": "Doğrulanmış tedarikçi rozeti", "de": "Verifiziertes Lieferanten-Badge", "en": "Verified supplier badge"},
        {"tr": "Gelişmiş analitik", "de": "Erweiterte Analytik", "en": "Advanced analytics"},
        {"tr": "7/24 öncelikli destek", "de": "24/7 Prioritärer Support", "en": "24/7 priority support"}
     ]',
     false, 3)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    product_limit = EXCLUDED.product_limit,
    features = EXCLUDED.features,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order;

-- ============================================
-- 5. RLS POLICIES FOR SHOP_PLANS
-- ============================================

ALTER TABLE shop_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
DROP POLICY IF EXISTS "shop_plans_select_public" ON shop_plans;
CREATE POLICY "shop_plans_select_public" ON shop_plans
    FOR SELECT USING (is_active = true);

-- Admin can manage all plans
DROP POLICY IF EXISTS "shop_plans_admin_all" ON shop_plans;
CREATE POLICY "shop_plans_admin_all" ON shop_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Get vendor's remaining product slots
CREATE OR REPLACE FUNCTION get_vendor_shop_remaining_slots(p_vendor_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_limit INTEGER;
    v_used INTEGER;
BEGIN
    -- Get the product limit (-1 means unlimited)
    SELECT COALESCE(shop_product_limit, 0) INTO v_limit
    FROM vendors WHERE id = p_vendor_id;
    
    -- If unlimited, return a high number
    IF v_limit = -1 THEN
        RETURN 9999;
    END IF;
    
    -- Count current approved/pending products
    SELECT COUNT(*) INTO v_used
    FROM shop_products 
    WHERE vendor_id = p_vendor_id 
    AND status IN ('approved', 'pending');
    
    RETURN GREATEST(0, v_limit - v_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if vendor can add more products
CREATE OR REPLACE FUNCTION can_vendor_add_product(p_vendor_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_enabled BOOLEAN;
    v_remaining INTEGER;
BEGIN
    -- Check if shop is enabled
    SELECT COALESCE(shop_enabled, false) INTO v_enabled
    FROM vendors WHERE id = p_vendor_id;
    
    IF NOT v_enabled THEN
        RETURN false;
    END IF;
    
    -- Check remaining slots
    v_remaining := get_vendor_shop_remaining_slots(p_vendor_id);
    
    RETURN v_remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE shop_products 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
