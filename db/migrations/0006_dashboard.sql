-- Dashboard helpers. Admin-only user lookup by email (neon_auth.user is not
-- readable by app_user) and a role helper for facilitators.

create or replace function app.is_facilitator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = app.current_user_id() and role in ('facilitator', 'admin'));
$$;

create or replace function app.find_user_by_email(p_email text)
returns table (id uuid, email text, name text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not app.is_admin() then raise exception 'admin only'; end if;
  return query select u.id, u.email, u.name from neon_auth."user" u where lower(u.email) = lower(trim(p_email));
end $$;

-- Admin: ensure a profile exists for a user found by email, with a role.
create or replace function app.ensure_profile(p_user uuid, p_role public.app_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not app.is_admin() then raise exception 'admin only'; end if;
  insert into public.profiles (id, role) values (p_user, p_role)
  on conflict (id) do update set role = excluded.role where public.profiles.role <> 'admin';
end $$;

-- Facilitators need the audit log to be insert-only through app.log_access (already security definer).
grant execute on function app.is_facilitator() to app_user;
grant execute on function app.find_user_by_email(text) to app_user;
grant execute on function app.ensure_profile(uuid, public.app_role) to app_user;
