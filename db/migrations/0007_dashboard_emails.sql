-- Email lookups for the dashboard, scoped and guarded inside SQL:
--   member_emails: admin only (identified export and admin views)
--   facilitator_emails: admins and the cohort's own facilitators (to show who is assigned)
create or replace function app.member_emails(p_cohort uuid)
returns table (id uuid, email text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not app.is_admin() then raise exception 'admin only'; end if;
  return query select u.id, u.email from neon_auth."user" u join public.cohort_members m on m.user_id = u.id where m.cohort_id = p_cohort;
end $$;

create or replace function app.facilitator_emails(p_cohort uuid)
returns table (id uuid, email text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (app.is_admin() or app.is_facilitator_of(p_cohort)) then raise exception 'not allowed'; end if;
  return query select u.id, u.email from neon_auth."user" u join public.cohort_facilitators f on f.user_id = u.id where f.cohort_id = p_cohort;
end $$;

grant execute on function app.member_emails(uuid) to app_user;
grant execute on function app.facilitator_emails(uuid) to app_user;
