-- One registration per email address and one per phone number (any type).
-- phone_norm holds the number as international digits, e.g. 2348012345678.
alter table public.registrations add column if not exists phone_norm text;
update public.registrations
  set phone_norm = case
    when regexp_replace(whatsapp, '\D', '', 'g') ~ '^0\d{10}$' then '234' || substr(regexp_replace(whatsapp, '\D', '', 'g'), 2)
    else regexp_replace(whatsapp, '\D', '', 'g') end
  where phone_norm is null;
create unique index if not exists registrations_email_unique on public.registrations (lower(email));
create unique index if not exists registrations_phone_unique on public.registrations (phone_norm) where phone_norm is not null;
