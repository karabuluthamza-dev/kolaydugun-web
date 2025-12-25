-- Add mood column to live_requests
ALTER TABLE public.live_requests ADD COLUMN IF NOT EXISTS mood text;
