-- ============================================
-- PART 1: Core Notifications System
-- ============================================

-- Notifications table for admin alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'review', 'credit_request', 'transaction', 'lead', etc.
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- ID of the related entity (review_id, credit_request_id, etc.)
    related_type VARCHAR(50), -- 'review', 'credit_request', 'transaction', etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- RLS Policies (Admin only)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;

-- Admin can see all notifications
CREATE POLICY "Admins can view all notifications"
    ON notifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin can insert notifications
CREATE POLICY "Admins can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admin can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
    ON notifications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type VARCHAR,
    p_priority VARCHAR,
    p_title TEXT,
    p_message TEXT,
    p_related_id UUID DEFAULT NULL,
    p_related_type VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (type, priority, title, message, related_id, related_type)
    VALUES (p_type, p_priority, p_title, p_message, p_related_id, p_related_type)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- ============================================
-- PART 2: Review Notification Trigger
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_notify_low_rating ON reviews;
DROP FUNCTION IF EXISTS notify_low_rating();

-- Trigger for low-rated reviews
CREATE OR REPLACE FUNCTION notify_low_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vendor_name TEXT;
    v_user_name TEXT;
BEGIN
    -- Only trigger for ratings <= 2
    IF NEW.rating <= 2 THEN
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
            'high',
            'Düşük Puanlı Yorum!',
            COALESCE(v_vendor_name, 'Vendor') || ' için ' || COALESCE(v_user_name, 'Kullanıcı') || ' tarafından ' || NEW.rating || ' yıldızlı yorum yazıldı.',
            NEW.id,
            'review'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_low_rating
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_low_rating();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Notifications system created successfully!';
    RAISE NOTICE '✅ Low rating trigger activated';
    RAISE NOTICE 'ℹ️  Credit request trigger skipped (table may not exist yet)';
END $$;
