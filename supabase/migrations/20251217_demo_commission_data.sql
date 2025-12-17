-- Demo Affiliate Commission Data
-- Creates sample commission records for testing

-- First, let's get the DJ34 shop ID and create some demo earnings
DO $$
DECLARE
    v_dj34_shop_id UUID;
    v_demo_shop_id UUID;
BEGIN
    -- Get DJ34 shop ID (the one with affiliate code)
    SELECT id INTO v_dj34_shop_id FROM public.shop_accounts WHERE slug LIKE 'dj34%' LIMIT 1;
    
    -- Get any other shop to be the "referred" shop
    SELECT id INTO v_demo_shop_id FROM public.shop_accounts WHERE slug LIKE 'wedding-essentials%' LIMIT 1;
    
    IF v_dj34_shop_id IS NOT NULL AND v_demo_shop_id IS NOT NULL THEN
        -- Insert demo earnings
        INSERT INTO public.shop_affiliate_earnings (
            earning_shop_id,
            earning_type,
            referred_shop_id,
            sale_amount,
            commission_rate,
            commission_amount,
            currency,
            status,
            created_at
        ) VALUES 
        -- Pending commission
        (
            v_dj34_shop_id,
            'platform_referral',
            v_demo_shop_id,
            39.00,
            10.00,
            3.90,
            'EUR',
            'pending',
            NOW() - INTERVAL '2 days'
        ),
        -- Approved commission
        (
            v_dj34_shop_id,
            'platform_referral',
            v_demo_shop_id,
            69.00,
            10.00,
            6.90,
            'EUR',
            'approved',
            NOW() - INTERVAL '7 days'
        ),
        -- Paid commission
        (
            v_dj34_shop_id,
            'platform_referral',
            v_demo_shop_id,
            19.00,
            10.00,
            1.90,
            'EUR',
            'paid',
            NOW() - INTERVAL '30 days'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Demo commission data inserted for DJ34 shop';
    ELSE
        RAISE NOTICE 'Could not find required shops for demo data';
    END IF;
END $$;

-- Also create a demo subscription if needed
INSERT INTO public.shop_subscriptions (
    shop_id,
    plan,
    price,
    currency,
    billing_cycle,
    status,
    referred_by,
    referral_code,
    starts_at,
    expires_at,
    created_at
)
SELECT 
    sa1.id,
    'business',
    39.00,
    'EUR',
    'monthly',
    'active',
    sa2.id,
    sa2.affiliate_code,
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW()
FROM public.shop_accounts sa1, public.shop_accounts sa2
WHERE sa1.slug LIKE 'wedding-essentials%' 
  AND sa2.slug LIKE 'dj34%'
LIMIT 1
ON CONFLICT DO NOTHING;
