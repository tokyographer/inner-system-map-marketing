-- Add Turkish to the allowed locales.
alter table public.profiles drop constraint if exists profiles_locale_check;
alter table public.profiles add constraint profiles_locale_check check (locale in ('en', 'es', 'ro', 'tr'));
alter table public.cohorts drop constraint if exists cohorts_language_check;
alter table public.cohorts add constraint cohorts_language_check check (language in ('en', 'es', 'ro', 'tr'));
