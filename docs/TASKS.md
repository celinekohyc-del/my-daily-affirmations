# Tasks & Sprints

## Sprint 1 — Database & Seed Data (Demo-Ready)
**Goal:** Schema live, 365 affirmations seeded, homepage shows today's affirmation with no login.
- [ ] Run migration SQL on Supabase (themes, affirmations, leads, subscriptions, touchpoints)
- [ ] Seed all 7 themes
- [ ] Seed 365 affirmations (distributed across themes)
- [ ] Build `/` page: show today's affirmation (day_of_year), no auth required
- [ ] Build `/themes` page: list all 7 themes with affirmation count
- [ ] Build `/themes/[slug]` page: list affirmations for theme (first 3 visible free, rest blurred)
- [ ] All pages handle loading / empty / error states
- [ ] Verify anonymous visitor sees real data, not a login wall

**Definition of Done:** Live URL returns 200 for a logged-out visitor; today's affirmation is visible; theme pages render with real seeded data.

---

## Sprint 2 — Lead Capture & Touchpoint Logging ✦ v1 core engine
**Goal:** Email capture works; every key action is logged.
- [ ] Email capture form on homepage → inserts row in `leads`
- [ ] `log_touchpoint` function called on: page_view, affirmation_view, theme_select, lead_capture
- [ ] Form shows inline error if email invalid; success message on submit
- [ ] Duplicate email on `leads` handled gracefully (upsert)
- [ ] Verify rows appear in Supabase dashboard after each action

**Definition of Done:** Submit an email on homepage → `leads` row exists; view an affirmation → `touchpoints` row exists with correct metadata.

---

## Sprint 3 — Auth (Signup / Login)
**Goal:** Users can create an account and log in.
- [ ] Supabase Auth email+password signup
- [ ] Login page at `/login`, signup at `/signup`
- [ ] Redirect to `/` after auth
- [ ] Link lead email to `user_id` on signup (update `leads.converted_at` + `user_id`)
- [ ] Protected route helper (used only for `/account` — app still browsable without login)
- [ ] Handle auth errors (wrong password, duplicate email) with clear copy

**Definition of Done:** New user signs up → appears in Supabase Auth; matching `leads` row updated with `converted_at`.

---

## Sprint 4 — Stripe Checkout & Access Gating ✦ v1 functional milestone
**Goal:** Real (sandbox) payment works; paid users unlock full library.
- [ ] Stripe product + price created in dashboard (sandbox)
- [ ] `/api/checkout` route: creates Stripe Checkout session via `create_checkout_session` tool
- [ ] Stripe webhook handler at `/api/webhooks/stripe`: verifies signature, calls `activate_subscription`
- [ ] `subscriptions` row created with `status = 'active'` on successful webhook
- [ ] Access gate: free users see today's affirmation only; paid users see all 365
- [ ] Blurred/locked state on affirmations with "Unlock All" CTA
- [ ] `/account` page shows subscription status
- [ ] Test end-to-end with Stripe test card `4242 4242 4242 4242`
- [ ] Webhook signature verification confirmed in logs

**Definition of Done:** Sandbox payment completes → `subscriptions.status = 'active'` in DB → user sees full library without page refresh.

---

## Sprint 5 — Lock It Down (Auth-Scoped RLS)
**Goal:** Per-user data isolation before real users or real payments go live.
- [ ] Replace v1 permissive RLS policies with `auth.uid() = user_id` on `subscriptions`, `leads`, `touchpoints`
- [ ] `affirmations` and `themes` remain publicly readable
- [ ] Verify anonymous users can still view today's affirmation
- [ ] Verify user A cannot read user B's subscription or touchpoints
- [ ] Rate limiting on `/api/checkout` and lead capture endpoint
- [ ] Run `npm audit`; resolve high/critical vulnerabilities
- [ ] Switch Stripe keys from sandbox to live
- [ ] Deploy to production Vercel URL

**Definition of Done:** Logged-out stranger hits live URL and sees today's affirmation; logged-in user sees only their own data; real Stripe payment succeeds.

---

## Gantt (approximate)
```
Week 1: Sprint 1 ██████  Sprint 2 ████
Week 1: Sprint 3 ████    Sprint 4 ████████
Week 2: Sprint 5 ██████
```