-- Fix for "Foreign Key Violation" when deleting leads
-- This script ensures that when a Lead is deleted, its related notifications are also deleted automatically.

-- 1. Drop the existing strict constraint
ALTER TABLE public.user_notifications 
DROP CONSTRAINT IF EXISTS user_notifications_related_lead_id_fkey;

-- 2. Add the new constraint with "ON DELETE CASCADE"
-- This tells the database: "If a Lead is deleted, delete these notifications too"
ALTER TABLE public.user_notifications 
ADD CONSTRAINT user_notifications_related_lead_id_fkey 
FOREIGN KEY (related_lead_id) 
REFERENCES public.leads(id) 
ON DELETE CASCADE;
