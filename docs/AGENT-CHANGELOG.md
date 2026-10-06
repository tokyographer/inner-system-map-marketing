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
