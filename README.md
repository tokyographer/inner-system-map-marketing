# Inner System Map

Available in English, Spanish, Romanian and Turkish (translations are drafts pending human review).

A self-report reflection tool that maps a person's inner system in Internal Family Systems (IFS) terms: available Self-leadership, which group of parts is leading, and which parts are most active. Built for Transcendent Institute's Self Leadership Program. It is not a validated psychometric instrument and does not assess any condition.

## Prerequisites
- macOS (Apple Silicon fine), Node 24+, npm 11+
- A Resend account with a verified sending domain (for emailing results)

## Setup
```
git clone <repo> && cd inner-system-map
npm install
cp .env.example .env
# edit .env: RESEND_API_KEY, RESEND_FROM, RESULTS_COPY_TO
```

## Neon Postgres and Neon Auth (cohort mode)
The database and sign-in service are provisioned through the Vercel Marketplace (Neon, region Frankfurt, with Neon Auth enabled). There is no local database: development uses the Neon development branch.
```
npx vercel link                       # once
npx vercel env pull .env.local --yes  # DATABASE_URL, NEON_AUTH_BASE_URL, ...
openssl rand -base64 32               # → NEON_AUTH_COOKIE_SECRET in .env.local and in Vercel (all environments)
npm run db:migrate                    # applies db/migrations/*.sql once each (tracked in schema_migrations)
```
Run `npm run db:migrate` against production once before the first production deploy (pull the production env into a separate file and pass it to dotenv).

Create the first admin after that person has signed in once:
```
update public.profiles set role = 'admin' where id = '<neon_auth user id>';
```
Cohorts, access codes and facilitator assignments are then managed in the dashboard at `/{locale}/admin/cohorts` (admins) and `/{locale}/facilitator` (facilitators and admins). A facilitator must have signed in once before they can be assigned.

## Commands
```
npm run dev          # http://localhost:3000
npm run typecheck
npm test             # unit tests + RLS integration tests (the latter run only when .env.local has DATABASE_URL)
npx vitest run --coverage
npm run build
npm run e2e          # Playwright: public happy path + accessibility audit (needs `npx playwright install chromium` once)
```

## Cohort mode flow
`/{locale}/cohort/join` → access code + email → six-digit sign-in code by email (Neon Auth) → `/{locale}/cohort/consent` (logged consents: store_results, facilitator_visibility, newsletter) → `/{locale}/cohort` (attempt history) → full-form questionnaire → `/{locale}/cohort/results/{attemptId}` with a private note that can be shared with the facilitator. `/{locale}/cohort/settings` exports all data as JSON and deletes the account with a real cascade.

## Facilitator dashboard
- `/{locale}/facilitator`: cohorts you are assigned to → participant table (completion, pattern, Self, top protectors, top exile theme, quality flags, "may benefit from extra support"), cohort picture (hidden until 5 participants have completed), pseudonymised item-level CSV.
- `/{locale}/facilitator/cohorts/{id}/participants/{userId}`: history across attempts, notes the participant chose to share, latest map. Each view is written to the audit log.
- `/{locale}/admin/cohorts`: create cohorts (the access code is shown once), assign facilitators, identified CSV, audit log at `/{locale}/admin/audit`.

## API (public mode)
`POST /api/public/results-pdf` with JSON `{ locale, form, responses, durationSeconds?, ageConfirmed: true }` returns `application/pdf`.

`POST /api/public/email-results` with the same body plus `{ email, consent: { storeResults: true, newsletter, policyVersion } }` sends the PDF to `email` and a separate copy to `RESULTS_COPY_TO`. Returns `{ ok: true, copySentToInstitute }`.

Example:
```
curl -X POST localhost:3000/api/public/results-pdf -H 'content-type: application/json' \
  -d @sample-request.json -o results.pdf
```

## What is produced
- PDF in memory only; nothing is written to disk by the server.
- Emails via Resend. No response payloads are logged.

## Sub-processors (for the privacy policy)
- Vercel (hosting, EU region fra1)
- Resend (transactional email)
- Neon (Postgres and Neon Auth, Frankfurt eu-central-1, via Vercel Marketplace)

## Troubleshooting
1. `503 email_not_configured`: set `RESEND_API_KEY` and `RESEND_FROM` in `.env` and restart `npm run dev`.
2. `400 invalid_request` with "item(s) missing": the form (`short` = 63 items, `full` = 84) does not match the responses sent.
3. `429 rate_limited`: 3 emails or 10 PDFs per client per window. Wait for `Retry-After` seconds.

## Git workflow
```
git checkout -b feat/<topic>
git commit -m "feat: <description>"
git push -u origin feat/<topic>
```
