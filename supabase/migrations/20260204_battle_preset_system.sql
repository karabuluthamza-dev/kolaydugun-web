-- Battle Preset System Migration
-- Purpose: Allow DJs to prepare battles beforehand with active/inactive toggle
-- Date: 2026-02-04

-- Change default value for is_active to false (presets start inactive)
ALTER TABLE public.live_battles ALTER COLUMN is_active SET DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.live_battles.is_active IS 'Battle activation status. Only one battle per event should be active at a time.';
