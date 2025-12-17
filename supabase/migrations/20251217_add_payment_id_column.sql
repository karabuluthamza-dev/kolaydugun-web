-- Add payment_id column to transactions table for PayPal order tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_id TEXT;
