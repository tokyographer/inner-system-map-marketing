# Inner System Map

## Purpose
A self-report screener for Transcendent Institute that maps a person's inner system in Internal Family Systems (IFS) terms: how much Self-leadership is available, which group of parts leads (Managers, Firefighters or Exiles) and which parts are most active. It runs in two modes. Public mode is the website lead tool: the browser scores the answers and the results are emailed as a PDF. Cohort mode is for program participants and has a facilitator dashboard. The tool is not a diagnostic or validated instrument, and the copy must say so.

The domain reference (theory, scales, rules and copy, generated from the live code) is `docs/KNOWLEDGE-BASE.md`. Read it before you change copy or scoring.

## Architecture
```
content/items.v2.ts ──► lib/scoring (pure) ──► Result JSON
       │                      ▲                    │
content/*.{en,es,ro,tr}.ts    config/scoring.ts    ├─► components/results (results page, section 8 order)
  via content/index.ts                             ├─► lib/pdf (same content, same order)
                                                   ├─► lib/email (Resend: person + institute copy)
                                                   └─► Neon: attempts / public_results (cohort / opt-in)
```
- `content/items.v2.ts` holds the item bank: 84 items with stable IDs, 63 flagged for the short form. ES/RO/TR item text is keyed by ID in `items.v2.{es,ro,tr}.ts`. All other copy is in `content/*.{en,es,ro,tr}.ts` and resolves through `getContent(locale)` and `itemText(item, locale)` in `content/index.ts`. UI strings are in `messages/<locale>.json` (next-intl).
- `config/scoring.ts` holds every threshold. They are heuristics, never norms, and `SCORING_VERSION` is stored with each attempt. `config/app.ts` holds names, locales, forms, retention and feature flags.
- `lib/scoring/` is the pure engine `score(input) → Result`: scales, leads, pattern and modifiers, ranking, pairings, quality and care flags. It does no I/O and has 100% test coverage.
- `lib/questionnaire/`: a seeded constrained order (no two items from the same scale in a row, at most 2 exile items in any 5) and localStorage autosave through `useSyncExternalStore`.
- `lib/pdf/`: the results PDF (@react-pdf/renderer, Jost embedded), rendered in the request locale.
- `lib/email/send-results.ts`: Resend sends two separate emails: one to the person in their locale, and one English copy to `RESULTS_COPY_TO`.
- `app/api/public/{results-pdf,email-results,delete-result}`: zod-validated and rate limited. `app/api/cron/retention` runs nightly and checks `CRON_SECRET`. `app/api/{cohort,facilitator,admin}/export` produce the CSV and JSON exports.
- `db/migrations/` holds the Neon schema, SQL functions and RLS. `lib/db/` provides `withUser()` and `asService()`, `lib/auth/` wraps Neon Auth, `lib/actions/` holds the server actions, `lib/dashboard/` holds the queries, role guard, access codes, CSV export and aggregates, and `lib/validation/` holds the zod schemas.
- Routes live under `app/[locale]/`: `/` landing, `/start`, `/questionnaire`, `/results`, `/cohort/*`, `/facilitator/*`, `/admin/*`, `/privacy`, `/results-deleted`.

Folder-level rules are in `content/CLAUDE.md`, `lib/scoring/CLAUDE.md`, `db/CLAUDE.md` and `tests/CLAUDE.md`. They load when you work in those folders.

## Run Order
```
npm install
cp .env.example .env                  # RESEND_* to send email
npx vercel env pull .env.local --yes  # Neon + Auth vars; add NEON_AUTH_COOKIE_SECRET
npm run db:migrate                    # applies new db/migrations/*.sql (Neon dev branch)
npm run lint && npm run typecheck
npm test                              # vitest; RLS integration tests skip without DATABASE_URL
npx vitest run --coverage             # lib/scoring must stay at 100%
npm run build && npm run e2e          # Playwright at 360px, starts next start on 3111
npm run docs:kb                       # regenerate docs/KNOWLEDGE-BASE.md after content/scoring changes
npm run dev
```

## Definition of done
1. Lint, typecheck and `npm test` are green, with scoring coverage at 100%.
2. If the change touches routes, components or copy: `npm run build && npm run e2e` (includes axe, 0 WCAG 2.1 AA violations).
3. If the change touches content, items, scoring or `config/app.ts`: run `npm run docs:kb` and commit the regenerated KB.
4. If EN copy changed, the ES/RO/TR files changed with it (drafts are fine) and keep the "DRAFT, pending human review" header.
5. Update "Current Status" below when a feature lands or a gap closes.

## Hardware & Environment
- Node 24+, npm 11+. Deploys to Vercel, region fra1 (EU), through `vercel.ts`. Neon Postgres and Neon Auth (eu-central-1), Upstash Redis and Resend are all provisioned through the Vercel Marketplace. There is no local database; development uses the Neon dev branch.

## Key Dependencies & Gotchas
- Next 16 App Router. It uses `proxy.ts` (not middleware.ts) for next-intl routing. `@react-pdf/renderer` is in `serverExternalPackages`, and the PDF and email routes set `runtime = "nodejs"`.
- Server Components that read the session export `dynamic = "force-dynamic"`.
- Never read env or create clients (`auth()`, DB pool, Resend) at module top level in routes or pages. `next build` evaluates them, and CI builds with no Neon or Resend vars. Create them lazily on first request.
- The Vitest config is `vitest.config.mts` (ESM). Unit tests are in `tests/unit/**`, integration tests in `tests/integration/**`, and e2e tests in `tests/e2e/**`.
- Pattern rules are evaluated in order. A manager/firefighter gap of exactly 0.3 resolves to MANAGED or REACTIVE, not POLARISED.
- Team-of-protectors rule: the top two, plus the third when it is within 0.4 of the second.
- Public mode collects name, email and consent on the start screen. `components/results/AutoEmailStatus.tsx` emails the results once per attempt, and the results are always shown on screen. Cohort mode skips the form.
- Rate limiting goes through Upstash when `UPSTASH_REDIS_REST_URL`/`TOKEN` are set; otherwise it falls back to an in-memory window per instance (soft). `rateLimit()` is async.
- Data access: use `withUser(userId, fn)` for anything a signed-in person does (RLS applies). Use `asService(fn)` only for access-code lookup before sign-in, public opt-in results and retention.
- Roles: `requireRole()` in `lib/dashboard/guard.ts` gates the dashboard pages, and RLS still decides which rows are returned. Every profile view and export calls `app.log_access`.
- Access codes are generated in TypeScript (`lib/dashboard/access-code.ts`) and hashed with sha256(lower(trim)), matching `app.hash_access_code`. The plain code is shown once.
- Neon Auth ids are uuids. The emailed OTP is stored hashed, so tests sign in through `/api/auth/sign-up/email`.
- Storage hydration uses `useSyncExternalStore`. Do not read localStorage in effects with setState (the lint rule blocks it). Completing the questionnaire clears progress, so the redirect-to-start effect is guarded by a `finished` ref.
- The PDF embeds Jost from `lib/pdf/fonts/` because Helvetica lacks Turkish and Romanian glyphs. macOS `sips` cannot rasterise the PDF, so use Preview or pdftoppm to check it visually.
- `EXERCISE_STEPS_READY` in `config/app.ts` hides the five S.W.C.I.R. steps in both the page and the PDF. Flip it only after all four locales have real steps.

## Design system
- Source of truth: the Transcendent Institute Design System, claude.ai/artifact/Y6TqWTS3vbH8p9UC1SLoAK.
- Tokens live in `app/globals.css` (`--ti-*` raw stops, with app roles below them). Headings use Newsreader (next/font/google); body and UI use Jost (self-hosted in `app/fonts/`) at weight 300.
- Brand classes: `.btn .btn-primary|.btn-gold|.btn-outline` (2px radius, uppercase tracked), `.card`/`.card-warm` (1px hairline, 4px radius), `.eyebrow`, `.label`, `.on-dark`.
- Gold is used only for the single primary CTA and thin decorative fills. Readable text is never gold (it fails AA on platinum), so eyebrows use lead (#324A6D).
- Score colours: Self gold, Managers nigredo, Firefighters copper, Exiles slate. No red anywhere.
- Never use #FFFFFF as a surface (platinum is the base). No gradients, no shadows on dark, no left-border card accents.

## Configuration
- `.env` comes from `.env.example`. `.env.local` comes from `npx vercel env pull` plus `NEON_AUTH_COOKIE_SECRET`. Both are gitignored. Leaving `RESULTS_COPY_TO` empty disables the institute copy.

## Never Do
- Never type people ("you are a ..."). Use part language only ("a part of you that ...").
- Never use "diagnosis", "disorder", "clinical" or "scientifically validated" in user-facing copy, in any locale (`tests/unit/content/locales.test.ts` enforces this).
- Never add self-harm or suicidality items.
- Never show exile content before protector content. Never write an exercise addressed to an exile.
- Never present thresholds as norms.
- Never log responses, emails, names or scores. Log the job outcome and reason only.
- Never use `asService()` for a request a signed-in person makes.
- Never edit an applied migration.
- Never import a `content/*.en.ts` file directly from a component. Go through `getContent()`.
- Never commit `.env` or `.env.local`.
- Adding a locale requires: `config/app.ts` LOCALES and APP_NAME, `messages/<l>.json` (same key set as en), `content/*.<l>.ts` for items, typologies, exiles, patterns, exercise, support and level-two, `content/pdf-labels.ts`, `content/email-labels.ts`, `content/index.ts`, `LocaleSwitcher` NAMES, a migration widening the locale checks, and the forbidden-word list in the locales test.

## Agents
Project subagents are in `.claude/agents/`:
- `ifs-copy-reviewer` (read-only): checks copy in every locale against the IFS guardrails, forbidden words and section order.
- `locale-sync`: carries an EN copy or key change into ES/RO/TR as drafts and keeps the locale tests green.
- `scoring-engineer`: changes thresholds, rules or items in the engine. Bumps the versions, keeps coverage at 100% and regenerates the KB.
- `data-privacy-auditor` (read-only): reviews diffs for PII logging, `withUser`/`asService` misuse, RLS gaps, missing zod validation or rate limits, and migration hygiene.
- `verify-gate`: runs the full definition-of-done gate and reports exact failures.

## Current Status
- Done: phases 1–7 (see `docs/PHASE-1-PLAN.md` for the original plan, which still describes Supabase; Neon replaced it).
  - Phase 2: scoring engine, item bank v2 and EN content.
  - Phase 3: public mode, the results PDF, the Resend flow and rate limiting.
  - Phase 4: ES, RO and TR drafts.
  - Phase 5: cohort mode on Neon with RLS, consent, history, notes, export and deletion.
  - Phase 6: facilitator and admin dashboards, CSV export and the audit log.
  - Phase 7: retention cron, Upstash, opt-in public result storage with a delete link, privacy placeholders, axe and Lighthouse checks, and CI.
- Since then: OG image; the "Meet this part" framing on the results page and in the PDF (reflection plus belief frame; steps behind `EXERCISE_STEPS_READY`); `docs/KNOWLEDGE-BASE.md` generated by `scripts/build-knowledge-base.ts`; translation review spreadsheets in `docs/translations/`.
- The results email goes to the person in their locale (`content/email-labels.ts`, via `getContent()`). The institute copy stays in English and states the person's language.
- Known gaps:
  - The lint warning in `scripts/build-knowledge-base.ts` (unused `ProtectorKey`) is still open.
- Open (outside code): the Upstash Marketplace terms must be accepted in the browser; Preview env vars need setting in the dashboard; the legal texts need a lawyer; the exercise steps and support resources are placeholders.
- The item bank and all content are DRAFT pending Anthony's clinical review. Translations are DRAFT pending native review.

## Future Integration
- Input: item responses `{ itemId: 1..5 }` + form + locale. Output: `Result` JSON, PDF, email. Cohort data lives in Neon Postgres.
