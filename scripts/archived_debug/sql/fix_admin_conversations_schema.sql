-- 1. Add user_type column to admin_conversations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'admin_conversations'
        AND column_name = 'user_type'
    ) THEN
        ALTER TABLE public.admin_conversations
        ADD COLUMN user_type text DEFAULT 'vendor';
    END IF;
END $$;

-- 2. Verify admin_messages has receiver_id (it should, but safety first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'admin_messages'
        AND column_name = 'receiver_id'
    ) THEN
        ALTER TABLE public.admin_messages
        ADD COLUMN receiver_id uuid REFERENCES auth.users(id);
    END IF;
END $$;
