-- Add paypal_email column to shop_accounts for PayPal payouts
ALTER TABLE shop_accounts ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Update the test shop with a PayPal email (sandbox test email)
UPDATE shop_accounts 
SET paypal_email = 'sb-test@business.example.com'
WHERE id = 'ce430822-256f-4212-98fd-35d91bd17bf1';
