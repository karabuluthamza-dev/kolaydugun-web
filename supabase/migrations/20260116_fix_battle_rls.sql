-- Fix RLS for live_battles and live_battle_votes tables
-- Supabase Security Advisor reports RLS is disabled
-- Created: 2026-01-16

-- Enable RLS on live_battles (idempotent)
ALTER TABLE IF EXISTS public.live_battles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on live_battle_votes (idempotent)
ALTER TABLE IF EXISTS public.live_battle_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
-- live_battles policies
DROP POLICY IF EXISTS "DJs can manage battles" ON public.live_battles;
DROP POLICY IF EXISTS "Public can view active battles" ON public.live_battles;

CREATE POLICY "DJs can manage battles" ON public.live_battles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.live_events 
        WHERE live_events.id = live_battles.event_id 
        AND live_events.vendor_id = auth.uid()
    ));

CREATE POLICY "Public can view active battles" ON public.live_battles
    FOR SELECT USING (is_active = true);

-- live_battle_votes policies
DROP POLICY IF EXISTS "Guests can vote once" ON public.live_battle_votes;
DROP POLICY IF EXISTS "Public can view votes" ON public.live_battle_votes;

CREATE POLICY "Guests can vote once" ON public.live_battle_votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view votes" ON public.live_battle_votes
    FOR SELECT USING (true);
