-- Migration to fix Realtime with RLS for live_requests
-- Created: 2026-02-04
-- Issue: Realtime subscription connects (SUBSCRIBED) but INSERT events not received

-- Enable REPLICA IDENTITY FULL for live_requests table
-- This is REQUIRED for Supabase Realtime to work properly with RLS
ALTER TABLE public.live_requests REPLICA IDENTITY FULL;

-- Also apply to live_events and live_battles for consistency
ALTER TABLE public.live_events REPLICA IDENTITY FULL;
ALTER TABLE public.live_battles REPLICA IDENTITY FULL;
