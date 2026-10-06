# db: Neon schema, functions and RLS

Migrations in `migrations/` are applied in filename order by `scripts/migrate.mjs` (`npm run db:migrate`, which loads `.env.local`). Each file runs once in its own transaction and is tracked in `public.schema_migrations`.

## Rules
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
- `tests/integration/rls.test.ts` exercises every policy against the Neon dev branch. It runs only when `.env.local` has `DATABASE_URL`. Extend it for every new policy or function.
- Production: pull the production env into `.env.production.local` and run `npx dotenv -e .env.production.local -- node scripts/migrate.mjs`. Do this only when the user asks.
