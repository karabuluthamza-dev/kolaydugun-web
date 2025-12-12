-- Create recurring_income table
CREATE TABLE IF NOT EXISTS recurring_income (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    source_name VARCHAR(255),
    payment_method VARCHAR(50),
    day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    last_generated_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_income ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view recurring income" ON recurring_income;
DROP POLICY IF EXISTS "Admins can insert recurring income" ON recurring_income;
DROP POLICY IF EXISTS "Admins can update recurring income" ON recurring_income;
DROP POLICY IF EXISTS "Admins can delete recurring income" ON recurring_income;
DROP POLICY IF EXISTS "Enable all for authenticated admins" ON recurring_income;

-- Create RLS policy (Admin only - all operations)
CREATE POLICY "Enable all for authenticated admins" ON recurring_income
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Create automation function
CREATE OR REPLACE FUNCTION process_recurring_income()
RETURNS void AS $$
DECLARE
    r_income RECORD;
    target_date DATE;
BEGIN
    -- Bugünün tarihi
    target_date := CURRENT_DATE;

    FOR r_income IN 
        SELECT * FROM recurring_income 
        WHERE active = true 
        AND (last_generated_date IS NULL OR last_generated_date < date_trunc('month', target_date))
    LOOP
        -- Eğer bugün, belirlenen gün veya sonrasıysa (ve bu ay henüz oluşturulmadıysa)
        IF EXTRACT(DAY FROM target_date) >= r_income.day_of_month THEN
            -- Gelir kaydını oluştur
            INSERT INTO income_records (
                date, 
                category, 
                amount, 
                description, 
                payment_method,
                invoice_number
            ) VALUES (
                target_date,
                r_income.category,
                r_income.amount,
                r_income.description || ' (Otomatik)',
                r_income.payment_method,
                'AUTO-' || TO_CHAR(target_date, 'YYYYMM') || '-' || r_income.id::text
            );

            -- Son oluşturulma tarihini güncelle
            UPDATE recurring_income 
            SET last_generated_date = target_date 
            WHERE id = r_income.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
