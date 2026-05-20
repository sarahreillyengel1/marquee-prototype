-- Contact requests table — "I want to work with you" inquiries from public profile visitors.
-- Run this in Supabase SQL Editor after the main schema.

create table public.contact_requests (
  id uuid default gen_random_uuid() primary key,
  profile_user_id uuid references auth.users on delete cascade not null,
  -- Sender info (no auth required — anyone can send)
  sender_name text not null,
  sender_email text not null,
  sender_company text,
  intent text check (intent in ('hiring', 'project', 'speaking', 'collab', 'other')) default 'other',
  message text not null,
  -- Owner state
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz default now()
);

create index idx_contact_requests_profile_user on public.contact_requests(profile_user_id, created_at desc);
create index idx_contact_requests_unread on public.contact_requests(profile_user_id) where read_at is null;

alter table public.contact_requests enable row level security;

-- Anyone can insert (public profile contact form)
create policy "Anyone can send contact request" on public.contact_requests
  for insert with check (true);

-- Profile owners can read + update their own incoming requests
create policy "Owners can read own contact requests" on public.contact_requests
  for select using (auth.uid() = profile_user_id);

create policy "Owners can update own contact requests" on public.contact_requests
  for update using (auth.uid() = profile_user_id);

create policy "Owners can delete own contact requests" on public.contact_requests
  for delete using (auth.uid() = profile_user_id);
