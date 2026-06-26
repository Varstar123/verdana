-- Verdana V2 — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to re-run.
--
-- Covers the foundation + signature features: profiles, contributions, badges,
-- levels (derived), follows, leaderboard (view), plus the social tables
-- (posts, comments, forums) so the next pass needs no second migration.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Planet ID generator: VER-XXXXXX (6 base-34 chars, no I/O ambiguity)
-- ---------------------------------------------------------------------------
create or replace function public.gen_planet_id()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := 'VER-';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  planet_id     text unique not null default public.gen_planet_id(),
  username      text unique not null,
  display_name  text not null,
  avatar_hue    int  not null default 150,
  bio           text default '',
  location      text,
  country       text default 'Earth',
  org           text,
  -- additive tallies (everything derives from these)
  trees_planted        int    not null default 0,
  co2_offset_kg        numeric not null default 0,
  plastic_removed_kg   numeric not null default 0,
  donations_usd        numeric not null default 0,
  volunteer_hours      numeric not null default 0,
  recycle_kg           numeric not null default 0,
  challenges_completed int    not null default 0,
  lessons_completed    int    not null default 0,
  eco_points           int    not null default 0,
  streak_days          int    not null default 0,
  -- derived caches (kept fresh by the app on write)
  eco_score    int not null default 0,
  earth_health int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists profiles_eco_score_idx on public.profiles (eco_score desc);

-- ---------------------------------------------------------------------------
-- contributions (the activity ledger)
-- ---------------------------------------------------------------------------
create table if not exists public.contributions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null check (type in
                ('tree','plastic','donation','volunteer','recycle','challenge','education')),
  amount     numeric not null default 0,
  co2_kg     numeric not null default 0,
  eco_points int not null default 0,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists contributions_user_idx on public.contributions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- badges + user_badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id          text primary key,
  name        text not null,
  emoji       text not null,
  tier        text not null,
  description text not null
);

create table if not exists public.user_badges (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  badge_id    text not null references public.badges (id) on delete cascade,
  achieved_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- follows
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------------------------------------------------------------------------
-- challenges + completions
-- ---------------------------------------------------------------------------
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  type        text not null,
  reward_xp   int not null default 0,
  reward_coins int not null default 0,
  active_on   date not null default current_date
);

create table if not exists public.challenge_completions (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

-- ---------------------------------------------------------------------------
-- social: posts, likes, comments
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  image_url  text,
  hashtags   text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- forums: categories, threads, comments, votes
-- ---------------------------------------------------------------------------
create table if not exists public.forum_categories (
  id    text primary key,
  name  text not null,
  emoji text not null default '💬'
);

create table if not exists public.forum_threads (
  id          uuid primary key default gen_random_uuid(),
  category_id text not null references public.forum_categories (id),
  author_id   uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.forum_comments (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.forum_threads (id) on delete cascade,
  parent_id  uuid references public.forum_comments (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_votes (
  thread_id uuid references public.forum_threads (id) on delete cascade,
  comment_id uuid references public.forum_comments (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  value     int not null check (value in (-1, 1)),
  primary key (user_id, thread_id, comment_id)
);

-- ---------------------------------------------------------------------------
-- Leaderboard view (global ranking by eco-score)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard_eco as
select
  row_number() over (order by eco_score desc) as rank,
  id, planet_id, username, display_name, avatar_hue, country,
  eco_score, earth_health, trees_planted, co2_offset_kg, plastic_removed_kg,
  donations_usd, volunteer_hours, streak_days
from public.profiles;

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_hue)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    (floor(random() * 360))::int
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.contributions enable row level security;
alter table public.user_badges   enable row level security;
alter table public.follows       enable row level security;
alter table public.posts         enable row level security;
alter table public.post_likes    enable row level security;
alter table public.post_comments enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_votes   enable row level security;
alter table public.challenge_completions enable row level security;

-- Public read for the social graph; writes restricted to the owner.
create policy "profiles_read"   on public.profiles      for select using (true);
create policy "profiles_update" on public.profiles      for update using (auth.uid() = id);

create policy "contrib_read"    on public.contributions for select using (true);
create policy "contrib_write"   on public.contributions for insert with check (auth.uid() = user_id);

create policy "ubadge_read"     on public.user_badges   for select using (true);
create policy "ubadge_write"    on public.user_badges   for insert with check (auth.uid() = user_id);

create policy "follows_read"    on public.follows       for select using (true);
create policy "follows_write"   on public.follows       for insert with check (auth.uid() = follower_id);
create policy "follows_delete"  on public.follows       for delete using (auth.uid() = follower_id);

create policy "posts_read"      on public.posts         for select using (true);
create policy "posts_write"     on public.posts         for insert with check (auth.uid() = author_id);
create policy "posts_delete"    on public.posts         for delete using (auth.uid() = author_id);

create policy "plike_read"      on public.post_likes    for select using (true);
create policy "plike_write"     on public.post_likes    for insert with check (auth.uid() = user_id);
create policy "plike_delete"    on public.post_likes    for delete using (auth.uid() = user_id);

create policy "pcomment_read"   on public.post_comments for select using (true);
create policy "pcomment_write"  on public.post_comments for insert with check (auth.uid() = author_id);

create policy "thread_read"     on public.forum_threads for select using (true);
create policy "thread_write"    on public.forum_threads for insert with check (auth.uid() = author_id);

create policy "fcomment_read"   on public.forum_comments for select using (true);
create policy "fcomment_write"  on public.forum_comments for insert with check (auth.uid() = author_id);

create policy "fvote_read"      on public.forum_votes   for select using (true);
create policy "fvote_write"     on public.forum_votes   for insert with check (auth.uid() = user_id);

create policy "ccomplete_read"  on public.challenge_completions for select using (true);
create policy "ccomplete_write" on public.challenge_completions for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed: badge catalog + forum categories (mirrors src/lib/scoring.ts)
-- ---------------------------------------------------------------------------
insert into public.badges (id, name, emoji, tier, description) values
  ('first-tree','First Tree','🌱','bronze','Plant your first tree.'),
  ('forest-guardian','Forest Guardian','🌳','silver','Plant 100 trees.'),
  ('recycling-hero','Recycling Hero','♻️','silver','Recycle 50 kg of material.'),
  ('ocean-saver','Ocean Saver','🐢','silver','Remove 25 kg of plastic.'),
  ('earth-protector','Earth Protector','🌎','gold','Offset one tonne of CO₂.'),
  ('streak-100','100 Day Streak','🔥','gold','Maintain a 100-day streak.'),
  ('volunteer-star','Volunteer Star','⭐','gold','Volunteer 50 hours.'),
  ('scholar','Eco Scholar','📚','bronze','Complete 20 lessons.'),
  ('elite-guardian','Elite Guardian','💎','elite','Reach an eco-score of 35,000.')
on conflict (id) do nothing;

insert into public.forum_categories (id, name, emoji) values
  ('general','General Discussion','💬'),
  ('news','Climate News','📰'),
  ('gardening','Gardening','🌷'),
  ('recycling','Recycling','♻️'),
  ('energy','Renewable Energy','⚡'),
  ('trees','Tree Planting','🌳'),
  ('ocean','Ocean Cleanup','🌊'),
  ('ideas','Ideas','💡'),
  ('questions','Questions','❓'),
  ('success','Success Stories','🏆'),
  ('local','Local Communities','📍')
on conflict (id) do nothing;
