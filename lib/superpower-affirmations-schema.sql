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

-- ── Affirm v2 (Sept 28 2026): sign-in required, faces shown ──
-- Affirmations are now written only by the app's server after it has checked who is signed in.
-- Closing the open insert policy stops anyone writing an affirmation in someone else's name.
-- Safe to run more than once.
drop policy if exists "Anyone can add an affirmation" on public.superpower_affirmations;
-- Remove the old anonymous affirmations (no account behind them, so no face to show).
delete from public.superpower_affirmations where visitor_id not like 'user:%';
