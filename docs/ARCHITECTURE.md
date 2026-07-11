# Architecture

## Stack
- **Frontend** — Next.js 14 (App Router), Tailwind CSS, hosted on Vercel
- **Backend** — Supabase (Postgres + Auth + RLS + Edge Functions)
- **Payments** — Stripe Checkout (sandbox first, live key added at launch)
- **Email capture** — Supabase `leads` table; no third-party needed in v1

## What to Build Now vs Later
**Now:** affirmation viewer, theme browser, email lead capture, auth, Stripe checkout, touchpoint logging 
**Later:** streak tracking, personalised daily picks, email digest, admin dashboard, referral programme

## Key User Action — Step by Step
1. Visitor hits `/` → Next.js fetches today's affirmation from `affirmations` table (anon read allowed)
2. Visitor submits email → row inserted into `leads`; touchpoint logged
3. Visitor clicks Sign Up → Supabase Auth creates user row
4. User clicks Upgrade → server action calls Stripe Checkout API → redirects to Stripe-hosted page
5. Stripe sends `checkout.session.completed` webhook → Supabase Edge Function sets `subscriptions.status = 'active'`
6. User returns to app → subscription status checked server-side → full library unlocked
7. Every page visit and affirmation view logged to `touchpoints`

## Layer Plan
1. **Data first** — schema, seed 365 affirmations, RLS policies
2. **App logic** — pages, auth, Stripe webhook, access gating
3. **Smart features (later)** — personalised ranking, streak-based recommendations

## Core Without AI
All affirmations are pre-written and stored in Postgres. The app fully functions with no AI at runtime.