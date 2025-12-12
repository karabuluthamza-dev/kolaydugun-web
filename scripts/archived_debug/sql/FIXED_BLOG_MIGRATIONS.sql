-- FIXED: All Blog Migrations - Run this ONCE
-- Copy entire file and run in Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description JSONB,
    color TEXT DEFAULT '#3b82f6',
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Junction tables
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. ADD COLUMNS TO POSTS
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS unique_views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_alt_text JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- ============================================
-- 3. ENABLE RLS
-- ============================================
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Categories (public read, auth write)
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
CREATE POLICY "Public can view categories" ON blog_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth can manage categories" ON blog_categories;
CREATE POLICY "Auth can manage categories" ON blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- Tags (public read, auth write)
DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
CREATE POLICY "Public can view tags" ON blog_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth can manage tags" ON blog_tags;
CREATE POLICY "Auth can manage tags" ON blog_tags FOR ALL USING (auth.role() = 'authenticated');

-- Post Categories (public read, auth write)
DROP POLICY IF EXISTS "Public can view post categories" ON post_categories;
CREATE POLICY "Public can view post categories" ON post_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth can manage post categories" ON post_categories;
CREATE POLICY "Auth can manage post categories" ON post_categories FOR ALL USING (auth.role() = 'authenticated');

-- Post Tags (public read, auth write)
DROP POLICY IF EXISTS "Public can view post tags" ON post_tags;
CREATE POLICY "Public can view post tags" ON post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth can manage post tags" ON post_tags;
CREATE POLICY "Auth can manage post tags" ON post_tags FOR ALL USING (auth.role() = 'authenticated');

-- Comments (approved public, all auth)
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
CREATE POLICY "Public can view approved comments" ON blog_comments FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;
CREATE POLICY "Anyone can create comments" ON blog_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Auth can manage comments" ON blog_comments;
CREATE POLICY "Auth can manage comments" ON blog_comments FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 5. INSERT SAMPLE DATA
-- ============================================
INSERT INTO blog_categories (name, slug, description, color, sort_order) VALUES
(
    '{"tr": "Düğün Planlaması", "en": "Wedding Planning", "de": "Hochzeitsplanung"}',
    'wedding-planning',
    '{"tr": "Düğün organizasyonu ve planlama ipuçları"}',
    '#3b82f6',
    1
),
(
    '{"tr": "Düğün Bütçesi", "en": "Budget & Finance", "de": "Budget & Finanzen"}',
    'budget-finance',
    '{"tr": "Bütçe yönetimi ve tasarruf önerileri"}',
    '#10b981',
    2
),
(
    '{"tr": "Mekan Seçimi", "en": "Venues", "de": "Veranstaltungsorte"}',
    'venues',
    '{"tr": "Düğün mekanı seçimi ve önerileri"}',
    '#f59e0b',
    3
),
(
    '{"tr": "Gelin Hazırlığı", "en": "Fashion & Beauty", "de": "Mode & Schönheit"}',
    'fashion-beauty',
    '{"tr": "Gelinlik, takım elbise ve güzellik"}',
    '#ec4899',
    4
),
(
    '{"tr": "Dekorasyon Fikirleri", "en": "Decoration", "de": "Dekoration"}',
    'decoration',
    '{"tr": "Düğün dekorasyonu ve tema fikirleri"}',
    '#8b5cf6',
    5
),
(
    '{"tr": "Gerçek Düğünler", "en": "Real Weddings", "de": "Echte Hochzeiten"}',
    'real-weddings',
    '{"tr": "Gerçek düğün hikayeleri"}',
    '#ef4444',
    6
),
(
    '{"tr": "Trend ve İlham", "en": "Trends & Ideas", "de": "Trends & Ideen"}',
    'trends-ideas',
    '{"tr": "Düğün trendleri ve ilham verici fikirler"}',
    '#06b6d4',
    7
)
ON CONFLICT (slug) DO NOTHING;

-- Sample tags
INSERT INTO blog_tags (name, slug) VALUES
('{"tr": "Bütçe Dostu", "en": "Budget Friendly", "de": "Budgetfreundlich"}', 'budget-friendly'),
('{"tr": "DIY", "en": "DIY", "de": "DIY"}', 'diy'),
('{"tr": "Lüks Düğün", "en": "Luxury Wedding", "de": "Luxushochzeit"}', 'luxury'),
('{"tr": "Açık Hava", "en": "Outdoor", "de": "Im Freien"}', 'outdoor'),
('{"tr": "Kış Düğünü", "en": "Winter Wedding", "de": "Winterhochzeit"}', 'winter'),
('{"tr": "Yaz Düğünü", "en": "Summer Wedding", "de": "Sommerhochzeit"}', 'summer')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DONE! Tables and policies created
-- ============================================
