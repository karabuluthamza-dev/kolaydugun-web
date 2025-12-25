-- Add paypal_link and is_vip support to Live DJ system
-- Created: 2024-12-25

-- 1. Add paypal_link to live_events (can be event-specific)
-- Alternatively, we can add it to the vendor profile, but putting it here allows different paypal links for different events.
ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS paypal_link text;

-- 2. Add is_vip and total_paid to live_requests
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS total_paid numeric(10,2) DEFAULT 0.00;

-- 3. Update status check to include 'vip' status if needed (though 'pending' with is_vip=true is also fine)
-- Let's stick with is_vip=true flag for now as it doesn't break existing status logic.

-- 4. Add comment to explain legal stance
COMMENT ON COLUMN public.live_events.paypal_link IS 'Direct P2P payment link (e.g. PayPal.me) to minimize platform liability in Germany (PStTG).';
