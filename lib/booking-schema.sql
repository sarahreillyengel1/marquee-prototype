-- Marquee booking — run once in the Supabase SQL editor. Safe to run more than once.
--
-- booking_settings : each person's weekly hours, timezone, meeting link and Stripe connection.
--                    The owner reads and writes their own row. Nobody else can read it
--                    (the meeting link stays private until someone has booked).
-- bookings         : every booking and every "Send request". No public access at all:
--                    the app's server reads and writes it after checking who is asking.

create table if not exists public.booking_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  timezone text not null default 'America/New_York',
  weekly jsonb not null default '{}'::jsonb,
  meeting_link text not null default '',
  notice_hours int not null default 24,
  days_ahead int not null default 30,
  buffer_min int not null default 0,
  stripe_account_id text,
  stripe_ready boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.booking_settings enable row level security;
drop policy if exists "Owner reads own booking settings" on public.booking_settings;
drop policy if exists "Owner adds own booking settings" on public.booking_settings;
drop policy if exists "Owner updates own booking settings" on public.booking_settings;
create policy "Owner reads own booking settings" on public.booking_settings for select using (auth.uid() = user_id);
create policy "Owner adds own booking settings" on public.booking_settings for insert with check (auth.uid() = user_id);
create policy "Owner updates own booking settings" on public.booking_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  owner_id uuid not null,
  kind text not null default 'booking',          -- 'booking' | 'request'
  status text not null default 'confirmed',      -- 'pending_payment' | 'confirmed' | 'cancelled' | 'requested'
  offer_title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  visitor_timezone text,
  visitor_name text not null,
  visitor_email text not null,
  visitor_note text,
  price_cents int not null default 0,
  fee_cents int not null default 0,
  currency text not null default 'usd',
  stripe_session_id text,
  stripe_payment_intent text,
  manage_token text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  reminded_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text,
  created_at timestamptz not null default now()
);
create index if not exists bookings_username_starts_idx on public.bookings (username, starts_at);
create index if not exists bookings_owner_idx on public.bookings (owner_id, starts_at);
create unique index if not exists bookings_manage_token_idx on public.bookings (manage_token);
-- two people can never hold the same start time with the same person
create unique index if not exists bookings_no_double_idx on public.bookings (username, starts_at)
  where kind = 'booking' and status in ('confirmed', 'pending_payment');
alter table public.bookings enable row level security;
-- (no policies on purpose: only the server can touch this table)

-- tell the API about the new tables straight away
notify pgrst, 'reload schema';
