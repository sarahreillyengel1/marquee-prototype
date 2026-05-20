-- Marquee Database Schema
-- Run this in Supabase SQL Editor

-- Users metadata (extends Supabase auth.users)
create table public.profiles_meta (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  subscription_status text default 'beta' check (subscription_status in ('beta', 'active', 'cancelled')),
  stripe_customer_id text,
  beta_code_used text,
  created_at timestamptz default now()
);

-- Beta invite codes
create table public.beta_codes (
  code text primary key,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users
);

-- Resume parse cache
create table public.resume_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  raw_text text,
  parsed jsonb,
  created_at timestamptz default now()
);

-- Intake answers (questionnaire state)
create table public.intake_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  answers jsonb default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- Generated profiles
create table public.generated_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  username text unique,
  name text,
  location text,
  dob date,
  avatar_url text,
  work_type text,
  work_status text,
  work_env text[],
  hours_per_week int,
  salary_min int,
  salary_max int,
  rate_min int,
  rate_max int,
  ai_headline text,
  ai_career_arc text,
  ai_pull_quote text,
  ai_leadership_summary text,
  ai_insights_summary text,
  theme text default 'light' check (theme in ('light', 'dark', 'indigo', 'warm')),
  social_links jsonb,
  elviis_plus jsonb,
  generated_at timestamptz,
  updated_at timestamptz default now()
);

-- Work history
create table public.work_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  company text,
  role_title text,
  start_date text,
  end_date text,
  is_current boolean default false,
  sector text,
  stage text,
  original_bullets jsonb,
  ai_narrative text,
  defining_text text,
  display_order int default 0
);

-- Skills
create table public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  skill_name text,
  proficiency int check (proficiency between 1 and 5),
  category text
);

-- Indexes
create index idx_profiles_meta_username on public.profiles_meta(username);
create index idx_generated_profiles_username on public.generated_profiles(username);
create index idx_generated_profiles_user_id on public.generated_profiles(user_id);
create index idx_work_history_user_id on public.work_history(user_id);
create index idx_skills_user_id on public.skills(user_id);
create index idx_intake_answers_user_id on public.intake_answers(user_id);

-- RLS Policies
alter table public.profiles_meta enable row level security;
alter table public.beta_codes enable row level security;
alter table public.resume_data enable row level security;
alter table public.intake_answers enable row level security;
alter table public.generated_profiles enable row level security;
alter table public.work_history enable row level security;
alter table public.skills enable row level security;

-- profiles_meta: users can read/update their own row
create policy "Users can read own profile meta" on public.profiles_meta
  for select using (auth.uid() = id);
create policy "Users can update own profile meta" on public.profiles_meta
  for update using (auth.uid() = id);
create policy "Users can insert own profile meta" on public.profiles_meta
  for insert with check (auth.uid() = id);

-- beta_codes: no public access (service role only)
-- No policies = no public access with RLS enabled

-- resume_data: users can read/write their own
create policy "Users can read own resume data" on public.resume_data
  for select using (auth.uid() = user_id);
create policy "Users can insert own resume data" on public.resume_data
  for insert with check (auth.uid() = user_id);

-- intake_answers: users can read/write their own
create policy "Users can read own intake" on public.intake_answers
  for select using (auth.uid() = user_id);
create policy "Users can insert own intake" on public.intake_answers
  for insert with check (auth.uid() = user_id);
create policy "Users can update own intake" on public.intake_answers
  for update using (auth.uid() = user_id);

-- generated_profiles: public read by username, owner can update
create policy "Public can read profiles" on public.generated_profiles
  for select using (true);
create policy "Users can insert own profile" on public.generated_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.generated_profiles
  for update using (auth.uid() = user_id);

-- work_history: users can CRUD their own
create policy "Users can read own work history" on public.work_history
  for select using (auth.uid() = user_id);
create policy "Public can read work history via profile" on public.work_history
  for select using (true);
create policy "Users can insert own work history" on public.work_history
  for insert with check (auth.uid() = user_id);
create policy "Users can update own work history" on public.work_history
  for update using (auth.uid() = user_id);
create policy "Users can delete own work history" on public.work_history
  for delete using (auth.uid() = user_id);

-- skills: users can CRUD their own, public read
create policy "Public can read skills" on public.skills
  for select using (true);
create policy "Users can insert own skills" on public.skills
  for insert with check (auth.uid() = user_id);
create policy "Users can update own skills" on public.skills
  for update using (auth.uid() = user_id);
create policy "Users can delete own skills" on public.skills
  for delete using (auth.uid() = user_id);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
create policy "Anyone can read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users can upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
