-- Add default_commission_rate column to site_settings
-- Migration: 20251216_add_commission_rate_column.sql

-- Add column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' 
        AND column_name = 'default_commission_rate'
    ) THEN
        ALTER TABLE site_settings 
        ADD COLUMN default_commission_rate DECIMAL(5,2) DEFAULT 10.00;
        
        -- Set default value for existing row
        UPDATE site_settings SET default_commission_rate = 10.00 WHERE id = 1;
        
        RAISE NOTICE 'Added default_commission_rate column with default value 10.00';
    ELSE
        RAISE NOTICE 'Column default_commission_rate already exists';
    END IF;
END $$;
