-- Commission Rate Settings System
-- Migration: 20251216_commission_rate_settings.sql

-- Add commission rate to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS default_commission_rate DECIMAL(5, 2) DEFAULT 10.00;

-- Add custom commission rate to shop_accounts
ALTER TABLE public.shop_accounts
ADD COLUMN IF NOT EXISTS custom_commission_rate DECIMAL(5, 2) DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.site_settings.default_commission_rate IS 'Default commission rate for all shops (percentage)';
COMMENT ON COLUMN public.shop_accounts.custom_commission_rate IS 'Custom commission rate for specific shop (overrides default if set)';

-- Function to get commission rate for a shop
CREATE OR REPLACE FUNCTION get_shop_commission_rate(p_shop_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_custom_rate DECIMAL;
    v_default_rate DECIMAL;
BEGIN
    -- Get custom rate for shop
    SELECT custom_commission_rate INTO v_custom_rate
    FROM public.shop_accounts
    WHERE id = p_shop_id;
    
    -- If custom rate exists, return it
    IF v_custom_rate IS NOT NULL THEN
        RETURN v_custom_rate;
    END IF;
    
    -- Otherwise return default rate
    SELECT default_commission_rate INTO v_default_rate
    FROM public.site_settings
    LIMIT 1;
    
    RETURN COALESCE(v_default_rate, 10.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update mark_product_affiliate_conversion to use dynamic rate
CREATE OR REPLACE FUNCTION mark_product_affiliate_conversion(
    p_product_id UUID,
    p_referral_code TEXT,
    p_sale_amount DECIMAL,
    p_commission_rate DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referred_by UUID;
    v_commission DECIMAL;
    v_rate DECIMAL;
BEGIN
    -- Find shop account by referral code
    SELECT id INTO v_referred_by
    FROM public.shop_accounts
    WHERE referral_code = p_referral_code
    LIMIT 1;
    
    IF v_referred_by IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get commission rate (use provided rate or get from settings)
    IF p_commission_rate IS NOT NULL THEN
        v_rate := p_commission_rate;
    ELSE
        v_rate := get_shop_commission_rate(v_referred_by);
    END IF;
    
    -- Calculate commission
    v_commission := p_sale_amount * (v_rate / 100);
    
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_shop_commission_rate TO authenticated;

-- Set initial default rate if not exists
UPDATE public.site_settings 
SET default_commission_rate = 10.00 
WHERE default_commission_rate IS NULL;
