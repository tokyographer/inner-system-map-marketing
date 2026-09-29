-- Row Level Security. Deny by default on every table; policies below are the
-- only access paths. The service role bypasses RLS and is used only by server
-- code for public_results, retention and access-code lookup.

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
create policy profiles_self_select on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_facilitator_select on public.profiles for select using (
  exists (select 1 from public.cohort_members m where m.user_id = profiles.id and public.is_facilitator_of(m.cohort_id))
);
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- cohorts
create policy cohorts_member_select on public.cohorts for select using (public.is_member_of(id));
create policy cohorts_facilitator_select on public.cohorts for select using (public.is_facilitator_of(id));
create policy cohorts_admin_all on public.cohorts for all using (public.is_admin()) with check (public.is_admin());

-- cohort_facilitators
create policy cf_self_select on public.cohort_facilitators for select using (user_id = auth.uid());
create policy cf_admin_all on public.cohort_facilitators for all using (public.is_admin()) with check (public.is_admin());

-- cohort_members (insert only through join_cohort_with_code)
create policy cm_self_select on public.cohort_members for select using (user_id = auth.uid());
create policy cm_facilitator_select on public.cohort_members for select using (public.is_facilitator_of(cohort_id));
create policy cm_admin_all on public.cohort_members for all using (public.is_admin()) with check (public.is_admin());

-- consents
create policy consents_self_select on public.consents for select using (user_id = auth.uid());
create policy consents_self_insert on public.consents for insert with check (user_id = auth.uid());
create policy consents_facilitator_select on public.consents for select using (
  kind = 'facilitator_visibility' and cohort_id is not null and public.is_facilitator_of(cohort_id)
);
create policy consents_admin_select on public.consents for select using (public.is_admin());

-- attempts: own rows; facilitators only with an active visibility consent
create policy attempts_self_select on public.attempts for select using (user_id = auth.uid());
create policy attempts_self_insert on public.attempts for insert with check (
  user_id = auth.uid() and public.is_member_of(cohort_id)
  and public.has_consent(auth.uid(), cohort_id, 'store_results')
);
create policy attempts_self_delete on public.attempts for delete using (user_id = auth.uid());
create policy attempts_facilitator_select on public.attempts for select using (
  public.is_facilitator_of(cohort_id) and public.has_consent(user_id, cohort_id, 'facilitator_visibility')
);
create policy attempts_admin_select on public.attempts for select using (public.is_admin());

-- participant_notes
create policy notes_self_all on public.participant_notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_facilitator_select on public.participant_notes for select using (
  shared_with_facilitator
  and exists (select 1 from public.attempts a where a.id = participant_notes.attempt_id
              and public.is_facilitator_of(a.cohort_id)
              and public.has_consent(a.user_id, a.cohort_id, 'facilitator_visibility'))
);

-- public_results: service role only (no policies → no access for anon/authenticated)
-- audit_log: admin read only
create policy audit_admin_select on public.audit_log for select using (public.is_admin());

-- app_settings: admin only
create policy settings_admin_all on public.app_settings for all using (public.is_admin()) with check (public.is_admin());
