# Inner System Map: marketing

## Purpose
A self-report screener for Transcendent Institute that maps a person's inner system in Internal Family Systems (IFS) terms: how much Self-leadership is available, which group of parts leads (Managers, Firefighters or Exiles) and which parts are most active. It runs in two modes. Public mode is the website lead tool: the browser scores the answers and the results are emailed as a PDF. Cohort mode is for program participants and has a facilitator dashboard. The tool is not a diagnostic or validated instrument, and the copy must say so.

This repository is the marketing version: the same app plus lead-generation features (attribution, funnel analytics, the localised program invite, partner links, sharing). It is a clone of the original app, which is the git remote `upstream` (`../inner-system-ifs-test`). Read "Relationship to upstream" below before you change anything.

The marketing plan (funnel, channels, nurture sequence, guardrails) is https://claude.ai/artifact/TE43jqJa9kYRe37fMBsANn. The guardrails that bind code are copied into `marketing/CLAUDE.md`.

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
- `lib/pdf/`: the results PDF (@react-pdf/renderer, Jost embedded), rendered in the request locale. The person's name prints in the PDF header, and `lib/pdf/filename.ts` puts it in every filename (`<app-name-in-locale>-results-<name-slug>.pdf`; the institute copy uses the English app name). The name is required for emailed results.
- `lib/email/send-results.ts`: Resend sends two separate emails. The person gets the email and PDF in their locale. `RESULTS_COPY_TO` gets an all-English copy: body, subject and a second PDF rendered in English by the route (`institutePdf`).
- `app/api/public/{results-pdf,email-results,delete-result}`: zod-validated and rate limited. `app/api/cron/retention` runs nightly and checks `CRON_SECRET`. `app/api/{cohort,facilitator,admin}/export` produce the CSV and JSON exports.
- `db/migrations/` holds the Neon schema, SQL functions and RLS. `lib/db/` provides `withUser()` and `asService()`, `lib/auth/` wraps Neon Auth, `lib/actions/` holds the server actions, `lib/dashboard/` holds the queries, role guard, access codes, CSV export and aggregates, and `lib/validation/` holds the zod schemas.
- Routes live under `app/[locale]/`: `/` landing, `/start`, `/questionnaire`, `/results`, `/cohort/*`, `/facilitator/*`, `/admin/*`, `/privacy`, `/results-deleted`.
- `marketing/` (this repo only): lead-generation code and its rules. Read `marketing/CLAUDE.md` before touching anything marketing. Source attribution: `AttributionCapture` (in the locale layout) keeps utm_source/medium/campaign and `ref` in memory, and the start form's consent writes them to localStorage; the results request carries them as `attribution`, parsed by `marketing/validation.ts` in the email route and stored on `public_results` (m0001). Funnel analytics: Vercel Web Analytics custom events (`landing_view`, `start`, `completion`, `email_sent`, `invite_click`) through `funnel()` in `marketing/funnel.ts`, with only locale, ref and target as properties. Open core requests are in `marketing/UPSTREAM-REQUESTS.md`.

Read `docs/AGENT-CHANGELOG.md` for recent significant changes and why they were made. Folder-level rules are in `marketing/CLAUDE.md`, `content/CLAUDE.md`, `lib/scoring/CLAUDE.md`, `db/CLAUDE.md` and `tests/CLAUDE.md`. They load when you work in those folders.

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
npm run core:fingerprint              # hash of the core shared with upstream; must equal ../inner-system-ifs-test (add -- --list per file)
# npm run core:golden:update          # upstream only: never run it in this repo
npm run dev
```

## Definition of done
1. Lint, typecheck and `npm test` are green, with scoring coverage at 100%.
2. If the change touches routes, components or copy: `npm run build && npm run e2e` (includes axe, 0 WCAG 2.1 AA violations).
3. If the change touches content, items, scoring or `config/app.ts`: run `npm run docs:kb` and commit the regenerated KB.
4. If EN copy changed, the ES/RO/TR files changed with it (drafts are fine) and keep the "DRAFT, pending human review" header.
5. Documentation is part of every change, not a follow-up. In the same commit:
   - Update this file (architecture, gotchas, never-do, locale checklist, Current Status).
   - Update the folder-level CLAUDE.md for the folders you touched.
   - Update `README.md` when setup, commands, env vars or the API change.
   - Update any `.claude/agents/*.md` whose instructions the change made stale.
6. `npm run -s core:fingerprint` still prints the same hash as in `../inner-system-ifs-test`. Core paths change here only by porting from upstream with the `core-sync` agent.
7. Significant changes get an entry in `docs/AGENT-CHANGELOG.md` (newest first; the criteria are at the top of that file). Record what changed and what the next agent must do differently.

## Hardware & Environment
- Node 24+, npm 11+. Deploys to Vercel, region fra1 (EU), through `vercel.ts`. Neon Postgres and Neon Auth (eu-central-1), Upstash Redis and Resend are all provisioned through the Vercel Marketplace. There is no local database; development uses the Neon dev branch.

## Key Dependencies & Gotchas
- `@vercel/analytics`: `<Analytics>` (in `marketing/components/MarketingAnalytics.tsx`) hydrates inside Suspense, after page effects. `track()` drops events until `window.va` exists, so always send events through `marketing/funnel.ts`, which creates the queue. Locally `next start` does not serve the script; e2e reads the queued events from `window.vaq`.
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
- `.env` comes from `.env.example`. `.env.local` holds the `marketing-dev` branch's connection strings and Neon Auth URL plus a new `NEON_AUTH_COOKIE_SECRET` (README step 3); `npx vercel env pull` is safe only once those are set in this repo's Vercel Development environment. Both are gitignored. Leaving `RESULTS_COPY_TO` empty disables the institute copy.

## Never Do
The core safety rules are in `CORE.md`, which both repositories share (imported below). Repo-specific rules:
- Never edit a core path (listed in `CORE.md`) in this repo. Write an upstream request instead (see "Relationship to upstream").
- Adding a locale requires: `config/app.ts` LOCALES and APP_NAME, `messages/<l>.json` (same key set as en), `content/*.<l>.ts` for items, typologies, exiles, patterns, exercise, support and level-two, `content/pdf-labels.ts`, `content/email-labels.ts`, `content/index.ts`, `LocaleSwitcher` NAMES, a migration widening the locale checks, and the forbidden-word list in the locales test.

## Relationship to upstream
This repo was cloned from the original app, `inner-system-ifs-test`, which is the git remote `upstream` and is checked out at `../inner-system-ifs-test`. Upstream is the source of truth for the core. `CORE.md` (imported below) is the contract; in short:
- The core paths listed in `CORE.md` (scoring, content, PDF, email, validation, db access, core migrations, core message keys and their tests) must stay byte-identical to upstream. Check with `npm run -s core:fingerprint` here and in `../inner-system-ifs-test`; both must print the same hash.
- Never edit a core path in this repo. If a feature needs a core change, stop and write it down as an upstream request (files, behaviour, tests). The change is made upstream and ported here with the `core-sync` agent.
- Marketing code and copy go in `marketing/`. Marketing UI strings go under the top-level `"marketing"` key in `messages/{en,es,ro,tr}.json`, in all four locales (ES/RO/TR as drafts). Marketing migrations are `db/migrations/m0NNN_*.sql`, which never touch core tables except to add marketing-only columns.
- Request fields only marketing needs (utm_*, ref, marketing consent) are parsed by a separate zod schema in `marketing/validation.ts` inside the routes. Never extend the core schemas in `lib/validation/`.
- Non-core app files (`app/`, `components/` except `components/results/sections.ts`, `lib/public-results/`, `lib/dashboard/`) may be edited here, but keep those edits to thin hooks that call into `marketing/`. Each such edit is a likely merge conflict when upstream changes the same file.
- All copy, ads and emails follow the safety rules in `CORE.md`: part language, no typing, no forbidden words, nothing promotional to people whose pattern is FLOODED, and no results or scores sent to ad platforms or email tools.
- Already true in the core, do not change: the person gets the email and PDF in their language; the institute copy is all English with its own English PDF; every PDF filename and header carries the person's name (`lib/pdf/filename.ts`).
- Database: development uses the Neon branch `marketing-dev`, created from the dev branch of the original Neon project (same schema, migration history, cohorts and admin). Never copy the original's `.env.local`, never link this repo to the original's Vercel project, and never run `npm run db:migrate` against any database except `marketing-dev`. `RESULTS_COPY_TO` is a test inbox in development and preview; Vercel Preview vars and the `CI_*` secrets point at `marketing-dev` or a CI branch made from it.
- Production plan: this repo is expected to replace the original as the live app on the production database. So `m0NNN` migrations are additive only: new nullable columns or new tables; never drop, rename or change core columns, constraints or policies. Only one live app may run against a database (each runs its own retention cron and rate limits); see "Going live" in `README.md`.
- If upstream is not checked out next to this repo, set `SIBLING_REPO` to its path, or write `Synced: pending` in the changelog entry with the reason.

@CORE.md

## Agents
Project subagents are in `.claude/agents/`:
- `ifs-copy-reviewer` (read-only): checks copy in every locale against the IFS guardrails, forbidden words and section order.
- `locale-sync`: carries an EN copy or key change into ES/RO/TR as drafts and keeps the locale tests green.
- `scoring-engineer`: changes thresholds, rules or items in the engine. Bumps the versions, keeps coverage at 100% and regenerates the KB. Scoring is core: in this repo use it only in `../inner-system-ifs-test`, never here.
- `data-privacy-auditor` (read-only): reviews diffs for PII logging, `withUser`/`asService` misuse, RLS gaps, missing zod validation or rate limits, and migration hygiene.
- `verify-gate`: runs the full definition-of-done gate and reports exact failures.
- `core-sync`: ports core-path commits from upstream into this repo and checks that the fingerprints match.

## Current Status
- Marketing (this repo): localised program invite with UTM tags and an optional live-session link (`marketing/config.ts`; the program URLs are placeholders until the institute supplies them, and no live session is configured). Cookieless funnel analytics (Vercel Web Analytics; custom events need a Pro plan and Web Analytics enabled on the project). Source attribution on opt-in public results. Not yet in the institute copy (upstream request 1 in `marketing/UPSTREAM-REQUESTS.md`). Public consent records `PUBLIC_POLICY_VERSION` (`2026-09-draft+m2026-10-draft`); the marketing privacy section is DRAFT pending the lawyer.
- Done: phases 1–7 (see `docs/PHASE-1-PLAN.md` for the original plan, which still describes Supabase; Neon replaced it).
  - Phase 2: scoring engine, item bank v2 and EN content.
  - Phase 3: public mode, the results PDF, the Resend flow and rate limiting.
  - Phase 4: ES, RO and TR drafts.
  - Phase 5: cohort mode on Neon with RLS, consent, history, notes, export and deletion.
  - Phase 6: facilitator and admin dashboards, CSV export and the audit log.
  - Phase 7: retention cron, Upstash, opt-in public result storage with a delete link, privacy placeholders, axe and Lighthouse checks, and CI.
- Since then: OG image; the "Meet this part" framing on the results page and in the PDF (reflection plus belief frame; steps behind `EXERCISE_STEPS_READY`); `docs/KNOWLEDGE-BASE.md` generated by `scripts/build-knowledge-base.ts`; translation review spreadsheets in `docs/translations/`; `docs/AGENT-CHANGELOG.md` records significant changes for agents; `CORE.md`, the core fingerprint and golden scoring fixtures keep this repo and upstream consistent.
- The results email goes to the person in their locale (`content/email-labels.ts`, via `getContent()`), with the PDF in that locale. The institute copy is entirely in English (body, subject and its own English PDF) and states the person's language.
- Known gaps:
  - Locally, `tests/e2e/cohort.spec.ts` fails at the sign-in code step: the Neon Auth OTP request does not answer within 5 s, so the button stays disabled. This also happens on code from before 2026-10-06 and is not yet investigated. CI skips this spec.
  - The lint warning in `scripts/build-knowledge-base.ts` (unused `ProtectorKey`) is still open.
- Open (outside code): the Upstash Marketplace terms must be accepted in the browser; Preview env vars need setting in the dashboard; the legal texts need a lawyer; the exercise steps and support resources are placeholders.
- The item bank and all content are DRAFT pending Anthony's clinical review. Translations are DRAFT pending native review.

## Future Integration
- Input: item responses `{ itemId: 1..5 }` + form + locale. Output: `Result` JSON, PDF, email. Cohort data lives in Neon Postgres.
