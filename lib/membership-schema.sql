-- Marquee membership — run once in the Supabase SQL editor. Safe to run more than once.
-- Adds the plan a member is on, so it can be read without asking Stripe each time.
alter table public.profiles_meta add column if not exists plan text;
alter table public.profiles_meta add column if not exists founding_member boolean not null default false;
alter table public.profiles_meta add column if not exists stripe_subscription_id text;
create index if not exists profiles_meta_subscription_idx on public.profiles_meta (stripe_subscription_id);
notify pgrst, 'reload schema';
