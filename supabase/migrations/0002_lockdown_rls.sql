-- Sprint 5 — Lock It Down.
-- Owner-scoped RLS: a signed-in user can only READ their own rows. The public
-- funnel (anonymous lead capture, append-only touchpoint logging) stays open
-- for INSERT only — no read exposure. Subscription writes are system-only
-- (Stripe webhook via the service-role key), never client-writable.

-- themes / affirmations: stay publicly readable, drop public write ------------
drop policy if exists "themes_v1_write" on themes;
drop policy if exists "affirmations_v1_write" on affirmations;
-- (themes_v1_read / affirmations_v1_read using (true) remain in place)

-- subscriptions: owner can read only their own; no public read/write ---------
drop policy if exists "subscriptions_v1_read" on subscriptions;
drop policy if exists "subscriptions_v1_write" on subscriptions;
drop policy if exists "subscriptions_owner_read" on subscriptions;
create policy "subscriptions_owner_read" on subscriptions
  for select using (auth.uid() = user_id);

-- leads: owner reads their own; anyone may INSERT (email capture funnel) -----
drop policy if exists "leads_v1_read" on leads;
drop policy if exists "leads_v1_write" on leads;
drop policy if exists "leads_owner_read" on leads;
drop policy if exists "leads_public_insert" on leads;
create policy "leads_owner_read" on leads
  for select using (auth.uid() = user_id);
create policy "leads_public_insert" on leads
  for insert with check (true);

-- touchpoints: owner reads their own; append-only INSERT for all (audit log) -
drop policy if exists "touchpoints_v1_read" on touchpoints;
drop policy if exists "touchpoints_v1_write" on touchpoints;
drop policy if exists "touchpoints_owner_read" on touchpoints;
drop policy if exists "touchpoints_public_insert" on touchpoints;
create policy "touchpoints_owner_read" on touchpoints
  for select using (auth.uid() = user_id);
create policy "touchpoints_public_insert" on touchpoints
  for insert with check (true);

-- Lead score view (Intelligence doc, rule-based) -----------------------------
create or replace view lead_scores as
select
  l.id,
  l.email,
  l.user_id,
  l.created_at,
  l.converted_at,
  coalesce(sum(
    case t.event_type
      when 'lead_capture' then 1
      when 'theme_select' then 2
      when 'checkout_start' then 5
      when 'checkout_complete' then 10
      else 0
    end
  ), 0) as score
from leads l
left join touchpoints t on t.user_id = l.user_id
group by l.id, l.email, l.user_id, l.created_at, l.converted_at;

-- Tell PostgREST to reload its schema cache so the REST API picks up the
-- tables created by this migration set immediately.
notify pgrst, 'reload schema';
