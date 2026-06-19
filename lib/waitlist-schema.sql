-- Waitlist table — email collection from the new landing page.
-- Run in Supabase SQL Editor.

create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  first_name text,
  last_name text,
  source text default 'landing',  -- which page / CTA they came from
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notes text,
  created_at timestamptz default now()
);

create index idx_waitlist_email on public.waitlist(email);
create index idx_waitlist_created_at on public.waitlist(created_at desc);

alter table public.waitlist enable row level security;

-- Anyone can submit
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

-- No public read — service role only (you view via Supabase dashboard)
