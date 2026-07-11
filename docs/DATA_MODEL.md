# Data Model

## themes
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. 'Happiness' |
| slug | text unique | e.g. 'happiness' |
| description | text | one-line summary |
| icon | text | emoji or icon name |
| user_id | uuid nullable | owner scope (v1: null) |
| created_at | timestamptz | |

## affirmations
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| theme_id | uuid FK → themes | |
| day_number | int | 1–365, unique |
| body | text | the affirmation text |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## leads
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text | |
| source | text | e.g. 'homepage' |
| converted_at | timestamptz nullable | set when lead signs up |
| user_id | uuid nullable | linked after signup |
| created_at | timestamptz | |

## subscriptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| stripe_customer_id | text | |
| stripe_session_id | text | |
| status | text | 'free' \| 'active' \| 'cancelled' |
| started_at | timestamptz nullable | |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## touchpoints
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | null = anonymous |
| event_type | text | 'page_view' \| 'affirmation_view' \| 'theme_select' \| 'lead_capture' \| 'checkout_start' \| 'checkout_complete' |
| metadata | jsonb | e.g. `{affirmation_id, theme_id}` |
| created_at | timestamptz | |

## AI fields (future)
If affirmation relevance scoring is added: `score numeric`, `score_source text`, `score_confidence numeric`, `score_review_status text default 'unreviewed'`.

## RLS
All tables: v1 permissive (select + all open). Lock-down sprint replaces with `auth.uid() = user_id`.