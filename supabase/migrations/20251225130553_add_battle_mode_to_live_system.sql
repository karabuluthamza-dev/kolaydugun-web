-- Battle Mode for Live DJ system
-- Created: 2024-12-25

-- 1. Create live_battles table
CREATE TABLE IF NOT EXISTS public.live_battles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.live_events(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'Next Up Battle!',
    option_a_name text NOT NULL,
    option_b_name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);

-- 2. Create live_battle_votes table
CREATE TABLE IF NOT EXISTS public.live_battle_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_id uuid REFERENCES public.live_battles(id) ON DELETE CASCADE,
    device_id text NOT NULL,
    option_vote text CHECK (option_vote IN ('A', 'B')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(battle_id, device_id)
);

-- 3. RLS Policies
ALTER TABLE public.live_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DJs can manage battles" ON public.live_battles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.live_events 
        WHERE live_events.id = live_battles.event_id 
        AND live_events.vendor_id = auth.uid()
    ));

CREATE POLICY "Public can view active battles" ON public.live_battles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Guests can vote once" ON public.live_battle_votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view votes" ON public.live_battle_votes
    FOR SELECT USING (true);

-- 4. Realtime setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_battle_votes;
