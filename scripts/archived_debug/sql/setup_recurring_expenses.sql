-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    vendor_name VARCHAR(255),
    payment_method VARCHAR(50),
    day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    last_generated_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Admin only)
CREATE POLICY "Admins can view recurring expenses" ON recurring_expenses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can insert recurring expenses" ON recurring_expenses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can update recurring expenses" ON recurring_expenses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can delete recurring expenses" ON recurring_expenses
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Create automation function
CREATE OR REPLACE FUNCTION process_recurring_expenses()
RETURNS void AS $$
DECLARE
    r_expense RECORD;
    target_date DATE;
BEGIN
    -- Bugünün tarihi
    target_date := CURRENT_DATE;

    FOR r_expense IN 
        SELECT * FROM recurring_expenses 
        WHERE active = true 
        AND (last_generated_date IS NULL OR last_generated_date < date_trunc('month', target_date))
    LOOP
        -- Eğer bugün, belirlenen gün veya sonrasıysa (ve bu ay henüz oluşturulmadıysa)
        IF EXTRACT(DAY FROM target_date) >= r_expense.day_of_month THEN
            -- Gider kaydını oluştur
            INSERT INTO expense_records (
                date, 
                category, 
                amount, 
                description, 
                vendor_name, 
                payment_method, 
                is_tax_deductible
            ) VALUES (
                target_date,
                r_expense.category,
                r_expense.amount,
                r_expense.description || ' (Otomatik)',
                r_expense.vendor_name,
                r_expense.payment_method,
                true
            );

            -- Son oluşturulma tarihini güncelle
            UPDATE recurring_expenses 
            SET last_generated_date = target_date 
            WHERE id = r_expense.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
