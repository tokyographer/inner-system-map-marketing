# tests

- `unit/` (vitest, Node): scoring (100% coverage required), content and locales, results order, API validation, rate limiting, email, PDF render, questionnaire order, dashboard aggregates.
- `integration/` (vitest): RLS and SQL functions, plus public result storage, against the Neon dev branch. These skip without `DATABASE_URL` in `.env.local`.
- `e2e/` (Playwright, Pixel 5 at 360px, port 3111): the public happy path, locales, axe audits, and cohort and facilitator walks (the last two skip without Neon keys). Run `npm run build` first; the config runs `next start`.

## Invariants guarded by tests (do not weaken them to make a change pass)
- `content/locales.test.ts`: every locale has every item, typology, exile, pattern, modifier and exercise step; message key sets are equal; no forbidden words; DRAFT headers are present; specialised terms stay untranslated.
- `content/results-order.test.ts`: exile sections come after protector sections, and the exercise targets a protector.
- `scoring/*`: threshold boundaries and pattern precedence.

Tests never print responses, emails or scores, even on failure paths you add.
