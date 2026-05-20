-- Marquee seed data
-- Run after lib/schema.sql has created the tables.

-- Beta invite codes (20 single-use codes for beta launch).
-- Codes are memorable but not easily guessable. Share individually.
insert into public.beta_codes (code) values
  ('SPOTLIGHT-001'),
  ('SPOTLIGHT-002'),
  ('SPOTLIGHT-003'),
  ('SPOTLIGHT-004'),
  ('SPOTLIGHT-005'),
  ('MARQUEE-HELLO'),
  ('MARQUEE-FRIEND'),
  ('MARQUEE-FOUNDER'),
  ('MARQUEE-BETA-01'),
  ('MARQUEE-BETA-02'),
  ('MARQUEE-BETA-03'),
  ('MARQUEE-BETA-04'),
  ('MARQUEE-BETA-05'),
  ('BE-KNOWN-001'),
  ('BE-KNOWN-002'),
  ('BE-KNOWN-003'),
  ('BE-KNOWN-004'),
  ('BE-KNOWN-005'),
  ('RESUME-IS-DEAD'),
  ('YOUR-SPOTLIGHT')
on conflict (code) do nothing;

-- Reserve the "demo" username so no real user can claim it
-- (the demo profile is served from lib/demo-profile.ts, not the DB).
-- Uncomment once a service-role user exists:
-- insert into public.generated_profiles (user_id, username, name)
-- values ('00000000-0000-0000-0000-000000000000', 'demo', 'Demo Profile')
-- on conflict (username) do nothing;
