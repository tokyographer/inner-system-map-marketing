# Inner System Map

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

## Supabase (cohort mode)
Cohort mode needs a Supabase project in an EU region (Frankfurt). Locally, Docker plus the bundled CLI give you a full stack:
```
npx supabase start          # first run pulls images (a few minutes)
npx supabase db reset       # applies supabase/migrations/*.sql
npx supabase status -o env  # copy API_URL, ANON_KEY, SERVICE_ROLE_KEY into .env.local
npx supabase gen types typescript --local --schema public > lib/supabase/types.ts   # after changing a migration
npx supabase stop
```
For production: create the project, run `npx supabase link --project-ref <ref>` then `npx supabase db push`, set Auth → URL configuration → Site URL and add `https://<your-domain>/auth/callback` to redirect URLs, and configure custom SMTP (Resend) under Auth → SMTP so magic links come from your domain.

Create the first admin by inserting the role after the person signs in once:
```
update public.profiles set role = 'admin' where id = '<auth user id>';
```
Cohorts and access codes are created by an admin (facilitator dashboard, Phase 6). Until then, insert one directly:
```
insert into public.cohorts (name, level, language, ends_on, access_code_hash, access_code_expires_at)
values ('Balance 2026', 'II', 'en', '2026-12-31', public.hash_access_code('BAL-2026'), now() + interval '90 days');
```

## Commands
```
npm run dev          # http://localhost:3000
npm run typecheck
npm test             # unit tests (scoring engine, PDF, email, validation)
npx vitest run --coverage
npm run build
npm run e2e          # Playwright: public happy path + accessibility audit (needs `npx playwright install chromium` once)
```

## Cohort mode flow
`/{locale}/cohort/join` → access code + email → magic link → `/auth/callback` → `/{locale}/cohort/consent` (logged consents: store_results, facilitator_visibility, newsletter) → `/{locale}/cohort` (attempt history) → full-form questionnaire → `/{locale}/cohort/results/{attemptId}` with a private note that can be shared with the facilitator. `/{locale}/cohort/settings` exports all data as JSON and deletes the account with a real cascade.

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
- Supabase (database and auth, EU region)

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
