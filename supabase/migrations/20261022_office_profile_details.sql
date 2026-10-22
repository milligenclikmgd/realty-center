-- Extended office profile fields used by the admin office creation form.
-- Existing records remain valid; these fields are optional.
alter table public.offices add column if not exists mobile_phone text;
alter table public.offices add column if not exists landline_phone text;
alter table public.offices add column if not exists work_hours text;
alter table public.offices add column if not exists description text;
alter table public.offices add column if not exists latitude numeric(9,6);
alter table public.offices add column if not exists longitude numeric(9,6);

alter table public.offices drop constraint if exists offices_mobile_phone_format;
alter table public.offices add constraint offices_mobile_phone_format
  check (mobile_phone is null or mobile_phone ~ '^05[0-9]{9}$');

alter table public.offices drop constraint if exists offices_landline_phone_format;
alter table public.offices add constraint offices_landline_phone_format
  check (landline_phone is null or landline_phone ~ '^0[2-4][0-9]{9}$');
