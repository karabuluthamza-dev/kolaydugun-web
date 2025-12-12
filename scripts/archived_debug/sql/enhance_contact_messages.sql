
-- ============================================
-- Enhance Contact Messages Table
-- ============================================

-- 1. Add read_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_messages' AND column_name = 'read_at') THEN
        ALTER TABLE contact_messages ADD COLUMN read_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- 2. Fix RLS for Admin Access
-- Ensure admin can DELETE and UPDATE (for marking as read)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage contact messages" ON contact_messages;

CREATE POLICY "Admin can manage contact messages"
ON contact_messages
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Allow inserts from anyone (anon) - This should already exist but reinforcing
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages"
ON contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Contact messages table enhanced (read_at column + Admin RLS)!';
END $$;
