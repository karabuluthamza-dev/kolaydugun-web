-- Drop the trigger that automatically creates notifications for admin_messages
-- This prevents double notifications since the frontend now handles it manually for legacy chats
DROP TRIGGER IF EXISTS on_message_received ON public.admin_messages;

-- Also drop the function if it is not used elsewhere (optional, but cleaner if we are sure)
-- Keeping the function might be safe if other triggers use it, but for now just dropping the trigger is enough.
