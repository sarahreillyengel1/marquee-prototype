-- Referrals. Run once in Supabase: SQL Editor -> paste -> Run.
-- Invites a member has sent (up to 10), and friends who have joined (paid) through a member's link.
create table if not exists public.referral_invites (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  referrer_id uuid not null,
  name text,
  email text not null,
  unique (referrer_id, email)
);
create index if not exists referral_invites_referrer_idx on public.referral_invites (referrer_id);
alter table public.referral_invites enable row level security;

create table if not exists public.referrals (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  referrer_id uuid not null,
  referred_id uuid not null unique,
  referred_email text,
  code text,
  session_id text,
  paid_at timestamptz
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);
alter table public.referrals enable row level security; -- no policies on either: only the server reads or writes
