-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;

-- Create comprehensive policy
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (
    auth.uid() = user_id -- As the Couple
    OR 
    exists ( -- As the Vendor
        select 1 from vendors 
        where vendors.id = conversations.vendor_id 
        and vendors.user_id = auth.uid()
    )
);

-- Ensure vendors can also insert/update if needed (usually messages logic handles this, but good to have)
DROP POLICY IF EXISTS "Vendors can view their conversations" ON conversations; 
-- (Merged into above)
