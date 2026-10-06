# Agent changelog

A record of significant changes for AI coding agents and new developers. It focuses on what changed in the codebase's shape, rules or behaviour, and what that means for the next change. Git history has the detail; this file has the consequences.

**Add an entry** (newest first) whenever a change:
- adds, removes or moves a module, route, table, env var, locale or content file;
- changes a convention, invariant, gotcha or "never do" rule;
- changes behaviour a user, facilitator or the institute can notice (scoring, emails, PDF, consent, retention);
- fixes a bug whose cause could recur.

Tag each entry `[core]` when it touches a path listed in `CORE.md`, otherwise `[marketing]` (in the marketing repo) or `[app]` (upstream-only, non-core). Entries below the split entry were inherited from upstream. A `[core]` entry has a `Synced:` line with the commit that carried it to the other repo, or `pending` plus the reason. The `core-sync` agent reads these lines to find what still needs porting.

Skip typo fixes, single-item rewording and pure refactors that keep behaviour. Carry any new rule into `CLAUDE.md` (root or folder-level) in the same commit; this file explains it, CLAUDE.md enforces it.

Entry format:
```
## YYYY-MM-DD [core|app|marketing]: short title (commit, when the entry lands after the change; omit it when the entry is in the same commit)
- Changed: what is different now.
- Agents: what to do or avoid because of it. Name the files.
- Synced: <other repo commit> | pending (<reason>)   ← [core] entries only
```

---

## 2026-10-06 [marketing]: Share the map
- Changed: `marketing/components/ShareTheMap.tsx` on the public results page shares `/{locale}?utm_source=share` through the Web Share API, or copies it to the clipboard, or shows it to copy by hand. It is rendered by `ResultsView` inside the `actions` render, for public mode and not when FLOODED. Strings under `marketing.share` in all four locales.
- Agents: sharing never carries anything from the attempt (no pattern, score, name or result), and results themselves are never shareable. Do not add a results section for marketing: `components/results/sections.ts` is core, so new marketing UI goes inside an existing section's render in `ResultsView.tsx`.

## 2026-10-06 [marketing]: partner links and per-code counts
- Changed: admins register partner codes at `/{locale}/admin/partners` (`requireRole(["admin"])`, linked from `/admin/cohorts`), which lists each partner's `/{locale}?ref=CODE` links and the starts and completions per code for the last 30 days and all time. Public starts and completions POST to `app/api/marketing/funnel/route.ts` (zod, 10 per client per hour), which increments `marketing_funnel_counts`. `db/migrations/m0002_funnel_counts.sql` adds that table and `marketing_partners`, both with admin-only RLS. Unregistered codes are counted under `'-'`, and `public_results.ref_code` keeps only registered codes (found by data-privacy-auditor: an open counter let anyone add rows and store strings such as names). Admins can remove a partner and its name. The retention cron prunes count rows older than 400 days, in its own error handler. The privacy section says these counts exist.
- Agents: the counter holds aggregates only: never add a user id, email, IP, pattern or score to it, and never count an unregistered code on its own row. The counts are untrusted (any browser can post them). Run `npm run db:migrate` on `marketing-dev` for m0002. The admin read path was checked on a local Postgres (admin sees rows, participant sees none, only admins can register); the Neon integration test covers writes, pruning and non-admin denial.

## 2026-10-06 [marketing]: localised program invite and live-session link
- Changed: `components/results/ProgramInvite.tsx` links to `PROGRAM_URL[locale]` with UTM tags (`marketing/links.ts`) and, when `LIVE_SESSION_URL[locale]` is set, to the next "Reading your map" live session (strings under `marketing.invite`, all four locales). Both URLs live in `marketing/config.ts`; the program URLs are placeholders (the homepage) and no live session is set yet. Each link click sends `invite_click` with `target`. `ResultsView` still hides the invite for FLOODED and cohort results; an e2e test now checks the FLOODED case.
- Agents: change the URLs only in `marketing/config.ts`. `ProgramInvite.tsx` differs from upstream now: if upstream changes it, merge by hand and keep the links from `links.ts`.

## 2026-10-06 [marketing]: database plan: marketing-dev branch, production takeover
- Changed: development uses the Neon branch `marketing-dev`, created from the dev branch of the original Neon project (not a new Neon project, and no Neon from the Vercel Marketplace on this repo's project). `README.md` has the console and terminal steps and a "Going live" checklist: this repo replaces the original as the live app on the production database, and the original's production deployment is retired so only one app runs (each runs its own retention cron and rate limits). Root, `marketing/` and `db/` CLAUDE.md files carry the rules. `m0001_attribution.sql` was checked against the additive-only rule: it adds four nullable columns, each with a check on the new column only, and changes nothing existing.
- Agents: `m0NNN` migrations are additive only (new nullable columns or new tables). Never copy the original's `.env.local`, never link the original's Vercel project, never run `npm run db:migrate` against anything but `marketing-dev`. `RESULTS_COPY_TO` is a test inbox outside Production.

## 2026-10-06 [marketing]: cookieless funnel analytics
- Changed: `@vercel/analytics` is a dependency. `marketing/components/MarketingAnalytics.tsx` in the locale layout records page views with URLs stripped to the path plus utm/ref. Five custom events go through `funnel()` (`marketing/funnel.ts`): `landing_view` (landing page), `start` (public start form), `completion` (public questionnaire), `email_sent` (results emailed) and `invite_click` (program invite). Properties are only `locale`, `ref` and `target`, enforced by `eventProps()`. Page views and events are sent only for the public pages, with URLs reduced to the path plus validated utm/ref (`analyticsBeforeSend`). The privacy page's marketing section describes it, including referrer, country/device data and Vercel's 24-hour visitor identifier.
- Agents: send events only through `funnel()`. It creates the `window.va` queue, which `<Analytics>` sets up too late for page effects (found by the e2e: `landing_view` was dropped), and it queues `beforeSend` first so an early event is never sent with a raw URL (found by data-privacy-auditor). Never add a property beyond locale, ref and target, and never send anything derived from results. e2e checks the queued events in `window.vaq`.

## 2026-10-06 [marketing]: happy-path e2e pinned to a seed
- Changed: `tests/e2e/public.spec.ts` answered by position over a randomly seeded item order, so about 4 runs in 10 reached FLOODED and failed on the placeholder support resources. It now pins seed 4075905763 (MANAGED) after Start. The flake exists upstream too; the same fix is suggested there (the file is not core).
- Agents: an e2e walk that answers by position must pin the seed, or seed a finished attempt in sessionStorage.

## 2026-10-06 [marketing]: source attribution on public results
- Changed: `marketing/attribution.ts` reads utm_source, utm_medium, utm_campaign and `ref` (slug values only) from any page of the locale layout (`AttributionCapture`) into memory, last touch wins; submitting the start form writes them to localStorage for 30 days. The privacy page has a marketing section (DRAFT, pending legal review), and public consent records `PUBLIC_POLICY_VERSION` = core version + `MARKETING_POLICY_VERSION`. The results request (`AutoEmailStatus`, `EmailResultsForm`) sends them as `attribution`. The email route parses it with `marketing/validation.ts` next to the core schema, and `saveResultAttribution` stores it on the opt-in `public_results` row (new nullable columns from `db/migrations/m0001_attribution.sql`). Invalid attribution is dropped; it never fails the email.
- Agents: the institute copy does not show attribution yet, because `lib/email` is core: see request 1 in `marketing/UPSTREAM-REQUESTS.md`. Run `npm run db:migrate` on this repo's Neon branch to add the columns. Never add attribution to `lib/validation/` schemas. Never write marketing data to the device before the start-form consent. A new marketing data use needs a paragraph in `marketing.privacy` and a `MARKETING_POLICY_VERSION` bump.

## 2026-10-06 [marketing]: split from upstream
- Changed: this repo, `inner-system-map-marketing`, was cloned from the original app `inner-system-ifs-test` at upstream commit `7666ed6` (`git rev-parse --short upstream/main`). The git remote `upstream` points at the original, checked out at `../inner-system-ifs-test`. Both core fingerprints were `e01b8a30d46e…` (86 files) at the split. The root `CLAUDE.md` is renamed "Inner System Map: marketing" and has a "Relationship to upstream" section; `marketing/CLAUDE.md` holds the marketing plan's guardrails; the agents now treat upstream as the sibling and scoring as upstream-only.
- Agents: never edit a core path here. Write an upstream request (files, behaviour, tests) and port the upstream commit with `core-sync`. Marketing code goes in `marketing/`, marketing strings under the `"marketing"` key of `messages/*.json`, marketing migrations in `db/migrations/m0NNN_*.sql`. Entries in this repo are tagged `[marketing]`, or `[core]` for a port from upstream.

## 2026-10-06 [core]: person's name in every results PDF and filename
- Changed: `lib/pdf/filename.ts` (`resultsPdfFilename`, `slugify`) names PDFs `<app-name>-results-<name>.pdf` as an ASCII slug. It is used by the person's email (app name in their locale), the institute copy (English app name), the download route's Content-Disposition and the Download button. `emailRequestSchema` now requires `name`. `EmailResultsForm` (shown when no contact is saved) has a name field and reuses `start.contactRequired` for its error. The unused `email.errorInvalid` key was removed from all locales.
- Agents: never build a results PDF filename by hand; call `resultsPdfFilename`. Non-Latin names slug to nothing and fall back to the plain filename. The name is still printed inside the PDF header.
- Synced: n/a (marketing repo not cloned yet; the clone will include this commit)

## 2026-10-06 [core]: institute copy fully in English
- Changed: the institute copy now attaches its own English PDF (`institutePdf`, rendered in English by `app/api/public/email-results/route.ts` when the person used another locale), named `inner-system-map-results.pdf`. The person still gets the email and PDF in their locale. `sendResultsEmail` throws before sending anything if a copy is configured, the locale is not `en`, and no English PDF was passed.
- Agents: anything sent to the institute is English. Anything sent to the person is in their locale. A new caller of `sendResultsEmail` must pass `institutePdf` for non-English locales.
- Synced: n/a (marketing repo not cloned yet; the clone will include this commit)

## 2026-10-06 [core]: core contract with the marketing repo
- Changed: added `CORE.md` (core paths, sync rules, shared safety rules, imported into `CLAUDE.md` with `@CORE.md`), `npm run core:fingerprint` (`scripts/core-fingerprint.mjs`), golden scoring results (`tests/fixtures/core-golden.json`, `tests/unit/scoring/golden.test.ts`, `npm run core:golden:update`), the `core-sync` agent, and `[core]/[app]/[marketing]` tags plus `Synced:` lines in this file.
- Agents: before changing a path listed in `CORE.md`, expect to port it to `../inner-system-map-marketing` with `core-sync`. Keep marketing work out of core paths. Never regenerate the golden fixture to make a test pass unless the scoring change is deliberate and made upstream.
- Synced: n/a (the marketing repo will be cloned after this commit)

## 2026-10-02 [core]: agent changelog and documentation rule
- Changed: added this file. The root `CLAUDE.md` definition of done now requires a changelog entry and doc updates for significant changes.
- Agents: before finishing a task, update `CLAUDE.md` (status, gotchas, never-do, locale checklist), the relevant folder `CLAUDE.md`, the agents in `.claude/agents/` if their instructions went stale, and this file.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-10-02 [core]: CI builds without auth env (ea58635)
- Changed: `app/api/auth/[...path]/route.ts` creates the Neon Auth handlers on first request. CI had failed at `next build` on every run since Phase 7, because the module threw on a missing `NEON_AUTH_BASE_URL` at import.
- Agents: never read env or create clients at module top level in routes or pages. Reproduce CI locally by moving `.env.local` aside and running `npm run build && npm run e2e`.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-10-02 [core]: results email in the person's locale (f90cd95)
- Changed: the participant email uses `content/email-labels.ts` through `getContent(locale).email`, plus the localised care note. The institute copy stays in English and includes `Language: <locale>`. No file imports `content/*.en.ts` directly any more.
- Agents: new email copy goes in `email-labels.ts` for all four locales, with `{placeholder}` templates filled by `fillTemplate`. A test fails on any unfilled placeholder. Adding a locale now includes `email-labels.ts`.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-10-02 [core]: CLAUDE.md refresh and project subagents (c43fb31, 524a607)
- Changed: rewrote the root `CLAUDE.md` and added folder-level `content/`, `lib/scoring/`, `db/` and `tests/` CLAUDE.md files. Added `.claude/agents/`: ifs-copy-reviewer, locale-sync, scoring-engineer, data-privacy-auditor, verify-gate.
- Agents: delegate copy review, locale propagation, scoring changes, privacy review and the pre-commit gate to these agents.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-30 [core]: knowledge base and Meet this part in the PDF (f43dff6, 1ec72d6)
- Changed: `npm run docs:kb` generates `docs/KNOWLEDGE-BASE.md` from live content and scoring config. The PDF includes the Meet this part reflection and belief frame.
- Agents: regenerate the KB after any content, item, scoring or `config/app.ts` change. Commit it only if more than the "Generated" date changed.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: Meet this part steps behind a flag (8a5c12c)
- Changed: the five S.W.C.I.R. steps are hidden on the page and in the PDF while `EXERCISE_STEPS_READY` (`config/app.ts`) is false.
- Agents: flip the flag only after all four `content/exercise.*.ts` files hold the school's real steps.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: Phase 7, operations (bbee7fc)
- Changed: nightly retention cron (`vercel.ts`, `CRON_SECRET`), Upstash rate limiting with an in-memory fallback, opt-in `public_results` with a hashed delete token, privacy pages, and GitHub Actions CI.
- Agents: `rateLimit()` is async. New personal-data tables must be covered by `app.run_retention()` and `app.delete_my_data()`.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: Phase 6, dashboards (33d0140)
- Changed: `/facilitator` and `/admin` with CSV exports and an audit log. Email lookups are role-guarded SQL functions (migrations 0006–0008).
- Agents: gate pages with `requireRole()`, run queries through `withUser()`, and call `app.log_access` on every profile view or export.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: name and email at start, automatic email (53216c0)
- Changed: public mode collects name, email and consent on the start screen. `AutoEmailStatus` sends the results once per attempt.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: Turkish locale, Jost in the PDF (e28742d, f242084)
- Changed: added `tr`, and the PDF embeds Jost from `lib/pdf/fonts/` because Helvetica lacks Turkish and Romanian glyphs.
- Agents: follow the locale checklist in the root `CLAUDE.md`. Check the PDF visually with Preview or pdftoppm, not `sips`.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: Supabase replaced by Neon + Neon Auth (6011072 → f25313a)
- Changed: cohort mode runs on Neon Postgres (Frankfurt) with Neon Auth through the Vercel Marketplace. RLS runs as role `app_user` with `app.user_id` set by `withUser()`.
- Agents: `docs/PHASE-1-PLAN.md` still describes Supabase, so trust the code. Migrations are append-only, and PUBLIC execute must be revoked explicitly (0004).
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-29 [core]: design system, ES/RO drafts, fra1 (d3dc6b0, 30723d8, cf4fd62)
- Changed: Transcendent Institute tokens in `app/globals.css`; ES/RO drafts with "DRAFT, pending human review" headers; functions pinned to fra1.
- Agents: no gold text, no red, no #FFFFFF surfaces. Keep the DRAFT headers on translated files.
- Synced: n/a (before the split; the marketing repo is cloned with this history)

## 2026-09-18 [core]: scoring engine and public mode (403e9b2, a55f6b5)
- Changed: pure `lib/scoring`, item bank v2, EN content, PDF, Resend and the public flow.
- Agents: scoring coverage stays at 100%. All thresholds live in `config/scoring.ts`.
- Synced: n/a (before the split; the marketing repo is cloned with this history)
