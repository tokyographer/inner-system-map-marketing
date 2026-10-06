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
npm run core:fingerprint      # hash of the core shared with the marketing repo (see CORE.md)
npm run core:golden:update    # regenerate golden scoring results after a deliberate scoring change
```

## Cohort mode flow
`/{locale}/cohort/join` → access code + email → six-digit sign-in code by email (Neon Auth) → `/{locale}/cohort/consent` (logged consents: store_results, facilitator_visibility, newsletter) → `/{locale}/cohort` (attempt history) → full-form questionnaire → `/{locale}/cohort/results/{attemptId}` with a private note that can be shared with the facilitator. `/{locale}/cohort/settings` exports all data as JSON and deletes the account with a real cascade.

## Facilitator dashboard
- `/{locale}/facilitator`: cohorts you are assigned to → participant table (completion, pattern, Self, top protectors, top exile theme, quality flags, "may benefit from extra support"), cohort picture (hidden until 5 participants have completed), pseudonymised item-level CSV.
- `/{locale}/facilitator/cohorts/{id}/participants/{userId}`: history across attempts, notes the participant chose to share, latest map. Each view is written to the audit log.
- `/{locale}/admin/cohorts`: create cohorts (the access code is shown once), assign facilitators, identified CSV, audit log at `/{locale}/admin/audit`.

## API (public mode)
`POST /api/public/results-pdf` with JSON `{ locale, form, responses, durationSeconds?, ageConfirmed: true, name? }` returns `application/pdf`, named `<app-name>-results-<name>.pdf`.

`POST /api/public/email-results` with the same body plus `{ name, email, consent: { storeResults: true, newsletter, policyVersion } }` sends the PDF to `email` in the request locale, and a separate copy to `RESULTS_COPY_TO` in English (English email and English PDF, whatever the person's language). Returns `{ ok: true, copySentToInstitute }`.

Example:
```
curl -X POST localhost:3000/api/public/results-pdf -H 'content-type: application/json' \
  -d @sample-request.json -o results.pdf
```

## What is produced
- PDF in memory only; nothing is written to disk by the server.
- Emails via Resend. No response payloads are logged.
- Public opt-in results are stored for 6 months with a hashed delete token; the email carries a one-click deletion link. A nightly cron removes expired public results and cohort data past its retention date.

## Deploying to production
1. Push to GitHub and import the repository in Vercel (Framework: Next.js, defaults). `vercel.ts` pins functions to Frankfurt and schedules the nightly retention job.
2. Marketplace resources on the Vercel project: Neon (Frankfurt, Neon Auth on), Upstash Redis (EU), Resend. Each adds its own variables.
3. Set the app's variables in all three environments: `NEON_AUTH_COOKIE_SECRET`, `RESEND_FROM`, `RESULTS_COPY_TO`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` (Preview may need to be added in the dashboard).
4. Run the migrations against the production branch once, then after every migration change:
   ```
   npx vercel env pull .env.production.local --environment production --yes
   npx dotenv -e .env.production.local -- node scripts/migrate.mjs
   ```
5. In the Neon console, Auth → add the production domain to trusted origins. In Resend, verify the sending domain in the EU region.
6. Bootstrap the first admin: sign in once at `/en/cohort/join` with any valid access code (create a cohort row by SQL for that, or set the role directly):
   ```
   update public.profiles set role = 'admin' where id = (select id from neon_auth."user" where email = 'you@example.com');
   ```
7. Check the deployment: `/api/health` is not needed; open `/en`, take the questionnaire, confirm the email arrives, then create a cohort from `/en/admin/cohorts`.

## Sub-processors (for the privacy policy)
- Vercel (hosting, EU region fra1)
- Resend (transactional email)
- Neon (Postgres and Neon Auth, Frankfurt eu-central-1, via Vercel Marketplace)
- Upstash (Redis for rate limiting, EU, via Vercel Marketplace)

## Troubleshooting
1. `503 email_not_configured`: set `RESEND_API_KEY` and `RESEND_FROM` in `.env` and restart `npm run dev`.
2. `400 invalid_request` with "item(s) missing": the form (`short` = 63 items, `full` = 84) does not match the responses sent.
3. `429 rate_limited`: 3 emails or 10 PDFs per client per window. Wait for `Retry-After` seconds.
4. Retention job returns 401: `CRON_SECRET` differs between Vercel and the request. Vercel sends it automatically for scheduled runs; for a manual run pass `Authorization: Bearer <secret>`.

## Git workflow
```
git checkout -b feat/<topic>
git commit -m "feat: <description>"
git push -u origin feat/<topic>
```
