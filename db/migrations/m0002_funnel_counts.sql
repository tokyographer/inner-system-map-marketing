-- Marketing (this repo only): registered partner codes and daily start /
-- completion counts per code. Additive only: two new tables, nothing existing
-- changes.
--
-- marketing_partners: codes admins register for partners who share
-- /{locale}?ref=CODE. Only registered codes get their own counter row, so the
-- set of rows is bounded by admins and a visitor-typed code is never stored.
-- marketing_funnel_counts: aggregates only (no user id, email, IP, response or
-- score). ref_code '' = no code, '-' = a code that is not registered. Rows
-- older than 400 days are pruned by the retention cron (marketing hook).
-- The public counter writes on the service connection; admins read and manage
-- through withUser (RLS).

create table public.marketing_partners (
  code text primary key check (code ~ '^[a-z0-9][a-z0-9-]{1,31}$'),
  label text not null check (char_length(label) between 1 and 120),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.marketing_funnel_counts (
  day date not null default current_date,
  ref_code text not null default '' check (ref_code in ('', '-') or ref_code ~ '^[a-z0-9][a-z0-9-]{1,31}$'),
  event text not null check (event in ('start', 'complete')),
  count integer not null default 0 check (count >= 0),
  primary key (day, ref_code, event)
);

alter table public.marketing_partners enable row level security;
alter table public.marketing_funnel_counts enable row level security;
revoke all on public.marketing_partners from public, app_user;
revoke all on public.marketing_funnel_counts from public, app_user;
grant select, insert, delete on public.marketing_partners to app_user;
grant select on public.marketing_funnel_counts to app_user;
create policy marketing_partners_admin_select on public.marketing_partners for select to app_user using (app.is_admin());
create policy marketing_partners_admin_insert on public.marketing_partners for insert to app_user with check (app.is_admin() and created_by = app.current_user_id());
-- Delete removes the label (it may name a person); the code's past counts stay, since they hold no personal data.
create policy marketing_partners_admin_delete on public.marketing_partners for delete to app_user using (app.is_admin());
create policy marketing_funnel_admin_select on public.marketing_funnel_counts for select to app_user using (app.is_admin());
