-- Ensure Forum Posts are viewable by everyone
drop policy if exists "Forum posts are viewable by everyone" on public.forum_posts;
create policy "Forum posts are viewable by everyone"
    on public.forum_posts for select
    using (status = 'published');

-- Ensure Profiles are viewable (needed for author info)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
    on public.profiles for select
    using (true);

-- Ensure Categories are viewable
drop policy if exists "Categories are viewable by everyone" on public.forum_categories;
create policy "Categories are viewable by everyone"
    on public.forum_categories for select
    using (is_visible = true);

-- Enable RLS just in case (usually already on)
alter table public.forum_posts enable row level security;
alter table public.profiles enable row level security;
alter table public.forum_categories enable row level security;
