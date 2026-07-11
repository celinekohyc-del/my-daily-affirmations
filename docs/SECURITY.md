# Security

## Secrets
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` — stored in Vercel env vars only; never in client bundle or repo
- Frontend uses only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose)
- Stripe public key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) only

## Permission Model
- v1 RLS: permissive read/write for demo (anonymous users can view affirmations and submit leads)
- Lock-down sprint: `auth.uid() = user_id` owner policies on `subscriptions`, `leads`, `touchpoints`
- Subscription access gate enforced server-side in Next.js route handlers — never trust client
- Stripe webhook signature verified with `STRIPE_WEBHOOK_SECRET` before any DB write

## Approved Tools Rule
Agent actions use only named functions (`log_touchpoint`, `create_checkout_session`, `activate_subscription`). No raw SQL execution from client. No `run_any` / `send_any` patterns.

## Audit Principle
Every payment event, subscription change, and lead conversion writes a row. Touchpoints are append-only. No delete on `touchpoints` or `subscriptions` in v1 RLS policies.

## What Cannot Be Verified Automatically
- PII exposure in logs (manual review required before go-live)
- Rate limiting on lead capture endpoint (add Vercel rate-limit middleware before launch)
- npm audit must be run and reviewed by builder before going live