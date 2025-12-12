-- ============================================
-- OPTIONAL: Credit Request Notification Trigger
-- Run this ONLY if credit_requests table exists
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_notify_credit_request ON credit_requests;
DROP FUNCTION IF EXISTS notify_credit_request();

-- Trigger for new credit requests
CREATE OR REPLACE FUNCTION notify_credit_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_name TEXT;
BEGIN
    -- Only trigger for pending requests
    IF NEW.status = 'pending' THEN
        -- Get vendor name
        SELECT business_name INTO v_vendor_name
        FROM vendors
        WHERE id = NEW.vendor_id;
        
        -- Create notification
        PERFORM create_notification(
            'credit_request',
            'high',
            'Yeni Kredi Talebi!',
            COALESCE(v_vendor_name, 'Vendor') || ' tarafından ' || NEW.amount || ' kredi talebi yapıldı.',
            NEW.id,
            'credit_request'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_credit_request
    AFTER INSERT ON credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_credit_request();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Credit request trigger created successfully!';
END $$;
