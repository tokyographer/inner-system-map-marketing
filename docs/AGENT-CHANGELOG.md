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

## 2026-10-09 [core]: review fixes, part 4: forbidden-word test covers every copy file
- Changed: ported upstream `12f77ea`. The forbidden-word and draft-header tests (`tests/unit/content/locales.test.ts`) also cover `content/legal/privacy.ts` (now with the standard "DRAFT, pending human review" header) and the new `content/whatsapp-template.ts` (the four WhatsApp template bodies, moved out of `docs/WHATSAPP.md`), and the header check covers exercise, support-resources and level-two in ES/RO/TR. `content/CLAUDE.md` matches upstream.
- Agents: user-facing copy must live where the locales test scans it (see `content/CLAUDE.md`); marketing strings belong under the `"marketing"` key in `messages/*.json`, which the test scans.
- Synced: inner-system-ifs-test@12f77ea (ported from upstream)

## 2026-10-09 [core]: review fixes, part 3: thresholds pinned, durations trustworthy
- Changed: ported upstream `5baf67b`. `tests/fixtures/core-golden.json` now has 25 cases, including a boundary case for every `SCORING` key (`scripts/update-core-golden.ts` taken as-is). The dead `pattern.quietSelfMax` is gone from `config/scoring.ts` (scoring behaviour unchanged, `SCORING_VERSION` unchanged) and the KB row for QUIET_OR_GUARDED no longer claims SELF < 3.5 (`scripts/build-knowledge-base.ts` got only that hunk, keeping this repo's own sections 9 and 10; `docs/KNOWLEDGE-BASE.md` regenerated here with `npm run docs:kb`). `durationSeconds` is required in the public request schemas; `cohortAttemptSchema` rejects `completedAt` more than a minute in the future and `startedAt` older than 30 days. `tests/unit/marketing/email-route.test.ts` now sends `durationSeconds`.
- Agents: do not reintroduce an optional duration; any marketing client or test posting results must send it. Cohort timestamp tests must use `Date.now()`-relative values. Never regenerate the golden fixture here.
- Synced: inner-system-ifs-test@5baf67b (ported from upstream)

## 2026-10-09 [marketing]: integration tests need ALLOW_DB_WRITES=1 (from upstream a168f0a)
- Changed: as upstream `a168f0a`, `tests/integration/rls.test.ts` and `public-results.test.ts` now also need `ALLOW_DB_WRITES=1`, and so do this repo's `marketing-attribution.test.ts` and `marketing-funnel-counts.test.ts` (both create users, partners or result rows). CI sets the variable when `CI_DATABASE_URL` exists.
- Agents: run `ALLOW_DB_WRITES=1 npm test` only with `.env.local` on `marketing-dev`. Any new integration test that writes gets the same gate.

## 2026-10-09 [core]: review fixes, part 2: landing and start copy match the public flow
- Changed: ported upstream `f43847e`. `landing.time` and `start.browser` now say that results are emailed as a PDF, a copy is kept 6 months and can be deleted from the email, and that answers are scored in the browser and sent only on completion. All four locales; ES/RO/TR are drafts. The `"marketing"` key is unchanged.
- Agents: when a flow changes, grep `messages/*.json` (including the `"marketing"` key) and `content/legal/privacy.ts` for promises about storage, sending and choice; the forbidden-word test does not catch a false promise.
- Synced: inner-system-ifs-test@f43847e (ported from upstream)

## 2026-10-09 [core]: review fixes, part 1: names, send limits, unverified numbers
- Changed: ported upstream `4f6ad49`. Core: `cleanDisplayName` (`lib/validation/name.ts`) runs inside `emailRequestSchema`/`pdfRequestSchema` (letters, marks, spaces, apostrophes, hyphens, 60 chars; the email schema rejects a name without letters), and `templateName` in `lib/whatsapp/send-results.ts` is an alias of it. Non-core, merged by hand: `lib/ratelimit.ts` and its test match upstream (`sharedLimiterConfigured()`, `clientKey` prefers `x-real-ip`/`x-vercel-forwarded-for` then the last `x-forwarded-for` entry, memory-bucket pruning). The email route keeps marketing's attribution parsing and storage, the live-session footer and the attribution lines in `instituteDetails`, and adds upstream's per-recipient (3 per address per day, hashed key) and overall (60 per hour) email limits right after validation, the WhatsApp send before the email with the `sharedLimiterConfigured()` gate and the `wa:all` 100-per-day cap, the `WhatsApp:` institute line only when `whatsappSent`, and `recordWhatsApp` after the send (errors logged, not raised). `StoreArgs` loses `whatsapp`; `storePublicResult` keeps this repo's insert (no `name`). `.env.example` lists the Upstash variables. `tests/unit/marketing/email-route.test.ts` uses a fresh address per request because of the recipient limit.
- Agents: never print a name that did not pass the schema. Do not add a send path (email, WhatsApp, marketing emails, anything with the institute's name on it) without a per-recipient limit. Marketing code still never reads the WhatsApp number.
- Synced: inner-system-ifs-test@4f6ad49 (ported from upstream)

## 2026-10-09 [core]: admin WhatsApp inbox core helpers and migration 0011 (stage 2, switched off)
- Changed: ported the core paths of upstream `1269002`. New core: `lib/whatsapp/webhook.ts`, `lib/whatsapp/reply.ts`, `tests/unit/whatsapp/webhook.test.ts`, migration `0011_whatsapp_messages.sql` (`whatsapp_conversations`, `whatsapp_messages`, admin-only RLS, `app.run_whatsapp_retention()`), `WHATSAPP_INBOX_READY` (off) and `WHATSAPP_RETENTION_MONTHS` in `config/app.ts`, the inbox paragraph in the privacy notice, `whatsappReplySchema`/`whatsappConversationIdSchema`, `graphError` exported, the `dashboard.whatsapp*` strings and a `CORE.md` inbox safety rule. Not ported (upstream-only, non-core): the webhook route, `/admin/whatsapp`, `lib/whatsapp-inbox/`, `lib/dashboard/whatsapp.ts`, `lib/actions/whatsapp.ts`, the inbox components and tests, the `WHATSAPP_APP_SECRET`/`WHATSAPP_VERIFY_TOKEN` env vars, and the cron's `runWhatsAppRetention` call (this repo's cron keeps its funnel pruning only).
- Agents: the inbox runs upstream only; nothing here writes or reads the inbox tables, and marketing code never may. `WHATSAPP_INBOX_READY` is core: it changes only upstream. Run `npm run db:migrate` for 0011 on `marketing-dev` only, never production.
- Synced: inner-system-ifs-test@1269002 (ported from upstream)

## 2026-10-09 [core]: WhatsApp delivery of the results PDF (stage 1, switched off)
- Changed: ported upstream `f14affd`. Public mode can also send the results PDF to WhatsApp once `WHATSAPP_RESULTS_READY` in `config/app.ts` is on (it is off: nothing is shown, sent or stored). Core: `lib/whatsapp/send-results.ts`, `lib/validation/whatsapp.ts` (E.164), `emailRequestSchema` accepts `whatsapp` and requires `consent.whatsapp` with it, `Contact.whatsapp`, migration `0010_public_results_whatsapp.sql` (`public_results.whatsapp`), the conditional privacy text, `CONSENT_POLICY_VERSION` changing with the flag (so `PUBLIC_POLICY_VERSION` follows), the new `start.whatsapp*`/`results.whatsapp*` strings, and `CORE.md`'s WhatsApp safety rule; `lib/whatsapp/` and `tests/unit/whatsapp/` are new core paths (also in `scripts/core-fingerprint.mjs`). Non-core files merged by hand with marketing's hooks kept: the email route still parses attribution, stores it and passes the live-session footer; it also applies the server-side flag check, the per-recipient limit (`recipientKey`, 2 per 24 h), returns `whatsappSent`, and appends the `WhatsApp:` line after the attribution lines in `instituteDetails`. `StartScreen` keeps `PUBLIC_POLICY_VERSION`, `commitAttribution()` and `funnel("start")`; `AutoEmailStatus` keeps `attributionRequestFields()` and `funnel("email_sent")`. `storePublicResult` stores `whatsapp` only when given, and still does not write `name` here (as before this port).
- Agents: no marketing code (attribution, funnel, analytics, nurture, ads) may read or forward the WhatsApp number; it exists only to deliver the PDF. Run `npm run db:migrate` on `marketing-dev` for 0009 and 0010, never against production. Switch the flag on only upstream, by the README steps.
- Synced: inner-system-ifs-test@f14affd (ported from upstream)

## 2026-10-09 [core]: landing button "Start Test", admin-results core, LOCALE_NAMES, privacy text (a57fd14, d1a62f9, 92b40ca, 11eea18)
- Changed: ported the core paths of upstream `38cd1f9`, `a7ea83c`, `9ea31f0` and `e95eec0` (`e738e7c` has no core paths). `landing.begin` is "Start Test" (ES "Comenzar el test", RO "Începe testul", TR "Teste başla"). New core migration `0009_admin_results.sql` (`public_results.name` and the admin-only `app.admin_results()`), `resultsFilterSchema`/`resultRefSchema`/`pdfLocaleSchema` in `lib/validation/admin.ts`, `LOCALE_NAMES` and `isLocale()` in `config/app.ts`, the upstream `dashboard.*` strings, and the privacy notice saying the stored public copy includes name and email and is visible only to admins. The `"marketing"` messages key is unchanged. `tests/e2e/public.spec.ts`, `locales.spec.ts` and the marketing-only `marketing.spec.ts` click "Start Test".
- Not ported (non-core): upstream's admin "All results" pages, its export and PDF routes, `lib/dashboard/results.ts`, the `storePublicResult` change that writes `name`, and the `LocaleSwitcher` switch to `LOCALE_NAMES`. This repo therefore has the 0009 function and the `dashboard.*` strings but no page that uses them, and it does not store the name yet even though the privacy text now mentions it. Bring those files over from upstream if this repo should have the page.
- Agents: run `npm run db:migrate` on `marketing-dev` for 0009 (m0001 also alters `public_results`; they are compatible). Never against production. e2e tests find the landing link by its text, so change the specs with `landing.begin`.
- Synced: inner-system-ifs-test@38cd1f9, a7ea83c, 9ea31f0, e95eec0 (ported from upstream)

## 2026-10-07 [core]: results email errors never carry the provider's message
- Changed: `lib/email/send-results.ts` throws `Email to participant failed (<name>)` / `Copy to institute failed (<name>)` with Resend's error name only (a lowercase code such as `validation_error`, else `unknown`), never Resend's `message`, which may echo the recipient address. The email route logs `err.message` as the reason, so before this an address could reach the logs. Requested by the marketing repo (upstream request 3, found by data-privacy-auditor).
- Agents: never put a provider's free-text error message into a thrown error or a log line; use a fixed message plus a validated code.
- Synced: inner-system-ifs-test@6b1ba87 (ported from upstream)

## 2026-10-06 [marketing]: milestone messages and a halfway event in the public questionnaire
- Changed: `marketing/components/QuestionnaireMilestones.tsx`, rendered by `components/questionnaire/Questionnaire.tsx` in public mode only, shows a short encouragement for 3 statements from about a third and two thirds of the form (`marketing.milestones.*`, all four locales) and sends one `halfway` funnel event when the person moves forward into the middle statement. `FUNNEL_EVENTS` and the privacy section list it. The questionnaire length (63, core) is unchanged.
- Agents: the decision to keep 63 statements and measure is recorded in `marketing/CLAUDE.md` ("Length of the questionnaire"). A shorter form is an upstream core change with clinical review, never a marketing change.

## 2026-10-06 [marketing]: attribution in the institute copy, live-session line in the email
- Changed: the email route passes `instituteDetails` (Source, Medium, Campaign; Partner only when `saveResultAttribution` confirms the code is registered, so never without a database) and `personFooter` (`marketing.email.liveSession` with the tagged URL, only when `LIVE_SESSION_URL[locale]` is set and `consent.newsletter` is true, built before anything is stored) to the core `sendResultsEmail` from upstream `f2021d9`. Helpers in `marketing/email.ts`. `saveResultAttribution` now returns `{ saved, registeredRef }`. The privacy section now says the source goes into the institute copy and that the delete link does not remove that inbox copy. `marketing/UPSTREAM-REQUESTS.md` has one new request (3: do not log Resend's error text).
- Agents: the core drops `personFooter` for FLOODED; keep it that way, and never add a promotional line to the person's email any other way. Institute details stay English.

## 2026-10-06 [core]: optional institute details and person footer in the results email
- Changed: `SendResultsArgs` has two optional fields, requested by the marketing repo. `instituteDetails` appends sanitised "Label: value" lines to the institute copy after the Pattern line (and the FLOODED note): line breaks become spaces, each part is trimmed and capped at 120 characters, and empty entries are dropped. `personFooter` appends one paragraph to the person's email after the retention/delete line, separated by a blank line: `\r` is stripped, the text is trimmed and capped at 500 characters, and it is dropped whenever `flooded` is true. Upstream passes neither, so both bodies are byte-identical to before. A vitest snapshot (`tests/unit/email/__snapshots__/send-results.test.ts.snap`) pins the default bodies.
- Agents: `instituteDetails` must be English and must never carry scores or responses beyond what the institute copy already shows. `personFooter` must be in the person's locale. Do not move the FLOODED check to callers: the email module enforces it. If you deliberately change email copy, update the snapshot with `npx vitest run -u tests/unit/email` and check the diff.
- Synced: inner-system-ifs-test@f2021d9 (ported from upstream)

## 2026-10-06 [marketing]: fixes from a whole-branch review
- Changed: the funnel counter allows 60 of each event per client per hour, after a coarse 300-per-hour limit, so a group taking the map on one network is counted. Removing a partner folds its counts into `'-'` (new `m0003_funnel_admin_writes.sql` gives admins write policies on the counts for this; m0002 is unchanged), so a later partner with the same code does not inherit them. `parseEmailMarketingFields` drops invalid attribution fields one by one instead of all of them. `next.config.ts` sends `Referrer-Policy: strict-origin` on every route (the layout also sets the meta tag), so a `?ref=` landing URL or a dashboard URL is never sent on as a referrer. The Neon integration tests now create real admin and participant users and test the admin path; the attribution test cleans up its partner.
- Agents: run `npm run db:migrate` on `marketing-dev` for m0003. Never edit a committed migration; add the next `m0NNN` file.

## 2026-10-06 [marketing]: partner code kept out of analytics
- Changed: funnel events no longer carry `ref`, and page-view URLs keep only validated utm parameters. Visitors can type any code into a URL, and only registered codes are counted, in `marketing_funnel_counts` (follow-up from data-privacy-auditor). The privacy section says so in all four locales.
- Agents: never send the partner code to Vercel Analytics. Per-partner numbers come from `/admin/partners`.

## 2026-10-06 [marketing]: upstream requests and postponed items
- Changed: `marketing/UPSTREAM-REQUESTS.md` holds two core requests for upstream: (1) `instituteDetails` lines in the institute copy, for attribution; (2) an optional `personFooter` in the person's results email, dropped by the core when FLOODED, for the live-session invite line. It also records that the nurture-consent checkbox and the opt-in sync, postponed by the owner, need no core change.
- Agents: when upstream ships a request, port it with `core-sync`, wire the marketing side (named in each request), and remove the entry. Do not build the nurture consent or the opt-in sync until the owner says so and the lawyer has approved the consent wording.

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
