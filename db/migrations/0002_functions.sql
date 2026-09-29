-- Identity for RLS: the app server verifies the Neon Auth session, then runs
-- each request inside a transaction as the restricted role app_user with
-- app.user_id set. Policies read app.current_user_id(). Only the server can
-- set it; the database enforces isolation.

create schema if not exists app;

create or replace function app.current_user_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid;
$$;

create or replace function app.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = app.current_user_id() and role = 'admin');
$$;

create or replace function app.is_facilitator_of(p_cohort uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cohort_facilitators where cohort_id = p_cohort and user_id = app.current_user_id());
$$;

create or replace function app.is_member_of(p_cohort uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cohort_members where cohort_id = p_cohort and user_id = app.current_user_id());
$$;

-- Latest consent row of a kind decides; no row means not granted.
create or replace function app.has_consent(p_user uuid, p_cohort uuid, p_kind public.consent_kind)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select granted from public.consents
    where user_id = p_user and kind = p_kind and (cohort_id = p_cohort or (p_cohort is null and cohort_id is null))
    order by granted_at desc limit 1
  ), false);
$$;

-- Only admins may change roles.
create or replace function app.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not app.is_admin() then
    raise exception 'role can only be changed by an admin';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function app.guard_role_change();

-- Access code: plain code never stored. sha256(lower(trim(code))).
create or replace function app.hash_access_code(p_code text)
returns text language sql immutable set search_path = public as $$
  select encode(digest(lower(trim(p_code)), 'sha256'), 'hex');
$$;

-- Returns the cohort a code opens (server only, before sign-in).
create or replace function app.lookup_access_code(p_code text)
returns table (id uuid, name text, level text, language text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.level, c.language
  from public.cohorts c
  where c.access_code_hash = app.hash_access_code(p_code)
    and c.access_code_expires_at > now();
$$;

-- Joins the current user to the cohort the code opens.
create or replace function app.join_cohort_with_code(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_cohort uuid; v_user uuid := app.current_user_id();
begin
  if v_user is null then raise exception 'not signed in'; end if;
  select id into v_cohort from app.lookup_access_code(p_code);
  if v_cohort is null then raise exception 'invalid or expired access code'; end if;
  insert into public.cohort_members (cohort_id, user_id) values (v_cohort, v_user)
  on conflict do nothing;
  return v_cohort;
end $$;

-- Audit: facilitators and admins record access to participant data.
create or replace function app.log_access(p_action text, p_cohort uuid, p_subject uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (actor_id, action, cohort_id, subject_user_id)
  values (app.current_user_id(), p_action, p_cohort, p_subject);
$$;

-- Real deletion with cascade of everything the app owns for the current user.
-- The Neon Auth user itself is deleted by the server through Neon Auth.
create or replace function app.delete_my_data()
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid := app.current_user_id();
begin
  if v_user is null then raise exception 'not signed in'; end if;
  delete from public.participant_notes where user_id = v_user;
  delete from public.attempts where user_id = v_user;
  delete from public.consents where user_id = v_user;
  delete from public.cohort_members where user_id = v_user;
  delete from public.cohort_facilitators where user_id = v_user;
  delete from public.profiles where id = v_user;
end $$;

-- Retention: cohort data past ends_on + retention_months, and expired public results.
create or replace function app.run_retention()
returns table (attempts_deleted int, public_results_deleted int)
language plpgsql security definer set search_path = public as $$
declare a int; p int;
begin
  with due as (
    select id from public.cohorts
    where ends_on is not null and (ends_on + (retention_months || ' months')::interval) < now()
  ), del as (
    delete from public.attempts where cohort_id in (select id from due) returning 1
  ) select count(*) into a from del;
  with del as (
    delete from public.public_results where expires_at < now() returning 1
  ) select count(*) into p from del;
  return query select a, p;
end $$;
