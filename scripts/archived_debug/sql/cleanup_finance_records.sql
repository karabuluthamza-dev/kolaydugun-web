-- ============================================
-- Finance Records Cleanup Script
-- ============================================

-- Option 1: Delete specific record by ID
-- DELETE FROM income_records WHERE id = 'YOUR-ID-HERE';
-- DELETE FROM expense_records WHERE id = 'YOUR-ID-HERE';

-- Option 2: Delete by date range
-- DELETE FROM income_records WHERE date BETWEEN '2024-12-01' AND '2024-12-31';
-- DELETE FROM expense_records WHERE date BETWEEN '2024-12-01' AND '2024-12-31';

-- Option 3: Delete by category
-- DELETE FROM income_records WHERE category = 'subscription';
-- DELETE FROM expense_records WHERE category = 'hosting';

-- Option 4: Delete test records
DELETE FROM income_records WHERE description ILIKE '%test%';
DELETE FROM expense_records WHERE description ILIKE '%test%';

-- Option 5: DELETE ALL (CAREFUL!)
-- Uncomment only if you want to delete EVERYTHING
-- DELETE FROM income_records;
-- DELETE FROM expense_records;

-- Show remaining records
SELECT 'Income records:' as info, COUNT(*) as count FROM income_records
UNION ALL
SELECT 'Expense records:' as info, COUNT(*) as count FROM expense_records;

-- Show recent records
SELECT 'Recent income:' as type, date, category, amount, description 
FROM income_records 
ORDER BY date DESC 
LIMIT 5;

SELECT 'Recent expenses:' as type, date, category, amount, description 
FROM expense_records 
ORDER BY date DESC 
LIMIT 5;
