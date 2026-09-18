# Inner System Map — Phase 1: Plan, file tree, data model, RLS design

Status: awaiting Anthony's approval. No application code written yet.
Date: 2026-09-18

---

## 1. Dependency versions (checked against npm registry today)

| Package | Version | Note |
|---|---|---|
| next | 16.3.5 | App Router, Node runtime (Fluid Compute), region fra1 |
| react / react-dom | 19.3.0 | |
| typescript | 7.0.2 | |
| tailwindcss | 4.3.3 | v4 CSS-first config; palette as CSS variables |
| next-intl | 4.14.5 | locale routing /en /es /ro |
| @supabase/supabase-js | 2.116.0 | |
| @supabase/ssr | 0.12.7 | cookie-based auth in Server Components / Route Handlers |
| supabase (CLI) | 2.117.0 | migrations, local stack, RLS tests |
| zod | 4.6.5 | |
| vitest | 5.0.1 | scoring engine 100% coverage target |
| @playwright/test | 1.63.0 | one happy path per mode |
| resend | 6.28.1 | transactional email (EU sending domain) |
| @react-pdf/renderer | 4.9.0 | server-side PDF of results |
| @upstash/ratelimit + @upstash/redis | 2.1.0 / 1.38.4 | rate limiting on public endpoints (see assumption A4) |

shadcn/ui is installed via CLI at Phase 3, only the primitives needed (button, dialog, checkbox, progress, radio-group, sheet).

---

## 2. Implementation plan by phase

| Phase | Deliverable | Stop-for-review artefact |
|---|---|---|
| 1 | This document | Approval of plan, tree, data model, RLS |
| 2 | `content/items.v2.ts`, `content/typologies.en.ts`, `content/exiles.en.ts`, `lib/scoring/*` pure functions, Vitest suite covering every rule and boundary in section 7 | Test report + item bank file for clinical review |
| 3 | Public mode EN: landing, age gate + disclaimer, instructions, questionnaire (randomised order with constraints, seed stored, localStorage autosave), results page (all 12 sections in the specified order), PDF download, retake. Design system (tokens, fonts, palette). Results-order test (exiles never before protectors, no exile exercise) | Running app on localhost, Lighthouse a11y report |
| 4 | ES and RO drafts: items, typologies, exiles, UI messages, privacy/consent placeholders. Locale switcher. | Translation files marked "DRAFT, pending human review" |
| 5 | Supabase: migrations, RLS, magic-link auth, cohort access code flow, consent logging, attempts storage (raw responses + scores + flags), participant area (history, export JSON/PDF, delete with cascade), private notes | Migration files, local Supabase running, participant e2e |
| 6 | Facilitator dashboard: cohort list, participant view, aggregates (hidden < 5), CSV exports (pseudonymised / identified admin-only), audit log, RLS tests (pgTAP + supabase-js) | RLS test report |
| 7 | Email results flow (Resend), rate limiting, retention cron (Vercel Cron on Node runtime), accessibility pass, Playwright e2e both modes, README deployment guide, sub-processor list | Deploy preview on Vercel |

---

## 3. File tree (target state after Phase 7)

```
inner-system-map/
├── CLAUDE.md                       # agent context: architecture, run order, never-do rules
├── README.md                       # macOS setup, Supabase, Vercel, git workflow, sub-processors
├── .env.example
├── .gitignore
├── .gitleaks.toml
├── package.json
├── next.config.ts
├── vercel.ts                       # region fra1, crons
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── postcss.config.mjs
├── middleware.ts                   # next-intl locale routing + Supabase session refresh
│
├── config/
│   ├── app.ts                      # APP_NAME per locale, SHORT_FORM defaults per mode, retention defaults
│   └── scoring.ts                  # every threshold from section 7 in one object
│
├── content/                        # editable without touching logic
│   ├── items.v2.ts                 # item bank, stable IDs, shortForm flag, "proposed" markers
│   ├── items.v2.es.ts / items.v2.ro.ts
│   ├── typologies.en.ts / .es.ts / .ro.ts
│   ├── exiles.en.ts / .es.ts / .ro.ts
│   ├── patterns.en.ts / .es.ts / .ro.ts       # copy for 6 patterns + 2 modifiers
│   ├── exercise.en.ts / .es.ts / .ro.ts       # S.W.C.I.R. placeholders
│   ├── support-resources.en.ts / .es.ts / .ro.ts   # FLOODED resources, placeholders
│   ├── legal/
│   │   ├── privacy.en.md / .es.md / .ro.md    # PLACEHOLDER, requires legal review
│   │   └── consent.en.md / .es.md / .ro.md
│   └── pairings.ts                 # protector → exile map (section 7)
│
├── messages/                       # next-intl UI strings
│   ├── en.json
│   ├── es.json
│   └── ro.json
│
├── lib/
│   ├── scoring/
│   │   ├── index.ts                # score(responses, form, bankVersion) → Result
│   │   ├── scales.ts               # means, display 0-100, bands
│   │   ├── groups.ts               # managerLead, firefighterLead, exileLead, protectionLoad
│   │   ├── pattern.ts              # SELF_LED … QUIET_OR_GUARDED + modifiers
│   │   ├── ranking.ts              # leading protector / team rule, tie-break
│   │   ├── pairings.ts
│   │   ├── flags.ts                # quality flags, care flag
│   │   └── types.ts
│   ├── questionnaire/
│   │   ├── order.ts                # seeded shuffle with adjacency + exile-density constraints
│   │   ├── seed.ts
│   │   └── autosave.ts             # localStorage
│   ├── supabase/
│   │   ├── client.ts / server.ts / admin.ts
│   │   └── types.ts                # generated DB types
│   ├── pdf/results-document.tsx
│   ├── email/results-email.tsx
│   ├── ratelimit.ts
│   ├── audit.ts
│   └── validation/                 # zod schemas for every action and route
│
├── app/
│   ├── layout.tsx
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                            # public landing
│   │   ├── start/page.tsx                      # age gate, disclaimer, instructions
│   │   ├── questionnaire/page.tsx
│   │   ├── results/page.tsx                    # public: reads browser state
│   │   ├── privacy/page.tsx
│   │   ├── cohort/
│   │   │   ├── join/page.tsx                   # access code → magic link
│   │   │   ├── consent/page.tsx
│   │   │   ├── page.tsx                        # participant home, history
│   │   │   ├── questionnaire/page.tsx
│   │   │   ├── results/[attemptId]/page.tsx
│   │   │   └── settings/page.tsx               # export, delete
│   │   ├── facilitator/
│   │   │   ├── page.tsx                        # my cohorts
│   │   │   ├── cohorts/[cohortId]/page.tsx
│   │   │   └── cohorts/[cohortId]/participants/[participantId]/page.tsx
│   │   └── admin/
│   │       ├── cohorts/page.tsx
│   │       └── cohorts/new/page.tsx
│   ├── auth/callback/route.ts
│   └── api/
│       ├── health/route.ts
│       ├── public/email-results/route.ts       # rate limited
│       ├── cohort/validate-code/route.ts       # rate limited
│       ├── export/csv/route.ts
│       └── cron/retention/route.ts             # CRON_SECRET protected
│
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── questionnaire/  LikertItem.tsx  ProgressBar.tsx  ItemScreen.tsx
│   ├── results/        WhoIsLeading.tsx  SystemDiagram.tsx  SelfPanel.tsx
│   │                   ProtectorBars.tsx  ProtectorCard.tsx  ExilesSection.tsx
│   │                   MeetThisPart.tsx  CareNote.tsx  LevelTwoPanel.tsx  ProgramInvite.tsx
│   ├── facilitator/    CohortTable.tsx  ParticipantProfile.tsx  AggregatePanel.tsx
│   └── shared/         LocaleSwitcher.tsx  ConsentCheckbox.tsx
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_schema.sql
│   │   ├── 0002_rls.sql
│   │   ├── 0003_functions.sql              # role helpers, deletion cascade, retention
│   │   └── 0004_audit.sql
│   ├── seed.sql                            # dev only: one admin, one cohort
│   └── tests/                              # pgTAP RLS tests
│       ├── rls_facilitator.sql
│       └── rls_participant.sql
│
├── tests/
│   ├── unit/scoring/*.test.ts
│   ├── unit/questionnaire/order.test.ts
│   ├── unit/content/results-order.test.ts  # exiles never before protectors, no exile exercise
│   └── e2e/public.spec.ts  cohort.spec.ts
│
└── docs/
    ├── PHASE-1-PLAN.md                     # this file
    └── DATA-MODEL.md
```

---

## 4. Data model (Supabase Postgres, EU region)

All tables in schema `public`, RLS enabled on every table. `auth.users` is Supabase's.

```
profiles
  id              uuid PK = auth.users.id
  display_name    text
  role            enum('admin','facilitator','participant')  default 'participant'
  locale          text
  created_at      timestamptz
  -- email stays in auth.users only; never duplicated here

cohorts
  id              uuid PK
  name            text
  level           text                 -- e.g. 'II'
  language        text
  starts_on       date
  ends_on         date
  access_code_hash text                -- sha256 of code; plain code never stored
  access_code_expires_at timestamptz
  retention_months int default 12
  created_by      uuid → profiles
  created_at      timestamptz

cohort_facilitators
  cohort_id       uuid → cohorts   (cascade)
  user_id         uuid → profiles  (cascade)
  PK (cohort_id, user_id)

cohort_members
  cohort_id       uuid → cohorts   (cascade)
  user_id         uuid → profiles  (cascade)
  pseudonym       text unique      -- random, for CSV export
  joined_at       timestamptz
  PK (cohort_id, user_id)

consents
  id              uuid PK
  user_id         uuid → profiles  (cascade)     -- null for public opt-in (see public_results)
  public_result_id uuid → public_results (cascade)
  kind            enum('store_results','facilitator_visibility','newsletter')
  granted         boolean
  policy_version  text
  locale          text
  granted_at      timestamptz
  -- append only; withdrawal is a new row with granted=false

attempts
  id              uuid PK
  user_id         uuid → profiles  (cascade)
  cohort_id       uuid → cohorts   (cascade)
  mode            enum('cohort')                  -- public attempts live in public_results
  item_bank_version text                          -- 'v2'
  form            enum('full','short')
  locale          text
  seed            text
  started_at      timestamptz
  completed_at    timestamptz
  duration_seconds int
  responses       jsonb            -- { "PERF1": 4, ... } raw, all items
  scores          jsonb            -- full Result object from scoring engine
  pattern         text             -- denormalised for dashboard queries
  self_score      numeric
  quality_flags   text[]
  care_flag       boolean
  scoring_version text             -- git-tracked version of thresholds config

participant_notes
  id              uuid PK
  attempt_id      uuid → attempts  (cascade)
  user_id         uuid → profiles  (cascade)
  protector_key   text
  body            text             -- belief sentence frame + reflections
  shared_with_facilitator boolean default false
  updated_at      timestamptz

public_results                     -- only when the person opted in to email
  id              uuid PK
  email           text             -- the only PII; deleted by retention job
  locale          text
  item_bank_version text
  form            text
  seed            text
  responses       jsonb
  scores          jsonb
  newsletter_opt_in boolean
  created_at      timestamptz
  expires_at      timestamptz      -- default now() + 6 months

audit_log
  id              bigserial PK
  actor_id        uuid → profiles
  action          text             -- 'view_participant','export_csv','export_identified', ...
  cohort_id       uuid
  subject_user_id uuid
  at              timestamptz
  -- insert only; written by security-definer function from server actions

app_settings                       -- single row, admin only
  public_retention_months int default 6
  default_cohort_retention_months int default 12
```

Helper functions (security definer, `search_path = public`):
- `is_admin()`, `is_facilitator_of(cohort_id)`, `is_member_of(cohort_id)`
- `delete_my_account()` — deletes attempts, notes, consents, memberships, profile, then `auth.users` row
- `run_retention()` — deletes cohort data past `ends_on + retention_months` and expired `public_results`
- `validate_access_code(code)` — returns cohort id if hash matches and not expired; rate limited at the route

---

## 5. RLS policy design

Principle: deny by default; every policy is `USING` on select and `WITH CHECK` on write; no policy relies on the UI.

| Table | participant | facilitator | admin |
|---|---|---|---|
| profiles | select/update own row (cannot change `role`) | select rows of members of own cohorts | all |
| cohorts | select cohorts they are a member of | select assigned cohorts | all |
| cohort_facilitators | none | select own assignments | all |
| cohort_members | select own membership; insert own via `validate_access_code` | select members of assigned cohorts | all |
| consents | select/insert own | select `facilitator_visibility` consents of assigned cohort members | all |
| attempts | select/insert own; no update after `completed_at`; delete own | select attempts of assigned-cohort members **only where an active `facilitator_visibility` consent exists** | all |
| participant_notes | select/insert/update/delete own | select where `shared_with_facilitator = true` and member of assigned cohort | all |
| public_results | none (service role only, via server) | none | select via admin export only |
| audit_log | none | none | select |
| app_settings | none | none | all |

Column-level rule: `profiles.role` is only writable by admin (trigger rejects other updates).

RLS tests (pgTAP, run in CI against local Supabase):
1. Facilitator A cannot select attempts, members or profiles of cohort B.
2. Participant P1 cannot select attempts, notes or profile of P2 in the same cohort.
3. Facilitator cannot read an attempt whose participant withdrew `facilitator_visibility`.
4. Participant cannot escalate `role`.
5. Note with `shared_with_facilitator = false` is invisible to facilitator.
6. `delete_my_account()` leaves zero rows for that user in every table.

---

## 6. Scoring engine contract (Phase 2 preview)

```ts
score(input: { responses: Record<ItemId, 1|2|3|4|5>; form: 'full'|'short'; itemBankVersion: 'v2'; durationSeconds: number })
  → Result {
      scales: Record<ScaleKey, { mean: number; display: number; band: Band }>
      self: { mean, display, band: SelfBand }
      leads: { manager, firefighter, exile, protectionLoad }
      pattern: { key: PatternKey; modifiers: ModifierKey[]; evidence: {...} }
      protectors: { ranked: ScaleKey[]; leading: ScaleKey | null; team: ScaleKey[] }
      exiles: { ranked: ScaleKey[] }
      pairings: Array<{ protector: ScaleKey; exile: ScaleKey }>
      qualityFlags: QualityFlag[]
      careFlag: boolean
    }
```
All thresholds imported from `config/scoring.ts`. No I/O, no Date, no randomness inside the engine.

---

## 7. Assumptions needing your confirmation

- **A1 Repository.** Not yet a git repo. I will `git init` in Phase 2, main branch, conventional commits, gitleaks pre-commit via a `.gitleaks.toml` and a documented `pre-commit` hook (no Husky dependency).
- **A2 Public results storage.** Public-mode results are stored only when the person ticks "store my results" and enters an email. They are stored without an auth user, in `public_results`, and deleted after 6 months. Email is sent from the server so results never transit a third party other than Resend.
- **A3 Cohort attempts and public attempts are separate tables**, because one is identified and consent-scoped, the other is email-only. Simpler RLS, simpler deletion.
- **A4 Rate limiting store.** Upstash Redis (EU region) via Vercel Marketplace. Alternative with no extra service: a Postgres table with a security-definer function. I recommend Upstash for correctness under Fluid Compute concurrency, but Postgres is acceptable if you want fewer sub-processors. Decide.
- **A5 Email provider.** Resend for both magic links (as Supabase custom SMTP) and results emails, so there is one email sub-processor. EU sending region.
- **A6 Access codes** are hashed; the facilitator sees the plain code only once at creation. Codes are 8 characters, expiring by date set by admin.
- **A7 Facilitator visibility is consent-gated in RLS**, not only at signup. Withdrawing consent instantly hides attempts from facilitators without deleting them.
- **A8 PDF** generated server-side with @react-pdf/renderer from the same static content files, so text is identical to the screen. In public mode the responses are POSTed to the PDF route and not persisted.
- **A9 Short form in public mode** by default; a `?form=full` query is allowed for testing but not exposed in UI.
- **A10 Analytics.** None in v1. Vercel Web Analytics is cookieless and could be added later.
- **A11 Deletion of public opt-in results** before expiry: the results email carries a signed one-click delete link.
- **A12 Aggregates threshold** (5 completed participants) is a constant in `config/app.ts`.
- **A13 Supabase over alternatives.** Kept as specified. Neon + custom auth would need us to build RLS-equivalent logic in app code; Supabase RLS is the better fit for the facilitator/participant isolation requirement.
- **A14 Level naming.** "Level II, Balance" text appears only in cohort mode and only from content files.

