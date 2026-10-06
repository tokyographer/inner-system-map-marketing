-- Marketing (this repo only): source attribution on opt-in public results.
-- Adds nullable columns to the core table public_results; core columns,
-- constraints and policies are untouched. The values are deleted with the row
-- (delete link, retention), so no retention change is needed.

alter table public.public_results
  add column utm_source text check (utm_source ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  add column utm_medium text check (utm_medium ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  add column utm_campaign text check (utm_campaign ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  add column ref_code text check (ref_code ~ '^[a-z0-9][a-z0-9-]{1,31}$');
