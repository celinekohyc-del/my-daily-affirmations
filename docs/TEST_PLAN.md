# Test Plan

## 1. Core Success Scenario (walk every step)
1. Open live URL as logged-out stranger → homepage loads with today's affirmation text visible
2. Click a theme → theme page loads; first 3 affirmations readable; rest locked with "Unlock All" CTA
3. Submit email in capture form → success message shown; `leads` row in Supabase with correct email + source
4. Click Sign Up → complete signup form → redirected to homepage; user in Supabase Auth
5. Click Unlock All → redirected to Stripe Checkout (sandbox)
6. Enter test card `4242 4242 4242 4242`, exp `12/34`, CVC `123` → payment succeeds
7. Redirected back to app → full affirmation library unlocked immediately
8. Check Supabase: `subscriptions` row has `status = 'active'`
9. Check Stripe dashboard: payment appears
10. Log out → today's affirmation still visible; full library locked again

## 2. Empty States
- Fresh DB (no affirmations) → `/themes/[slug]` shows "No affirmations yet" message, not a blank screen
- No leads yet → `/account` shows "No activity yet"

## 3. Error Cases
- Invalid email in lead form → inline error "Please enter a valid email"
- Duplicate email in lead form → "You're already on the list"
- Stripe webhook with invalid signature → 400 returned, no DB write, error logged
- Stripe checkout cancelled → user returned to app; `subscriptions` row stays `free`
- Supabase down → page shows "Something went wrong, please try again" — no crash

## 4. Permission Checks (post Sprint 5)
- User A logs in → cannot fetch User B's subscription via direct API call (RLS blocks it)
- Anonymous user → cannot insert to `subscriptions` directly

## 5. Payment Verification
- Confirm webhook fires in Stripe dashboard event log
- Confirm `stripe_session_id` stored on subscription row matches Stripe event