-- WhatsApp delivery of public results: the number the person gave, with their consent, so the
-- institute can reply on WhatsApp. Lives on the same row, so the delete link and retention remove it.
-- Still unreadable by app_user; app.admin_results() does not return it yet.

alter table public.public_results add column whatsapp text check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$');
