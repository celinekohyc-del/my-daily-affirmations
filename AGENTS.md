# my-daily-affirmations

<!-- Managed by Launchpad. Edits here may be overwritten on next sync. -->

## Stack & commands

- Framework: Next.js
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `lint`: `next lint`
- `start`: `next start`

## Decisions

- Funnel writes are implemented as append-only to maintain immutability and audit trail

## Gotchas

- Access reads under owner RLS require special handling; ensure permission checks are in place when reading data scoped to owners

## Notes

- Database schema migration has been documented alongside planning artifacts (PRD, architecture, sprints).
- AGENTS.md synced as part of Launchpad memory maintenance
