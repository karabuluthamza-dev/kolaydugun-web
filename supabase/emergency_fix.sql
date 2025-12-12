-- EMERGENCY FIX: OPEN EVERYTHING FOR READ
-- Use this to verify if RLS is the blocker

-- 1. Forum Posts
drop policy if exists "Forum posts are viewable by everyone" on public.forum_posts;
create policy "Forum posts are viewable by everyone"
    on public.forum_posts for select
    using (true); -- REMOVE STATUS CHECK

-- 2. Profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

-- 3. Categories
drop policy if exists "Categories are viewable by everyone" on public.forum_categories;
create policy "Categories are viewable by everyone"
    on public.forum_categories for select
    using (true);

-- 4. Comments
drop policy if exists "Comments are viewable by everyone" on public.forum_comments;
create policy "Comments are viewable by everyone"
    on public.forum_comments for select
    using (true);

-- 5. Force Enable RLS (to ensure policies apply)
alter table public.forum_posts enable row level security;
alter table public.profiles enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_comments enable row level security;
