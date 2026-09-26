-- Published profiles — the live public profile produced by the /build-preview builder.
-- Stores the fully-mapped Profile as JSON; the /[username] renderer reads it directly
-- (no ELVISS mapper). Public read; each user manages only their own. Run once in Supabase.

create table if not exists public.published_profiles (
  username text primary key,
  user_id uuid references auth.users on delete cascade not null,
  profile jsonb not null,
  published_at timestamptz default now()
);
create index if not exists idx_published_profiles_user on public.published_profiles(user_id);

alter table public.published_profiles enable row level security;

create policy "Public can read published profiles" on public.published_profiles
  for select using (true);
create policy "Users manage own published profile" on public.published_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
