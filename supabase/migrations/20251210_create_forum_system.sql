-- ==============================================================================
-- FORUM SYSTEM MIGRATION (PHASE 1)
-- ==============================================================================

-- 1. Forum Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS public.forum_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled BOOLEAN DEFAULT false, -- Master Switch
    maintenance_mode BOOLEAN DEFAULT true, -- Admin see full, users see "Coming Soon"
    default_language TEXT DEFAULT 'tr',
    navbar_location INTEGER DEFAULT 3,
    sidebar_widget_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one row exists
CREATE UNIQUE INDEX IF NOT EXISTS forum_settings_one_row_key ON public.forum_settings((TRUE));

-- 2. Forum Categories (Multi-language)
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_tr TEXT NOT NULL,
    name_en TEXT,
    name_de TEXT,
    description_tr TEXT,
    description_en TEXT,
    description_de TEXT,
    icon TEXT, -- Lucide icon name
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Forum Posts (Content)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'tr', -- 'tr', 'en', 'de'
    view_count INTEGER DEFAULT 0,
    
    -- Status Flags
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_simulated BOOLEAN DEFAULT false, -- True if created by AI Ghost
    status TEXT DEFAULT 'published', -- 'published', 'hidden', 'banned'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Forum Comments
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE, -- For nested replies
    content TEXT NOT NULL,
    
    -- Status Flags
    is_simulated BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Forum Reports (Safety)
CREATE TABLE IF NOT EXISTS public.forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Moderation Logs (Audit)
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'delete_post', 'ban_user', 'hide_comment'
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Update Profiles (Add Roles and Flags)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS forum_role TEXT DEFAULT 'user'; -- 'user', 'moderator', 'admin'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_personality JSONB; -- { "style": "angry", "age": 30 }

-- 8. Enable RLS
ALTER TABLE public.forum_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies

-- Settings: Only Admin can write, Everyone can read
CREATE POLICY "Public Read Settings" ON public.forum_settings FOR SELECT USING (true);
CREATE POLICY "Admin Update Settings" ON public.forum_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Insert Settings" ON public.forum_settings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: Public Read, Admin Write
CREATE POLICY "Public Read Categories" ON public.forum_categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin Manage Categories" ON public.forum_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Posts: Public Read (if published), Authenticated Insert, Owner/Admin Update
CREATE POLICY "Public Read Posts" ON public.forum_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Auth Insert Posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner Edit Posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR forum_role = 'moderator')));
CREATE POLICY "Owner Delete Posts" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR forum_role = 'moderator')));

-- Comments: Similar to Posts
CREATE POLICY "Public Read Comments" ON public.forum_comments FOR SELECT USING (status = 'published');
CREATE POLICY "Auth Insert Comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner Edit Comments" ON public.forum_comments FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR forum_role = 'moderator')));
CREATE POLICY "Owner Delete Comments" ON public.forum_comments FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR forum_role = 'moderator')));

-- Initial Data Seeding
INSERT INTO public.forum_settings (is_enabled, maintenance_mode)
VALUES (false, true)
ON CONFLICT DO NOTHING;

-- Seed Categories
INSERT INTO public.forum_categories (slug, name_tr, name_en, name_de, icon, order_index) VALUES
('gelinlik', 'Gelinlik Modelleri', 'Wedding Dresses', 'Brautkleider', 'Shirt', 1),
('mekan-onerileri', 'Mekan Önerileri', 'Venue Recommendations', 'Veranstaltungsorte', 'MapPin', 2),
('butce-planlama', 'Bütçe & Para', 'Budget & Money', 'Budget & Geld', 'Wallet', 3),
('gelenekler', 'Gelenekler & Adetler', 'Traditions', 'Traditionen', 'BookOpen', 4),
('dertlesme', 'Dertleşme Köşesi', 'Confessions', 'Geständnisse', 'HeartHandshake', 5)
ON CONFLICT (slug) DO NOTHING;
