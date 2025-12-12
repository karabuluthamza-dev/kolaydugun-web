-- ============================================
-- Additional Notification Triggers
-- Run this after create_notifications_table.sql
-- ============================================

-- ============================================
-- 1. NEW VENDOR REGISTRATION (Medium Priority)
-- ============================================

DROP TRIGGER IF EXISTS trigger_notify_new_vendor ON vendors;
DROP FUNCTION IF EXISTS notify_new_vendor();

CREATE OR REPLACE FUNCTION notify_new_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
BEGIN
    -- Get user email if available
    SELECT email INTO v_user_email
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM create_notification(
        'registration',
        'medium',
        'Yeni Vendor Kaydı! 👥',
        COALESCE(NEW.business_name, 'Yeni vendor') || ' platformumuza katıldı!' || 
        CASE WHEN v_user_email IS NOT NULL THEN ' (' || v_user_email || ')' ELSE '' END,
        NEW.id,
        'vendor'
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_vendor
    AFTER INSERT ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_vendor();

-- ============================================
-- 2. HIGH-VALUE LEAD (High Priority)
-- ============================================

DROP TRIGGER IF EXISTS trigger_notify_high_value_lead ON leads;
DROP FUNCTION IF EXISTS notify_high_value_lead();

CREATE OR REPLACE FUNCTION notify_high_value_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_name TEXT;
    v_estimated_value NUMERIC;
BEGIN
    -- Estimate lead value based on category and event details
    -- This is a simple estimation, you can make it more sophisticated
    v_estimated_value := 500; -- Default high value threshold
    
    -- Only trigger for new leads that might be high value
    IF NEW.status = 'new' THEN
        -- Get vendor name
        SELECT business_name INTO v_vendor_name
        FROM vendors
        WHERE id = NEW.vendor_id;
        
        -- Create notification for all new leads (you can add value logic later)
        -- For now, we'll notify for leads with detailed messages
        IF LENGTH(COALESCE(NEW.message, '')) > 100 THEN
            PERFORM create_notification(
                'lead',
                'high',
                'Detaylı Lead Talebi! 📋',
                COALESCE(v_vendor_name, 'Vendor') || ' için detaylı bir teklif talebi geldi. ' ||
                'İletişim: ' || COALESCE(NEW.email, NEW.phone, 'Belirtilmemiş'),
                NEW.id,
                'lead'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_high_value_lead
    AFTER INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION notify_high_value_lead();

-- ============================================
-- 3. FIVE-STAR REVIEW (Low Priority)
-- ============================================

DROP TRIGGER IF EXISTS trigger_notify_five_star_review ON reviews;
DROP FUNCTION IF EXISTS notify_five_star_review();

CREATE OR REPLACE FUNCTION notify_five_star_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_name TEXT;
    v_user_name TEXT;
BEGIN
    -- Only trigger for 5-star ratings
    IF NEW.rating = 5 THEN
        -- Get vendor name
        SELECT business_name INTO v_vendor_name
        FROM vendors
        WHERE id = NEW.vendor_id;
        
        -- Get user name
        SELECT COALESCE(full_name, email) INTO v_user_name
        FROM profiles
        WHERE id = NEW.user_id;
        
        -- Create notification
        PERFORM create_notification(
            'review',
            'low',
            'Mükemmel Yorum! ⭐⭐⭐⭐⭐',
            COALESCE(v_vendor_name, 'Vendor') || ' için ' || 
            COALESCE(v_user_name, 'Kullanıcı') || ' tarafından 5 yıldızlı yorum yazıldı!',
            NEW.id,
            'review'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_five_star_review
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_five_star_review();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ New vendor registration trigger created!';
    RAISE NOTICE '✅ High-value lead trigger created!';
    RAISE NOTICE '✅ Five-star review trigger created!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Total active notification triggers:';
    RAISE NOTICE '   🔴 High Priority: Low ratings (≤2★), High-value leads';
    RAISE NOTICE '   🟡 Medium Priority: New vendor registrations';
    RAISE NOTICE '   🟢 Low Priority: Five-star reviews (5★)';
END $$;
