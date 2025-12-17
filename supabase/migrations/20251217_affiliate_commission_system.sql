-- Migration: Affiliate Commission & Subscription System
-- Creates tables for tracking commissions, subscriptions, and payments

-- ============================================
-- 1. SHOP_AFFILIATE_EARNINGS - Komisyon Takibi
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_affiliate_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kim kazandı?
    earning_shop_id UUID REFERENCES public.shop_accounts(id) ON DELETE CASCADE,
    
    -- Kaynak türü
    earning_type TEXT NOT NULL DEFAULT 'platform_referral', 
    -- 'platform_referral' = yeni mağaza getirdi
    -- 'product_click' = ürün tıklaması (gelecek için)
    
    -- İlişkili kayıtlar
    referred_shop_id UUID REFERENCES public.shop_accounts(id) ON DELETE SET NULL,
    subscription_id UUID, -- shop_subscriptions tablosuna referans
    product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
    campaign_slug TEXT, -- Hangi kampanyadan geldi
    
    -- Para bilgileri
    sale_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- %10
    commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    
    -- Durum
    status TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' = beklemede
    -- 'approved' = onaylandı
    -- 'paid' = ödendi
    -- 'cancelled' = iptal edildi
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Notlar
    admin_notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_earning_type CHECK (earning_type IN ('platform_referral', 'product_click', 'subscription_renewal')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'paid', 'cancelled'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_shop ON public.shop_affiliate_earnings(earning_shop_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON public.shop_affiliate_earnings(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_created ON public.shop_affiliate_earnings(created_at DESC);

-- ============================================
-- 2. SHOP_SUBSCRIPTIONS - Abonelik Takibi
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shop_accounts(id) ON DELETE CASCADE,
    
    -- Plan bilgileri
    plan TEXT NOT NULL, -- 'basic', 'pro', 'enterprise'
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
    
    -- Durum
    status TEXT NOT NULL DEFAULT 'pending',
    -- 'pending' = ödeme bekliyor
    -- 'active' = aktif
    -- 'cancelled' = iptal edildi
    -- 'expired' = süresi doldu
    
    -- PayPal bilgileri
    paypal_subscription_id TEXT,
    paypal_order_id TEXT,
    paypal_payer_id TEXT,
    
    -- Referans takibi
    referred_by UUID REFERENCES public.shop_accounts(id) ON DELETE SET NULL,
    referral_code TEXT, -- Hangi kod ile geldi
    
    -- Tarihler
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_plan CHECK (plan IN ('basic', 'pro', 'enterprise', 'free')),
    CONSTRAINT valid_subscription_status CHECK (status IN ('pending', 'active', 'cancelled', 'expired'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_shop ON public.shop_subscriptions(shop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.shop_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_referred_by ON public.shop_subscriptions(referred_by);

-- ============================================
-- 3. SHOP_PAYMENTS - Ödeme Geçmişi
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kim ödedi / kime ödendi
    shop_id UUID REFERENCES public.shop_accounts(id) ON DELETE CASCADE,
    
    -- Ödeme türü
    payment_type TEXT NOT NULL,
    -- 'subscription' = abonelik ödemesi
    -- 'commission_payout' = komisyon ödemesi (admin -> tedarikçi)
    -- 'credit_purchase' = kredi satın alma
    
    -- İlişkili kayıtlar
    subscription_id UUID REFERENCES public.shop_subscriptions(id) ON DELETE SET NULL,
    earning_id UUID REFERENCES public.shop_affiliate_earnings(id) ON DELETE SET NULL,
    
    -- Para bilgileri
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    -- Yön
    direction TEXT NOT NULL DEFAULT 'incoming',
    -- 'incoming' = mağazadan platforma
    -- 'outgoing' = platformdan mağazaya (komisyon)
    
    -- PayPal bilgileri
    paypal_transaction_id TEXT,
    paypal_payer_email TEXT,
    
    -- Durum
    status TEXT NOT NULL DEFAULT 'pending',
    -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Notlar
    description TEXT,
    admin_notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_payment_type CHECK (payment_type IN ('subscription', 'commission_payout', 'credit_purchase')),
    CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT valid_direction CHECK (direction IN ('incoming', 'outgoing'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_shop ON public.shop_payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.shop_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.shop_payments(created_at DESC);

-- ============================================
-- 4. RLS POLİCİES
-- ============================================

-- Enable RLS
ALTER TABLE public.shop_affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_payments ENABLE ROW LEVEL SECURITY;

-- Earnings: Shop owners can see their own earnings
CREATE POLICY "Shop owners can view own earnings"
    ON public.shop_affiliate_earnings FOR SELECT
    USING (
        earning_shop_id IN (
            SELECT id FROM public.shop_accounts 
            WHERE user_id = auth.uid()
        )
    );

-- Earnings: Admin can see all
CREATE POLICY "Admin can manage all earnings"
    ON public.shop_affiliate_earnings FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Subscriptions: Shop owners can see their own
CREATE POLICY "Shop owners can view own subscriptions"
    ON public.shop_subscriptions FOR SELECT
    USING (
        shop_id IN (
            SELECT id FROM public.shop_accounts 
            WHERE user_id = auth.uid()
        )
    );

-- Subscriptions: Admin can manage all
CREATE POLICY "Admin can manage all subscriptions"
    ON public.shop_subscriptions FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Payments: Shop owners can see their own
CREATE POLICY "Shop owners can view own payments"
    ON public.shop_payments FOR SELECT
    USING (
        shop_id IN (
            SELECT id FROM public.shop_accounts 
            WHERE user_id = auth.uid()
        )
    );

-- Payments: Admin can manage all
CREATE POLICY "Admin can manage all payments"
    ON public.shop_payments FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function: Calculate and record commission when subscription is paid
CREATE OR REPLACE FUNCTION public.record_affiliate_commission(
    p_subscription_id UUID,
    p_referred_by UUID,
    p_sale_amount DECIMAL,
    p_commission_rate DECIMAL DEFAULT 10.00
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_commission_amount DECIMAL;
    v_earning_id UUID;
BEGIN
    -- Calculate commission
    v_commission_amount := p_sale_amount * (p_commission_rate / 100);
    
    -- Insert earning record
    INSERT INTO public.shop_affiliate_earnings (
        earning_shop_id,
        earning_type,
        subscription_id,
        sale_amount,
        commission_rate,
        commission_amount,
        status
    ) VALUES (
        p_referred_by,
        'platform_referral',
        p_subscription_id,
        p_sale_amount,
        p_commission_rate,
        v_commission_amount,
        'pending'
    )
    RETURNING id INTO v_earning_id;
    
    RETURN v_earning_id;
END;
$$;

-- Function: Get total earnings for a shop
CREATE OR REPLACE FUNCTION public.get_shop_earnings_summary(p_shop_id UUID)
RETURNS TABLE (
    total_earned DECIMAL,
    pending_amount DECIMAL,
    paid_amount DECIMAL,
    total_referrals BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(commission_amount), 0) as total_earned,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid_amount,
        COUNT(DISTINCT referred_shop_id) as total_referrals
    FROM public.shop_affiliate_earnings
    WHERE earning_shop_id = p_shop_id
    AND status != 'cancelled';
END;
$$;
