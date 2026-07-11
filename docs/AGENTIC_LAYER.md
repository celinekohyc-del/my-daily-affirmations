# Agentic Layer

## Risk Levels & Actions

### Low — Auto (no approval)
- Tag new lead with source channel
- Log touchpoint on page load / affirmation view
- Compute lead score from touchpoint events

### Medium — Light Approval
- Mark lead as converted when matching email signs up
- Flag subscription as cancelled when Stripe sends `customer.subscription.deleted`

### High — Always Approval
- Send welcome email to new paid subscriber
- Trigger Stripe Checkout session (server action, human-initiated click)

### Critical — Human Only
- Issue Stripe refund
- Delete user data
- Export PII lead list

## Named Tools (v1)
- `log_touchpoint(user_id, event_type, metadata)` — Supabase insert
- `create_checkout_session(user_id, price_id)` — Stripe API via Edge Function
- `activate_subscription(stripe_session_id)` — Supabase update via webhook handler

## Audit Log Fields (touchpoints table doubles as audit log)
`id, user_id, event_type, metadata, created_at`

Stripe webhook events logged separately in `subscriptions` with `stripe_session_id`.

## v1 vs Later
- v1: only the three named tools above
- Later: email drip agent, churn-risk scorer, affirmation recommendation engine