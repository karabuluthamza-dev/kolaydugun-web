-- Clean up triggers on admin_messages
-- We are removing the backend automation to rely on explicit manual handling
-- This solves "Double Notification" and gives us full control over content/branding

DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;
DROP FUNCTION IF EXISTS public.handle_admin_message_notification_unified();
DROP FUNCTION IF EXISTS public.handle_admin_message_notification_smart();

-- Ensure clean slate
