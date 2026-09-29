-- Functions are executable by PUBLIC by default; revoking from app_user alone
-- changes nothing. Lock the server-only functions down properly.
revoke execute on function app.run_retention() from public, app_user;
revoke execute on function app.lookup_access_code(text) from public, app_user;
revoke execute on function app.hash_access_code(text) from public, app_user;
revoke all on public.public_results from public, app_user;
revoke all on public.audit_log from public, app_user;
grant select on public.audit_log to app_user;
