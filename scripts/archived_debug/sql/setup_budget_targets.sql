-- Create budget_targets table
CREATE TABLE IF NOT EXISTS budget_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('income', 'expense')),
    monthly_limit DECIMAL(10,2) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(category, target_type, year, month)
);

-- Enable RLS
ALTER TABLE budget_targets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view budget targets" ON budget_targets;
DROP POLICY IF EXISTS "Admins can insert budget targets" ON budget_targets;
DROP POLICY IF EXISTS "Admins can update budget targets" ON budget_targets;
DROP POLICY IF EXISTS "Admins can delete budget targets" ON budget_targets;
DROP POLICY IF EXISTS "Enable all for authenticated admins" ON budget_targets;

-- Create RLS policy (Admin only - all operations)
CREATE POLICY "Enable all for authenticated admins" ON budget_targets
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Create view for budget vs actual comparison
CREATE OR REPLACE VIEW budget_vs_actual AS
SELECT 
    bt.id,
    bt.category,
    bt.target_type,
    bt.monthly_limit,
    bt.year,
    bt.month,
    bt.notes,
    COALESCE(
        CASE 
            WHEN bt.target_type = 'expense' THEN (
                SELECT SUM(amount) 
                FROM expense_records 
                WHERE category = bt.category 
                AND EXTRACT(YEAR FROM date) = bt.year 
                AND EXTRACT(MONTH FROM date) = bt.month
            )
            WHEN bt.target_type = 'income' THEN (
                SELECT SUM(amount) 
                FROM income_records 
                WHERE category = bt.category 
                AND EXTRACT(YEAR FROM date) = bt.year 
                AND EXTRACT(MONTH FROM date) = bt.month
            )
        END, 
        0
    ) as actual_amount,
    COALESCE(
        CASE 
            WHEN bt.target_type = 'expense' THEN (
                SELECT SUM(amount) 
                FROM expense_records 
                WHERE category = bt.category 
                AND EXTRACT(YEAR FROM date) = bt.year 
                AND EXTRACT(MONTH FROM date) = bt.month
            )
            WHEN bt.target_type = 'income' THEN (
                SELECT SUM(amount) 
                FROM income_records 
                WHERE category = bt.category 
                AND EXTRACT(YEAR FROM date) = bt.year 
                AND EXTRACT(MONTH FROM date) = bt.month
            )
        END, 
        0
    ) / bt.monthly_limit * 100 as percentage_used,
    CASE 
        WHEN COALESCE(
            CASE 
                WHEN bt.target_type = 'expense' THEN (
                    SELECT SUM(amount) 
                    FROM expense_records 
                    WHERE category = bt.category 
                    AND EXTRACT(YEAR FROM date) = bt.year 
                    AND EXTRACT(MONTH FROM date) = bt.month
                )
                WHEN bt.target_type = 'income' THEN (
                    SELECT SUM(amount) 
                    FROM income_records 
                    WHERE category = bt.category 
                    AND EXTRACT(YEAR FROM date) = bt.year 
                    AND EXTRACT(MONTH FROM date) = bt.month
                )
            END, 
            0
        ) > bt.monthly_limit THEN true
        ELSE false
    END as is_exceeded
FROM budget_targets bt;
