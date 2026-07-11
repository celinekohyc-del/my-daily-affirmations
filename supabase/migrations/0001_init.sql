create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

alter table themes enable row level security;
drop policy if exists "themes_v1_read" on themes;
create policy "themes_v1_read" on themes for select using (true);
drop policy if exists "themes_v1_write" on themes;
create policy "themes_v1_write" on themes for all using (true) with check (true);

create table if not exists affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  theme_id uuid references themes(id),
  day_number int unique not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table affirmations enable row level security;
drop policy if exists "affirmations_v1_read" on affirmations;
create policy "affirmations_v1_read" on affirmations for select using (true);
drop policy if exists "affirmations_v1_write" on affirmations;
create policy "affirmations_v1_write" on affirmations for all using (true) with check (true);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  source text,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(email)
);

alter table leads enable row level security;
drop policy if exists "leads_v1_read" on leads;
create policy "leads_v1_read" on leads for select using (true);
drop policy if exists "leads_v1_write" on leads;
create policy "leads_v1_write" on leads for all using (true) with check (true);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text,
  stripe_session_id text,
  status text not null default 'free',
  started_at timestamptz,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_v1_read" on subscriptions for select using (true);
drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_v1_write" on subscriptions for all using (true) with check (true);

create table if not exists touchpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table touchpoints enable row level security;
drop policy if exists "touchpoints_v1_read" on touchpoints;
create policy "touchpoints_v1_read" on touchpoints for select using (true);
drop policy if exists "touchpoints_v1_write" on touchpoints;
create policy "touchpoints_v1_write" on touchpoints for all using (true) with check (true);

insert into themes (id, name, slug, description, icon) values
  ('a1000000-0000-0000-0000-000000000001', 'Happiness', 'happiness', 'Cultivate joy and gratitude every day', '😊'),
  ('a1000000-0000-0000-0000-000000000002', 'Abundance', 'abundance', 'Open your mind to prosperity and opportunity', '🌟'),
  ('a1000000-0000-0000-0000-000000000003', 'Work & Career', 'work-and-career', 'Build confidence and purpose in your professional life', '💼'),
  ('a1000000-0000-0000-0000-000000000004', 'Health & Wellbeing', 'health-and-wellbeing', 'Honour your body and nurture your energy', '🌿'),
  ('a1000000-0000-0000-0000-000000000005', 'Love & Relations', 'love-and-relations', 'Deepen connection and give and receive love freely', '❤️'),
  ('a1000000-0000-0000-0000-000000000006', 'Self-Confidence', 'self-confidence', 'Stand tall and trust your own voice', '🦁'),
  ('a1000000-0000-0000-0000-000000000007', 'Peace of Mind', 'peace-of-mind', 'Release worry and return to stillness', '🕊️')
on conflict (slug) do nothing;

insert into affirmations (theme_id, day_number, body) values
  ('a1000000-0000-0000-0000-000000000001', 1, 'I choose happiness today and every day.'),
  ('a1000000-0000-0000-0000-000000000001', 2, 'Joy flows through me naturally and easily.'),
  ('a1000000-0000-0000-0000-000000000001', 3, 'I am grateful for the abundance of good in my life.'),
  ('a1000000-0000-0000-0000-000000000002', 4, 'I am open and ready to receive all the abundance the universe has for me.'),
  ('a1000000-0000-0000-0000-000000000002', 5, 'Money flows to me in expected and unexpected ways.'),
  ('a1000000-0000-0000-0000-000000000003', 6, 'I am talented, capable, and making a meaningful contribution.'),
  ('a1000000-0000-0000-0000-000000000004', 7, 'My body is healthy, strong, and full of vibrant energy.'),
  ('a1000000-0000-0000-0000-000000000005', 8, 'I give and receive love with an open and trusting heart.'),
  ('a1000000-0000-0000-0000-000000000006', 9, 'I believe in myself and my ability to handle anything that comes my way.'),
  ('a1000000-0000-0000-0000-000000000007', 10, 'I release what I cannot control and find peace in this present moment.')
on conflict (day_number) do nothing;

insert into leads (email, source) values
  ('demo.user1@example.com', 'homepage'),
  ('demo.user2@example.com', 'homepage'),
  ('demo.user3@example.com', 'theme_page')
on conflict (email) do nothing;