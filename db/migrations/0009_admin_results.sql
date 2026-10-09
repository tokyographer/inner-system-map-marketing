-- Admin "All results": one admin-only view over public opt-in results and
-- cohort attempts. public_results stays unreadable by app_user; this function
-- is the only path, and it refuses anyone who is not an admin.

alter table public.public_results add column name text check (name is null or length(name) between 1 and 120);

create or replace function app.admin_results(
  p_id uuid default null,
  p_source text default null,
  p_cohort uuid default null,
  p_locale text default null,
  p_from timestamptz default null,
  p_to timestamptz default null
)
returns table (
  source text, id uuid, completed_at timestamptz, name text, email text, locale text, form text,
  cohort_id uuid, cohort_name text, user_id uuid, duration_seconds int, responses jsonb, scores jsonb
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not app.is_admin() then raise exception 'admin only'; end if;
  return query
  select x.* from (
    select 'public'::text, r.id, r.created_at, r.name, r.email, r.locale, r.form::text,
           null::uuid, null::text, null::uuid, null::int, r.responses, r.scores
    from public.public_results r
    where r.expires_at > now()
    union all
    select 'cohort'::text, a.id, a.completed_at, coalesce(nullif(u.name, ''), p.display_name), u.email, a.locale, a.form::text,
           a.cohort_id, c.name, a.user_id, a.duration_seconds, a.responses, a.scores
    from public.attempts a
    join public.cohorts c on c.id = a.cohort_id
    left join public.profiles p on p.id = a.user_id
    left join neon_auth."user" u on u.id = a.user_id
  ) as x(source, id, completed_at, name, email, locale, form, cohort_id, cohort_name, user_id, duration_seconds, responses, scores)
  where (p_id is null or x.id = p_id)
    and (p_source is null or x.source = p_source)
    and (p_cohort is null or x.cohort_id = p_cohort)
    and (p_locale is null or x.locale = p_locale)
    and (p_from is null or x.completed_at >= p_from)
    and (p_to is null or x.completed_at < p_to)
  order by x.completed_at desc;
end $$;

revoke execute on function app.admin_results(uuid, text, uuid, text, timestamptz, timestamptz) from public;
grant execute on function app.admin_results(uuid, text, uuid, text, timestamptz, timestamptz) to app_user;
