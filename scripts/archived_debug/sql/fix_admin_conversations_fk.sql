-- Fix broken foreign keys in admin_conversations table
-- The table is trying to reference 'users' table which doesn't exist anymore

-- Step 1: Check current foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'admin_conversations'
AND tc.constraint_type = 'FOREIGN KEY';

-- Step 2: Drop existing broken foreign keys (if any)
-- ALTER TABLE admin_conversations DROP CONSTRAINT IF EXISTS admin_conversations_admin_id_fkey;
-- ALTER TABLE admin_conversations DROP CONSTRAINT IF EXISTS admin_conversations_user_id_fkey;

-- Step 3: Add correct foreign keys pointing to auth.users
ALTER TABLE admin_conversations
ADD CONSTRAINT admin_conversations_admin_id_fkey
FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE admin_conversations
ADD CONSTRAINT admin_conversations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Verify the fix
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'admin_conversations'
AND tc.constraint_type = 'FOREIGN KEY';
