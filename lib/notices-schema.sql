-- In-app notifications from Team Marquee and the "How is it going?" check-in. Run once in Supabase: SQL Editor -> paste -> Run.
--
-- notices       : what Team Marquee posts. Members see every published notice behind the bell.
-- notice_reads  : which member has opened which notice, so the badge only counts unread ones.
-- checkins      : each member's answer to "How is it going?" (great | starting | ok), asked on their 2nd and
--                 5th visit. A visit is a day they opened Marquee signed in, counted from page_views.
-- checkin_settings : when the check-in went live. A member who had already passed their 2nd visit by then
--                 is counted from that day instead, so they still get asked on their 2nd and 5th visit from now.
create table if not exists public.notices (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  title text not null,
  body text not null default '',
  link_url text not null default '',
  link_label text not null default '',
  published boolean not null default true,
  created_by text not null default ''
);
create index if not exists notices_created on public.notices (created_at desc);
alter table public.notices enable row level security; -- no policies: only the server (service role) reads or writes

create table if not exists public.notice_reads (
  notice_id bigint not null references public.notices(id) on delete cascade,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (notice_id, user_id)
);
alter table public.notice_reads enable row level security;

create table if not exists public.checkins (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  email text not null default '',
  ask int not null,                  -- 2 or 5: which visit the question was asked on
  answer text not null,              -- great | starting | ok
  unique (user_id, ask)
);
alter table public.checkins enable row level security;

create table if not exists public.checkin_settings (
  id int primary key default 1,
  started_at timestamptz not null default now()
);
insert into public.checkin_settings (id) values (1) on conflict (id) do nothing;
alter table public.checkin_settings enable row level security;
