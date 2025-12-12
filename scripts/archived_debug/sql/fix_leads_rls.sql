-- Enable RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow vendors to view leads assigned to them
DROP POLICY IF EXISTS "Vendors can view their own leads" ON leads;

CREATE POLICY "Vendors can view their own leads"
ON leads FOR SELECT
USING (
    vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
    )
);

-- Allow users to view their own leads (Couples)
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;

CREATE POLICY "Users can view their own leads"
ON leads FOR SELECT
USING (
    user_id = auth.uid()
);

-- Allow vendors to update leads assigned to them (e.g. status)
DROP POLICY IF EXISTS "Vendors can update their own leads" ON leads;

CREATE POLICY "Vendors can update their own leads"
ON leads FOR UPDATE
USING (
    vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
    )
);
