-- Marketing (this repo only): admins may write marketing_funnel_counts, only so
-- removing a partner can fold its counts into '-' (deletePartner), keeping
-- totals and stopping a later partner with the same code from inheriting them.
-- The public counter keeps writing on the service connection, never as app_user.
-- Additive only: new grants and policies on a marketing table.

grant insert, update, delete on public.marketing_funnel_counts to app_user;
create policy marketing_funnel_admin_insert on public.marketing_funnel_counts for insert to app_user with check (app.is_admin());
create policy marketing_funnel_admin_update on public.marketing_funnel_counts for update to app_user using (app.is_admin()) with check (app.is_admin());
create policy marketing_funnel_admin_delete on public.marketing_funnel_counts for delete to app_user using (app.is_admin());
