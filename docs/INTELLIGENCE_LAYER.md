# Intelligence Layer

## v1 — Rule-Based Only (no AI at runtime)
- Today's affirmation = `affirmations` row where `day_number = day_of_year(now())`
- Theme filter = exact match on `theme_id`
- Access gate = `subscriptions.status = 'active'` server-side check

## Events Tracked (feeds future intelligence)
- `affirmation_view` — which affirmation, which theme, user/anon
- `theme_select` — which theme chosen
- `lead_capture` — email submitted
- `checkout_start` / `checkout_complete` — conversion funnel

## Auto-Structure Schema (touchpoint metadata example)
```json
{
  "event_type": "affirmation_view",
  "affirmation_id": "uuid",
  "theme_id": "uuid",
  "theme_slug": "happiness",
  "day_number": 47,
  "user_tier": "free"
}
```

## Scoring Rules (v1 — rule-based)
- Lead score: +1 email captured, +2 theme viewed, +5 checkout started, +10 paid
- No ML model yet; scores computed in SQL view

## Later
- AI suggests daily affirmation based on user's most-visited theme
- Sentiment detection on theme preferences
- Personalised email digest (affirmation ranked by engagement history)
- Store AI fields: `value + source + confidence + review_status` per affirmation recommendation