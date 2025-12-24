-- Create the enum type for invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'invited', 'registered');

-- Add columns to vendor_imports table
ALTER TABLE vendor_imports 
ADD COLUMN invitation_status invitation_status DEFAULT 'pending',
ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE;

-- Create an index for faster filtering by invitation status
CREATE INDEX idx_vendor_imports_invitation_status ON vendor_imports(invitation_status);
