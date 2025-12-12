-- 1. Vendors: Public Read
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for vendors" ON vendors;
CREATE POLICY "Public read access for vendors" ON vendors FOR SELECT USING (true);

-- 2. Conversations: Readable by Owner + User
-- (Already fixed, but let's reinforce)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access to conversations" ON conversations;
CREATE POLICY "Access to conversations" ON conversations FOR SELECT
USING (
    user_id = auth.uid() 
    OR 
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- 3. Leads: Readable by Vendor Owner + User
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access to leads" ON leads;
CREATE POLICY "Access to leads" ON leads FOR SELECT
USING (
    user_id = auth.uid()
    OR 
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- 4. Messages: Readable by Conversation Participants
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Access to messages" ON messages;
CREATE POLICY "Access to messages" ON messages FOR SELECT
USING (
    exists (
        select 1 from conversations c
        where c.id = messages.conversation_id
        and (
            c.user_id = auth.uid()
            OR
            c.vendor_id IN (select id from vendors where user_id = auth.uid())
        )
    )
);
