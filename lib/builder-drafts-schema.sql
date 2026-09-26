-- Builder drafts — autosaved state for the /build-preview profile builder.
-- Fresh store for the rebuilt builder (ELVISS intake_answers/elviis_plus are retired).
-- One draft per user, stored as JSON; RLS so each user only touches their own.
-- Run this once in the Supabase SQL editor.

create table if not exists public.builder_drafts (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.builder_drafts enable row level security;

create policy "Users manage own builder draft" on public.builder_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
