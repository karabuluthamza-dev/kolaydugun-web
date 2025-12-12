-- Drop the existing check constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- Add the updated check constraint including 'scheduled'
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'scheduled'));
