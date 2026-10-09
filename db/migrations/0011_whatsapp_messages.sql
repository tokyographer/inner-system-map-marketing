-- Admin WhatsApp inbox: one conversation per number, holding the messages people send to the
-- business number and the institute's replies. The conversation id is opaque: it is used in admin
-- URLs and as the audit-log subject, so the number never appears in either.
-- The webhook writes conversations, inbound messages and delivery statuses through the service
-- connection. Admins read everything, insert their own outbound replies and delete conversations on
-- request; nobody else sees a row and nobody updates one.

create table public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  wa_number text not null unique check (wa_number ~ '^\+[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now()
);

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations (id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  wa_message_id text unique check (length(wa_message_id) <= 200),
  kind text not null default 'text' check (kind ~ '^[a-z_]{1,30}$'),
  body text check (length(body) <= 4096),
  profile_name text check (length(profile_name) <= 120),
  status text check (status in ('sent', 'delivered', 'read', 'failed')),
  sent_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index whatsapp_messages_thread_idx on public.whatsapp_messages (conversation_id, created_at desc);
create index whatsapp_messages_expires_idx on public.whatsapp_messages (expires_at);

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
revoke all on public.whatsapp_conversations, public.whatsapp_messages from public, app_user;
grant select, delete on public.whatsapp_conversations to app_user;
grant select, insert on public.whatsapp_messages to app_user;

create policy whatsapp_conv_admin_select on public.whatsapp_conversations for select to app_user using (app.is_admin());
-- Erasure requests: an admin deletes a whole conversation; its messages go with it.
create policy whatsapp_conv_admin_delete on public.whatsapp_conversations for delete to app_user using (app.is_admin());
create policy whatsapp_msg_admin_select on public.whatsapp_messages for select to app_user using (app.is_admin());
create policy whatsapp_msg_admin_reply on public.whatsapp_messages for insert to app_user
  with check (app.is_admin() and direction = 'out' and sent_by = app.current_user_id());

-- Retention, called by the nightly cron through the service connection: expired messages, then
-- conversations left empty. Returns the number of messages deleted.
create or replace function app.run_whatsapp_retention()
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with del as (delete from public.whatsapp_messages where expires_at < now() returning 1) select count(*) into n from del;
  delete from public.whatsapp_conversations c where not exists (select 1 from public.whatsapp_messages m where m.conversation_id = c.id);
  return n;
end $$;
revoke execute on function app.run_whatsapp_retention() from public, app_user;
