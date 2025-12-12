-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can insert recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can update recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Admins can delete recurring expenses" ON recurring_expenses;

-- Create new policies with proper admin check
CREATE POLICY "Enable all for authenticated admins" ON recurring_expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
