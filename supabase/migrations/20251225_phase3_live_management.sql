-- Add live support flag to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_live_supported BOOLEAN DEFAULT false;

-- Enable it for default categories (DJs, Musicians, Entertainment)
UPDATE categories SET is_live_supported = true WHERE name IN ('DJs', 'Musicians', 'Entertainment');

-- Ensure subscription_plans has the feature in its JSONB if not present
-- (Based on AdminPricing.jsx, it uses features JSONB)
-- We don't need a schema change if it's already JSONB, but let's update the Premium plan
UPDATE subscription_plans 
SET features = features || '{"live_requests": true}'::jsonb 
WHERE name = 'premium';

-- Update Free plan to explicitly have it as false
UPDATE subscription_plans 
SET features = features || '{"live_requests": false}'::jsonb 
WHERE name = 'free';
