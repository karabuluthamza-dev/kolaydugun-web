-- Delete all test transactions

-- 1. Check current total before deletion
SELECT 
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM transactions;

-- 2. Delete all transactions
DELETE FROM transactions;

-- 3. Verify deletion
SELECT 
    COUNT(*) as remaining_transactions,
    COALESCE(SUM(amount), 0) as remaining_amount
FROM transactions;
