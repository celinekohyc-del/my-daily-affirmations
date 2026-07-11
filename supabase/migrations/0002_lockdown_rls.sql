-- Sprint 5 — Lock It Down.
-- Replaces v1 permissive policies with owner-scoped RLS. Privileged writes
-- (lead capture, touchpoint logging, subscription activation) go through the
-- service-role key, which bypasses RLS, so they keep working.

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

-- leads: owner can read their own; inserts happen via service role ----------
drop policy if exists "leads_v1_read" on leads;
drop policy if exists "leads_v1_write" on leads;
drop policy if exists "leads_owner_read" on leads;
create policy "leads_owner_read" on leads
  for select using (auth.uid() = user_id);

-- touchpoints: owner can read their own; append-only via service role -------
drop policy if exists "touchpoints_v1_read" on touchpoints;
drop policy if exists "touchpoints_v1_write" on touchpoints;
drop policy if exists "touchpoints_owner_read" on touchpoints;
create policy "touchpoints_owner_read" on touchpoints
  for select using (auth.uid() = user_id);

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
