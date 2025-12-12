-- ============================================
-- STEP 1: Clean Test Data
-- ============================================

-- Delete test transactions
DELETE FROM transactions 
WHERE description ILIKE '%test%' 
   OR description ILIKE '%demo%'
   OR amount = 0;

-- Delete test notifications
DELETE FROM notifications 
WHERE title ILIKE '%test%'
   OR related_type = 'test';

-- Show results
SELECT 'Remaining transactions:' as info, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'Remaining notifications:' as info, COUNT(*) as count FROM notifications;

-- ============================================
-- STEP 2: Create Finance Tables
-- ============================================

-- Income Records Table
CREATE TABLE IF NOT EXISTS income_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- 'subscription', 'credits', 'ads', 'other'
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    payment_method VARCHAR(50), -- 'paypal', 'stripe', 'bank_transfer', 'cash'
    invoice_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Records Table
CREATE TABLE IF NOT EXISTS expense_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL, -- 'hosting', 'marketing', 'salary', 'software', 'tax', 'other'
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    vendor_name VARCHAR(255), -- Kime ödeme yapıldı
    payment_method VARCHAR(50),
    receipt_url TEXT, -- Fatura/Makbuz linki
    is_tax_deductible BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'paid', -- 'pending', 'paid', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_income_date ON income_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_income_category ON income_records(category);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expense_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expense_records(category);

-- ============================================
-- STEP 3: RLS Policies (Admin Only)
-- ============================================

-- Enable RLS
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view income" ON income_records;
DROP POLICY IF EXISTS "Admins can insert income" ON income_records;
DROP POLICY IF EXISTS "Admins can update income" ON income_records;
DROP POLICY IF EXISTS "Admins can delete income" ON income_records;

DROP POLICY IF EXISTS "Admins can view expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can insert expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can update expenses" ON expense_records;
DROP POLICY IF EXISTS "Admins can delete expenses" ON expense_records;

-- Income policies
CREATE POLICY "Admins can view income"
    ON income_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert income"
    ON income_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update income"
    ON income_records FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete income"
    ON income_records FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Expense policies
CREATE POLICY "Admins can view expenses"
    ON expense_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert expenses"
    ON expense_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update expenses"
    ON expense_records FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete expenses"
    ON expense_records FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- STEP 4: Helper Functions
-- ============================================

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_finance_summary(
    target_month DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_income DECIMAL(10,2),
    total_expenses DECIMAL(10,2),
    net_profit DECIMAL(10,2),
    income_count INTEGER,
    expense_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    month_start DATE;
    month_end DATE;
BEGIN
    month_start := DATE_TRUNC('month', target_month);
    month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    RETURN QUERY
    SELECT
        COALESCE(SUM(i.amount), 0) as total_income,
        COALESCE(SUM(e.amount), 0) as total_expenses,
        COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0) as net_profit,
        COUNT(DISTINCT i.id)::INTEGER as income_count,
        COUNT(DISTINCT e.id)::INTEGER as expense_count
    FROM
        (SELECT amount, id FROM income_records WHERE date BETWEEN month_start AND month_end) i
    FULL OUTER JOIN
        (SELECT amount, id FROM expense_records WHERE date BETWEEN month_start AND month_end) e
    ON FALSE;
END;
$$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Test data cleaned!';
    RAISE NOTICE '✅ Finance tables created!';
    RAISE NOTICE '✅ RLS policies configured!';
    RAISE NOTICE '✅ Helper functions ready!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Next steps:';
    RAISE NOTICE '   1. Create AdminFinance page';
    RAISE NOTICE '   2. Add income/expense forms';
    RAISE NOTICE '   3. Build reporting dashboard';
END $$;
