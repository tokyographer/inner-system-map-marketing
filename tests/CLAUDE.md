# tests

- `unit/` (vitest, Node): scoring (100% coverage required), content and locales, results order, API validation, rate limiting, email, PDF render, questionnaire order, dashboard aggregates.
- `integration/` (vitest): RLS and SQL functions, plus public result storage, against the Neon dev branch (`marketing-dev` here), plus the marketing attribution and funnel-count tables. All of them create users (including admin profiles) and rows and run retention, so they run only with `ALLOW_DB_WRITES=1` as well as `DATABASE_URL`. Point `.env.local` at `marketing-dev`, never production.
- `e2e/` (Playwright, Pixel 5 at 360px, port 3111): the public happy path, locales, axe audits, and cohort and facilitator walks (the last two skip without Neon keys). Run `npm run build` first; the config runs `next start`.

## Invariants guarded by tests (do not weaken them to make a change pass)
- `content/locales.test.ts`: every locale has every item, typology, exile, pattern, modifier and exercise step; message key sets are equal; no forbidden words; DRAFT headers are present; specialised terms stay untranslated.
- `content/results-order.test.ts`: exile sections come after protector sections, and the exercise targets a protector.
- `scoring/*`: threshold boundaries and pattern precedence.
- `scoring/golden.test.ts` with `fixtures/core-golden.json`: exact `score()` output for 13 fixed inputs covering every pattern, modifier and quality flag. It is shared with the marketing repo, and a failure means the scoring core has drifted. Regenerate it only for a deliberate upstream change (`npm run core:golden:update`).

E2E walks that answer by position pin the questionnaire seed (see the happy path): with a random seed the pattern varies, and FLOODED shows placeholder support resources.

Tests never print responses, emails or scores, even on failure paths you add.
