-- Affirmations: visitors affirm a person's superpower ("12 people affirm this").
-- One affirmation per visitor per superpower. Public can read counts and add one; nothing else.
create table if not exists public.superpower_affirmations (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  superpower text not null,
  visitor_id text not null,
  created_at timestamptz default now(),
  unique (username, superpower, visitor_id)
);
create index if not exists superpower_affirmations_username_idx on public.superpower_affirmations (username);
alter table public.superpower_affirmations enable row level security;
create policy "Anyone can read affirmations" on public.superpower_affirmations for select using (true);
create policy "Anyone can add an affirmation" on public.superpower_affirmations for insert with check (true);
