-- Add location fields to vendor_profiles table
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add index for location queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_vendor_location ON vendor_profiles(latitude, longitude);
