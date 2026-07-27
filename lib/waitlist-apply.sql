-- Waitlist → Application upgrade.
-- Adds LinkedIn capture + an approval status so you can review and approve people.
-- Idempotent — safe to run on the existing production `waitlist` table.
-- Run in Supabase SQL Editor.

alter table public.waitlist add column if not exists linkedin_url text;
alter table public.waitlist add column if not exists status text default 'pending';

-- Backfill any rows created before this migration.
update public.waitlist set status = 'pending' where status is null;

-- Fast filtering of who still needs review.
create index if not exists idx_waitlist_status on public.waitlist(status);

-- Reviewing / approving:
--   Pending applicants:  select first_name, last_name, email, linkedin_url, created_at
--                        from public.waitlist where status = 'pending' order by created_at desc;
--   Approve someone:     update public.waitlist set status = 'approved' where email = 'them@example.com';
--   Decline someone:     update public.waitlist set status = 'declined' where email = 'them@example.com';
