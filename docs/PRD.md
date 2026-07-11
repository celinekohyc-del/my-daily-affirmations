# PRD — My Daily Affirmations

## Problem
People who struggle to get out of bed in the morning lack a simple, focused ritual to replace negative self-talk with positive intent. Existing tools are bloated or free-forever with no sustainable model.

## Target User
Anyone who feels stuck, unmotivated, or mentally cluttered in the morning and is willing to pay a small amount for a focused daily practice.

## Core Objects
- **Affirmation** — a single positive statement tied to a theme and a day number (1–365)
- **Theme** — one of 7 categories: Happiness, Abundance, Work & Career, Health & Wellbeing, Love & Relations, Self-Confidence, Peace of Mind
- **User** — registered account with subscription status
- **Subscription** — free or paid tier, linked to Stripe checkout
- **Lead** — email capture before signup (for conversion tracking)
- **Touchpoint** — any meaningful interaction (page view, affirmation viewed, theme selected, payment initiated)

## MVP Must-Haves
- [ ] Homepage shows today's affirmation (demo, no login required)
- [ ] Browse all 7 themes; view affirmations per theme
- [ ] Email capture (lead) on homepage
- [ ] User signup / login
- [ ] Stripe Checkout for paid access (sandbox)
- [ ] Paid users unlock all 365 affirmations; free users see today's only
- [ ] Touchpoint logged on every key action
- [ ] Real payment completes end-to-end in sandbox

## Non-Goals (v1)
- Mobile app
- Push / email notifications
- User-created affirmations
- Social sharing
- Admin CMS (seed via SQL)

## Definition of Done
A brand-new visitor lands on the live URL, sees today's affirmation without logging in, enters their email, creates an account, completes a Stripe sandbox payment, and immediately views the full affirmation library — all persisted to the database and confirmed in the Stripe dashboard.