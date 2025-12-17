-- Add PayPal email field to shop_accounts for payout purposes
ALTER TABLE public.shop_accounts 
ADD COLUMN IF NOT EXISTS paypal_email VARCHAR(255);

-- Add payout tracking fields to shop_affiliate_earnings
ALTER TABLE public.shop_affiliate_earnings 
ADD COLUMN IF NOT EXISTS payout_batch_id VARCHAR(100);

ALTER TABLE public.shop_affiliate_earnings 
ADD COLUMN IF NOT EXISTS payout_response JSONB;

-- Comment
COMMENT ON COLUMN public.shop_accounts.paypal_email IS 'PayPal email for receiving commission payouts';
COMMENT ON COLUMN public.shop_affiliate_earnings.payout_batch_id IS 'PayPal Payout batch ID for tracking';
