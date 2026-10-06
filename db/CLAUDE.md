# db: Neon schema, functions and RLS

Migrations in `migrations/` are applied in filename order by `scripts/migrate.mjs` (`npm run db:migrate`, which loads `.env.local`). Each file runs once in its own transaction and is tracked in `public.schema_migrations`.

## Rules
- Marketing migrations (`m0NNN_*.sql`) are **additive only**: new nullable columns or new tables, with their own RLS. Never drop, rename or change core columns, constraints, policies or functions: this repo will run against the production database, possibly while the original still does. Apply them only to the `marketing-dev` branch from a developer machine; production only through "Going live" in `README.md`.
- Marketing-only (this repo): `m0002_funnel_counts.sql` adds `marketing_partners` (registered codes and a partner name; admins select, insert and delete through RLS, so a partner's name can be erased) and `marketing_funnel_counts` (day, ref_code, event, count; `''` = no code, `'-'` = unregistered code). The counts are aggregates with no personal data; rows older than 400 days are deleted by the retention cron through `pruneFunnelCounts()` (a marketing hook in `app/api/cron/retention/route.ts`; `app.run_retention()` is core and unchanged). Admins select counts, and (m0003) may write them only so `deletePartner` can fold a removed partner's counts into `'-'`; non-admin `app_user` cannot write; the public counter writes on the owner connection.
- Marketing-only (this repo): `m0001_attribution.sql` adds nullable `utm_source`, `utm_medium`, `utm_campaign`, `ref_code` to `public_results`. They are deleted with the row, so retention and the delete link need no change.
- Core migrations (`0NNN_*.sql`) are numbered only in the upstream repo and are part of the core shared with the marketing repo (see `CORE.md`). Marketing-only migrations in the marketing repo use `m0NNN_*.sql`.
- Append-only. Never edit an applied file; add `000N_<topic>.sql` with the next number.
- Every table holding personal data gets `enable row level security` plus explicit policies `to app_user`. Policies use the helpers `app.current_user_id()`, `app.is_admin()`, `app.is_member_of(cohort)` and `app.is_facilitator_of(cohort)`.
- Facilitator reads of attempts and notes require an active `facilitator_visibility` consent, checked in SQL rather than in TypeScript.
- Functions are `security definer set search_path = public`. Postgres grants EXECUTE to PUBLIC by default, so server-only functions must `revoke execute ... from public, app_user` (see 0004). Revoking from app_user alone does nothing.
- Role changes are guarded by the trigger in 0008. It skips when `app.user_id` is unset, which is how the first admin is bootstrapped on the service connection.
- Widening a check constraint (e.g. a new locale) is a new migration (see 0005).
- Deletion must stay real: `app.delete_my_data()` removes every app row for the user, and Neon Auth `deleteUser` removes the account.
- Retention is `app.run_retention()`, called by the nightly cron through `asService`.

## Verifying
- Marketing policies are tested in their own files (`tests/integration/marketing-*.test.ts`), because `rls.test.ts` is shared with upstream.
- `tests/integration/rls.test.ts` exercises every policy against the Neon dev branch. It runs only when `.env.local` has `DATABASE_URL`. Extend it for every new policy or function.
- Production: pull the production env into `.env.production.local` and run `npx dotenv -e .env.production.local -- node scripts/migrate.mjs`. Do this only when the user asks.
