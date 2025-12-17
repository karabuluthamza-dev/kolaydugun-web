-- Demo Komisyon Verisi - Direkt Insert
-- Bu sorguyu Supabase SQL Editor'da çalıştırın

-- Önce mevcut shop_accounts'ları kontrol et
SELECT id, slug, business_name FROM public.shop_accounts LIMIT 5;

-- Eğer veri varsa, aşağıdaki sorguyu çalıştırın
-- (İlk mağazayı referrer, ikincisini referred olarak kullanır)

WITH shops AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.shop_accounts
    LIMIT 2
)
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
)
SELECT 
    (SELECT id FROM shops WHERE rn = 1),
    'platform_referral',
    (SELECT id FROM shops WHERE rn = 2),
    39.00,
    10.00,
    3.90,
    'EUR',
    'pending',
    NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM shops WHERE rn = 1)
  AND EXISTS (SELECT 1 FROM shops WHERE rn = 2);

-- Eklenen veriyi kontrol et
SELECT * FROM public.shop_affiliate_earnings;
