-- Restricted role the server switches to per request (SET LOCAL ROLE app_user),
-- plus Row Level Security. Deny by default on every table.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'app_user') then
    create role app_user nologin;
  end if;
end $$;

-- The connecting (owner) role must be able to SET ROLE app_user.
do $$ begin execute format('grant app_user to %I', current_user); end $$;

grant usage on schema public, app to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;
grant usage, select on all sequences in schema public to app_user;
grant execute on all functions in schema app to app_user;
-- Server-only functions: never callable as app_user.
revoke execute on function app.run_retention() from app_user;
revoke execute on function app.lookup_access_code(text) from app_user;
revoke execute on function app.hash_access_code(text) from app_user;
revoke all on public.public_results from app_user;
revoke all on public.audit_log from app_user;
grant select on public.audit_log to app_user;

alter table public.profiles enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_facilitators enable row level security;
alter table public.cohort_members enable row level security;
alter table public.consents enable row level security;
alter table public.attempts enable row level security;
alter table public.participant_notes enable row level security;
alter table public.public_results enable row level security;
alter table public.audit_log enable row level security;
alter table public.app_settings enable row level security;

-- profiles
create policy profiles_self_select on public.profiles for select to app_user using (id = app.current_user_id());
create policy profiles_self_insert on public.profiles for insert to app_user with check (id = app.current_user_id() and role = 'participant');
create policy profiles_self_update on public.profiles for update to app_user using (id = app.current_user_id()) with check (id = app.current_user_id());
create policy profiles_facilitator_select on public.profiles for select to app_user using (
  exists (select 1 from public.cohort_members m where m.user_id = profiles.id and app.is_facilitator_of(m.cohort_id))
);
create policy profiles_admin_all on public.profiles for all to app_user using (app.is_admin()) with check (app.is_admin());

-- cohorts
create policy cohorts_member_select on public.cohorts for select to app_user using (app.is_member_of(id));
create policy cohorts_facilitator_select on public.cohorts for select to app_user using (app.is_facilitator_of(id));
create policy cohorts_admin_all on public.cohorts for all to app_user using (app.is_admin()) with check (app.is_admin());

-- cohort_facilitators
create policy cf_self_select on public.cohort_facilitators for select to app_user using (user_id = app.current_user_id());
create policy cf_admin_all on public.cohort_facilitators for all to app_user using (app.is_admin()) with check (app.is_admin());

-- cohort_members (insert only through app.join_cohort_with_code)
create policy cm_self_select on public.cohort_members for select to app_user using (user_id = app.current_user_id());
create policy cm_facilitator_select on public.cohort_members for select to app_user using (app.is_facilitator_of(cohort_id));
create policy cm_admin_all on public.cohort_members for all to app_user using (app.is_admin()) with check (app.is_admin());

-- consents
create policy consents_self_select on public.consents for select to app_user using (user_id = app.current_user_id());
create policy consents_self_insert on public.consents for insert to app_user with check (user_id = app.current_user_id());
create policy consents_facilitator_select on public.consents for select to app_user using (
  kind = 'facilitator_visibility' and cohort_id is not null and app.is_facilitator_of(cohort_id)
);
create policy consents_admin_select on public.consents for select to app_user using (app.is_admin());

-- attempts: own rows; facilitators only with an active visibility consent
create policy attempts_self_select on public.attempts for select to app_user using (user_id = app.current_user_id());
create policy attempts_self_insert on public.attempts for insert to app_user with check (
  user_id = app.current_user_id() and app.is_member_of(cohort_id)
  and app.has_consent(app.current_user_id(), cohort_id, 'store_results')
);
create policy attempts_self_delete on public.attempts for delete to app_user using (user_id = app.current_user_id());
create policy attempts_facilitator_select on public.attempts for select to app_user using (
  app.is_facilitator_of(cohort_id) and app.has_consent(user_id, cohort_id, 'facilitator_visibility')
);
create policy attempts_admin_select on public.attempts for select to app_user using (app.is_admin());

-- participant_notes
create policy notes_self_all on public.participant_notes for all to app_user using (user_id = app.current_user_id()) with check (user_id = app.current_user_id());
create policy notes_facilitator_select on public.participant_notes for select to app_user using (
  shared_with_facilitator
  and exists (select 1 from public.attempts a where a.id = participant_notes.attempt_id
              and app.is_facilitator_of(a.cohort_id)
              and app.has_consent(a.user_id, a.cohort_id, 'facilitator_visibility'))
);

-- public_results: server (owner) only. audit_log: admin read. app_settings: admin.
create policy audit_admin_select on public.audit_log for select to app_user using (app.is_admin());
create policy settings_admin_all on public.app_settings for all to app_user using (app.is_admin()) with check (app.is_admin());
