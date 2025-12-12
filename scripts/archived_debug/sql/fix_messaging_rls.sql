-- FIX RLS FOR MESSAGING SYSTEM
-- This script ensures Vendors and Couples can exchange messages and notifications.

-- 1. CONVERSATIONS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid()) -- If user owns the vendor
);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations" ON conversations
FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
);

-- 2. MESSAGES Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = conversation_id
        AND (
            c.user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM vendors v WHERE v.id = c.vendor_id AND v.user_id = auth.uid())
        )
    )
);

DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
CREATE POLICY "Participants can insert messages" ON messages
FOR INSERT WITH CHECK (
    -- Allow insert if sender is the authenticated user
    auth.uid() = sender_id 
    AND
    -- AND the user is part of the conversation
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = conversation_id
        AND (
            c.user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM vendors v WHERE v.id = c.vendor_id AND v.user_id = auth.uid())
        )
    )
);

-- 3. NOTIFICATIONS Policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications" ON user_notifications
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert notifications" ON user_notifications;
CREATE POLICY "Anyone can insert notifications" ON user_notifications
FOR INSERT WITH CHECK (true); -- Allow vendors/system to create notifications for others

DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
CREATE POLICY "Users can update own notifications" ON user_notifications
FOR UPDATE USING (auth.uid() = user_id);
