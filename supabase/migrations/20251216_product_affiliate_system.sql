-- Product Affiliate System
-- Migration: 20251216_product_affiliate_system.sql

-- Create product affiliate clicks tracking table
CREATE TABLE IF NOT EXISTS public.product_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.shop_products(id) ON DELETE CASCADE,
    referred_by UUID REFERENCES public.shop_accounts(id) ON DELETE SET NULL,
    visitor_ip TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted BOOLEAN DEFAULT false,
    conversion_date TIMESTAMP WITH TIME ZONE,
    commission_amount DECIMAL(10, 2),
    commission_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_product_affiliate_clicks_product ON product_affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_affiliate_clicks_referrer ON product_affiliate_clicks(referred_by);
CREATE INDEX IF NOT EXISTS idx_product_affiliate_clicks_converted ON product_affiliate_clicks(converted) WHERE converted = true;

-- Add affiliate stats to shop_accounts
ALTER TABLE public.shop_accounts 
ADD COLUMN IF NOT EXISTS total_product_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_product_commission DECIMAL(10, 2) DEFAULT 0;

-- Function to track product affiliate click
CREATE OR REPLACE FUNCTION track_product_affiliate_click(
    p_product_id UUID,
    p_referral_code TEXT,
    p_visitor_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_referred_by UUID;
    v_click_id UUID;
BEGIN
    -- Find shop account by referral code
    SELECT id INTO v_referred_by
    FROM public.shop_accounts
    WHERE referral_code = p_referral_code
    LIMIT 1;
    
    -- If referral code not found, return NULL
    IF v_referred_by IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Insert click record
    INSERT INTO public.product_affiliate_clicks (
        product_id,
        referred_by,
        visitor_ip,
        user_agent
    ) VALUES (
        p_product_id,
        v_referred_by,
        p_visitor_ip,
        p_user_agent
    ) RETURNING id INTO v_click_id;
    
    RETURN v_click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversion and calculate commission
CREATE OR REPLACE FUNCTION mark_product_affiliate_conversion(
    p_product_id UUID,
    p_referral_code TEXT,
    p_sale_amount DECIMAL,
    p_commission_rate DECIMAL DEFAULT 0.10
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referred_by UUID;
    v_commission DECIMAL;
BEGIN
    -- Find shop account by referral code
    SELECT id INTO v_referred_by
    FROM public.shop_accounts
    WHERE referral_code = p_referral_code
    LIMIT 1;
    
    IF v_referred_by IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate commission
    v_commission := p_sale_amount * p_commission_rate;
    
    -- Update most recent unconverted click
    UPDATE public.product_affiliate_clicks
    SET 
        converted = true,
        conversion_date = NOW(),
        commission_amount = v_commission
    WHERE product_id = p_product_id
        AND referred_by = v_referred_by
        AND converted = false
        AND clicked_at > NOW() - INTERVAL '30 days'
    ORDER BY clicked_at DESC
    LIMIT 1;
    
    -- Update shop account stats
    UPDATE public.shop_accounts
    SET 
        total_product_referrals = total_product_referrals + 1,
        total_product_commission = total_product_commission + v_commission
    WHERE id = v_referred_by;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.product_affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their own affiliate clicks
CREATE POLICY "Shop owners can view own affiliate clicks"
ON public.product_affiliate_clicks
FOR SELECT
USING (
    referred_by IN (
        SELECT id FROM public.shop_accounts
        WHERE user_id = auth.uid()
    )
);

-- Admins can view all
CREATE POLICY "Admins can view all affiliate clicks"
ON public.product_affiliate_clicks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Grant permissions
GRANT SELECT ON public.product_affiliate_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION track_product_affiliate_click TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_product_affiliate_conversion TO authenticated;
