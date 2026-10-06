# Inner System Map: marketing

Available in English, Spanish, Romanian and Turkish (translations are drafts pending human review).

A self-report reflection tool that maps a person's inner system in Internal Family Systems (IFS) terms: available Self-leadership, which group of parts is leading, and which parts are most active. Built for Transcendent Institute's Self Leadership Program. It is not a validated psychometric instrument and does not assess any condition.

This is the marketing version of the app: the same core (kept identical to the original app, see `CORE.md`) plus lead-generation features in `marketing/`.

## Setting up this repo (marketing)
This repo is the marketing version of the Inner System Map. It is a clone of the original app, which is the git remote `upstream` (`../inner-system-ifs-test`). It has its own Vercel project, its own Neon branch (`marketing-dev`) and a test inbox, so marketing work never touches the original app's live data or emails. The plan is for this repo to replace the original as the live app (see "Going live").

1. **Upstream remote and core check.** Clone the original app next to this one, then confirm both cores match:
   ```
   git remote -v                                   # upstream → inner-system-ifs-test
   git clone git@github.com:tokyographer/inner-system-ifs-test.git ../inner-system-ifs-test   # if missing
   npm run -s core:fingerprint
   (cd ../inner-system-ifs-test && npm run -s core:fingerprint)   # must print the same hash
   ```
2. **Its own Vercel project.** Do not link this folder to the original app's project. Create a new one (suggested name `inner-system-map-marketing`, region fra1):
   ```
   npx vercel link --project inner-system-map-marketing   # answer "no" to linking an existing project if it offers the original one
   ```
3. **Database: the `marketing-dev` Neon branch.** Development uses a branch named `marketing-dev`, created from the **dev branch of the original Neon project**. It starts with the same schema, migration history, cohorts and admin. It is not a new Neon project, so do **not** add Neon from the Vercel Marketplace to this repo's Vercel project (that would create a new Neon project).
   - **Never** copy the original's `.env.local`, never link this repo to the original's Vercel project, and never run `npm run db:migrate` against any database except `marketing-dev`.

   Neon console:
   1. Open the original Neon project (Frankfurt) → **Branches** → **Create branch**.
   2. Name `marketing-dev`; parent: the original's dev branch (the one the original's `.env.local` points at, not production); include data up to **Current point in time**. Create.
   3. **Connect** (top right) with branch `marketing-dev`, database `neondb`, the owner role: copy the **pooled** string (`DATABASE_URL`), then switch off "Connection pooling" and copy the direct string (`DATABASE_URL_UNPOOLED`).
   4. **Auth** (Neon Auth) with branch `marketing-dev` selected: if it shows a URL for this branch, use it as `NEON_AUTH_BASE_URL`; otherwise use the project's Auth URL. Add `http://localhost:3000` and `http://localhost:3111` to its trusted origins if they are not there.

   Or from the terminal (the project id is in the Neon console under Settings):
   ```
   npx neonctl auth                                            # once
   npx neonctl branches create --project-id <original-project-id> --name marketing-dev --parent <original-dev-branch>
   npx neonctl connection-string marketing-dev --project-id <original-project-id> --pooled   # → DATABASE_URL
   npx neonctl connection-string marketing-dev --project-id <original-project-id>            # → DATABASE_URL_UNPOOLED
   ```
   Then write this repo's `.env.local` by hand (it is gitignored):
   ```
   DATABASE_URL=<pooled marketing-dev string>
   DATABASE_URL_UNPOOLED=<direct marketing-dev string>
   NEON_AUTH_BASE_URL=<marketing-dev or project Auth URL>
   NEON_AUTH_COOKIE_SECRET=<output of: openssl rand -base64 32>   # new; never reuse the original's
   ```
   Check the host before migrating, then apply the marketing migrations (the core `0NNN` files are already recorded in `schema_migrations` on the branch, so they are skipped):
   ```
   grep -o '@[^/]*' .env.local          # must be the marketing-dev endpoint (ep-...), not the original's dev or production endpoint
   npm run db:migrate                   # skip 0001…0008, apply m0001…
   ```
   In this repo's Vercel project, set the same four variables for **Preview** and **Development** (Settings → Environment Variables, or `npx vercel env add DATABASE_URL preview` and so on). After that, `npx vercel env pull .env.local --yes` is safe; before it, it would overwrite your hand-written file.
4. **Upstash and Resend.** Add Upstash Redis (EU) and Resend from the Marketplace on the new project, or set `RESEND_API_KEY`/`RESEND_FROM` yourself.
5. **Test inbox for the institute copy.** In development and preview, `RESULTS_COPY_TO` is a test inbox you own (for example a `+marketing-test` alias), never the institute's real inbox: in `.env` and in the Vercel Preview and Development environments. The real address goes in Production only when you go live.
6. **Program and live-session links.** The results page links to a program page per locale and, when set, to the next "Reading your map" live session. Both are in `marketing/config.ts` (`PROGRAM_URL`, `LIVE_SESSION_URL`; an empty live-session URL hides the link) and ship with a deploy. The links carry `utm_source=inner-system-map&utm_medium=results&utm_campaign=program-invite|live-session&utm_content=<locale>`.
7. **Vercel Web Analytics.** Enable Web Analytics in the new project's dashboard (Analytics tab). Custom events (the funnel events) need a Pro or Enterprise plan; on Hobby only page views are recorded. The funnel events are `landing_view`, `start`, `completion`, `email_sent` and `invite_click`, with the properties `locale`, `ref` (partner code) and `target` (invite link) only. Read them under Analytics → Events.
8. **CI secrets.** The GitHub Actions workflow (`.github/workflows/ci.yml`) runs without secrets; the RLS integration tests and the cohort/facilitator walks then skip. To run them, add these repository secrets in GitHub (Settings → Secrets and variables → Actions), pointing at `marketing-dev` or a CI branch created from it (Neon console → Branches → Create branch, parent `marketing-dev`), never production and never the original's branches:
   - `CI_DATABASE_URL`, `CI_DATABASE_URL_UNPOOLED`
   - `CI_NEON_AUTH_BASE_URL`, `CI_NEON_AUTH_COOKIE_SECRET`

## Going live (this repo replaces the original)
Only one live app may run against a database: each app runs its own nightly retention cron and its own rate limits. Until go-live, leave this project's Production database variables unset, so its cron (Vercel runs crons in Production only) cannot touch any database. Do these in order, in one session:
1. **Production database.** In this repo's Vercel project, set the Production variables `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `NEON_AUTH_BASE_URL` to the original's **production** branch, plus a new `NEON_AUTH_COOKIE_SECRET`, `CRON_SECRET`, `RESEND_*` and `NEXT_PUBLIC_SITE_URL`.
2. **Marketing migrations on production.** The `m0NNN` files are additive only (new nullable columns or new tables), so the original keeps working on the same schema until it is retired:
   ```
   npx vercel env pull .env.production.local --environment production --yes
   grep -o '@[^/]*' .env.production.local        # the production endpoint
   npx dotenv -e .env.production.local -- node scripts/migrate.mjs   # skips 0NNN, applies m0NNN
   rm .env.production.local
   ```
3. **Institute copy.** Set `RESULTS_COPY_TO` in Production to the institute's real inbox.
4. **Neon Auth trusted origins.** Neon console → Auth (production branch) → add the live domain.
5. **Domain.** Move the live domain from the original's Vercel project to this one (Settings → Domains), and set `NEXT_PUBLIC_SITE_URL` to it.
6. **Retire the original.** In the original's Vercel project, remove its production domain and pause the project (Settings → General → Pause), or delete its cron in `vercel.ts` and redeploy, so its retention cron no longer runs. Then check `/en` on the live domain, take the questionnaire once and confirm both emails arrive.

## Prerequisites
- macOS (Apple Silicon fine), Node 24+, npm 11+
- A Resend account with a verified sending domain (for emailing results)

## Setup
```
git clone git@github.com:tokyographer/inner-system-map-marketing.git && cd inner-system-map-marketing
git remote add upstream https://github.com/tokyographer/inner-system-ifs-test.git   # once, if missing
npm install
cp .env.example .env
# edit .env: RESEND_API_KEY, RESEND_FROM, RESULTS_COPY_TO
```

## Neon Postgres and Neon Auth (cohort mode)
The database and sign-in service are the original app's Neon project (Frankfurt, Neon Auth on). This repo develops on its `marketing-dev` branch; see step 3 of "Setting up this repo". There is no local database. `npm run db:migrate` applies `db/migrations/*.sql` once each (tracked in `schema_migrations`), and only ever against `marketing-dev` from a developer machine.

The cohorts and admin copied from the original's dev branch are already there. To make someone an admin on `marketing-dev` after they have signed in once:
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
npm run core:fingerprint      # hash of the core shared with upstream (see CORE.md); must equal ../inner-system-ifs-test
# npm run core:golden:update  # upstream only; never in this repo
```

## Cohort mode flow
`/{locale}/cohort/join` → access code + email → six-digit sign-in code by email (Neon Auth) → `/{locale}/cohort/consent` (logged consents: store_results, facilitator_visibility, newsletter) → `/{locale}/cohort` (attempt history) → full-form questionnaire → `/{locale}/cohort/results/{attemptId}` with a private note that can be shared with the facilitator. `/{locale}/cohort/settings` exports all data as JSON and deletes the account with a real cascade.

## Facilitator dashboard
- `/{locale}/facilitator`: cohorts you are assigned to → participant table (completion, pattern, Self, top protectors, top exile theme, quality flags, "may benefit from extra support"), cohort picture (hidden until 5 participants have completed), pseudonymised item-level CSV.
- `/{locale}/facilitator/cohorts/{id}/participants/{userId}`: history across attempts, notes the participant chose to share, latest map. Each view is written to the audit log.
- `/{locale}/admin/cohorts`: create cohorts (the access code is shown once), assign facilitators, identified CSV, audit log at `/{locale}/admin/audit`.

## API (public mode)
`POST /api/marketing/funnel` (this repo only) with `{ event: "start" | "complete", ref? }` bumps the anonymous daily count for that partner code. 204 on success (also when no database is configured), 400 on anything else, 429 after 10 per client per hour. Only codes an admin registered at `/{locale}/admin/partners` get their own count; others are counted together as unregistered. The counts are client-reported and untrusted.

`POST /api/public/results-pdf` with JSON `{ locale, form, responses, durationSeconds?, ageConfirmed: true, name? }` returns `application/pdf`, named `<app-name>-results-<name>.pdf`.

`POST /api/public/email-results` with the same body plus `{ name, email, consent: { storeResults: true, newsletter, policyVersion } }` sends the PDF to `email` in the request locale, and a separate copy to `RESULTS_COPY_TO` in English (English email and English PDF, whatever the person's language). Returns `{ ok: true, copySentToInstitute }`. In this repo the body may also carry `attribution: { utmSource?, utmMedium?, utmCampaign?, ref? }` (parsed by `marketing/validation.ts`; invalid values are dropped, never rejected), stored on the opt-in `public_results` row.

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
2. Marketplace resources on the Vercel project: Upstash Redis (EU) and Resend. Neon is not added from the Marketplace: the database variables point at `marketing-dev` (Preview, Development) and, when going live, at the original's production branch (see "Going live").
3. Set the app's variables in all three environments: `NEON_AUTH_COOKIE_SECRET`, `RESEND_FROM`, `RESULTS_COPY_TO`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` (Preview may need to be added in the dashboard).
4. Production migrations happen only as part of "Going live" and, after that, after every new `m0NNN` file:
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
- Vercel Web Analytics (cookieless page views and funnel events; this repo only)

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
