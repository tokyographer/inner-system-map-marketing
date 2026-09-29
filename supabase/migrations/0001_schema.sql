-- Inner System Map: core schema (cohort mode + public opt-in results).
-- All response data is treated as special category data (GDPR Art. 9).
-- Email lives only in auth.users (cohort) or public_results (opt-in). No IPs, no DOB.

create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('admin', 'facilitator', 'participant');
create type public.consent_kind as enum ('store_results', 'facilitator_visibility', 'newsletter');
create type public.form_kind as enum ('full', 'short');

-- ── profiles ───────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.app_role not null default 'participant',
  locale text not null default 'en' check (locale in ('en', 'es', 'ro')),
  created_at timestamptz not null default now()
);

-- ── cohorts ────────────────────────────────────────────────────────────
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null default 'II',
  language text not null default 'en' check (language in ('en', 'es', 'ro')),
  starts_on date,
  ends_on date,
  access_code_hash text not null,
  access_code_expires_at timestamptz not null,
  retention_months int not null default 12 check (retention_months between 1 and 60),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.cohort_facilitators (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (cohort_id, user_id)
);

create table public.cohort_members (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  pseudonym text not null unique default encode(gen_random_bytes(6), 'hex'),
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);

-- ── consents (append-only; withdrawal is a new row with granted=false) ──
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cohort_id uuid references public.cohorts (id) on delete cascade,
  kind public.consent_kind not null,
  granted boolean not null,
  policy_version text not null,
  locale text not null,
  granted_at timestamptz not null default now()
);
create index consents_user_kind_idx on public.consents (user_id, kind, granted_at desc);

-- ── attempts (cohort mode) ─────────────────────────────────────────────
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  item_bank_version text not null,
  scoring_version text not null,
  form public.form_kind not null,
  locale text not null,
  seed bigint not null,
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  duration_seconds int not null check (duration_seconds >= 0),
  responses jsonb not null,
  scores jsonb not null,
  pattern text not null,
  self_score numeric(4, 3) not null,
  top_protectors text[] not null,
  top_exile text not null,
  quality_flags text[] not null default '{}',
  care_flag boolean not null default false
);
create index attempts_cohort_idx on public.attempts (cohort_id, completed_at desc);
create index attempts_user_idx on public.attempts (user_id, completed_at desc);

-- ── participant notes ("Meet this part", private unless shared) ────────
create table public.participant_notes (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  protector_key text not null,
  body text not null default '' check (char_length(body) <= 4000),
  shared_with_facilitator boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (attempt_id, protector_key)
);

-- ── public opt-in results (no auth user) ───────────────────────────────
create table public.public_results (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null,
  item_bank_version text not null,
  scoring_version text not null,
  form public.form_kind not null,
  responses jsonb not null,
  scores jsonb not null,
  newsletter_opt_in boolean not null default false,
  policy_version text not null,
  delete_token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index public_results_expires_idx on public.public_results (expires_at);

-- ── audit log (insert-only via function) ───────────────────────────────
create table public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  cohort_id uuid,
  subject_user_id uuid,
  at timestamptz not null default now()
);

-- ── app settings (single row) ──────────────────────────────────────────
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  public_retention_months int not null default 6,
  default_cohort_retention_months int not null default 12
);
insert into public.app_settings (id) values (1);

-- ── profile bootstrap on sign-up ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, locale)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'locale', 'en'))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
