-- Check transactions table structure and data

-- 1. Get table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions'
ORDER BY ordinal_position;

-- 2. Count and sum transactions
SELECT 
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM transactions;

-- 3. View all transactions (without vendor_id)
SELECT *
FROM transactions
ORDER BY created_at DESC
LIMIT 20;
