-- The role guard must not block the service connection (no request identity),
-- which is how the first admin is bootstrapped. App requests always set app.user_id.
create or replace function app.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and app.current_user_id() is not null and not app.is_admin() then
    raise exception 'role can only be changed by an admin';
  end if;
  return new;
end $$;
