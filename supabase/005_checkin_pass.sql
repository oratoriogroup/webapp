-- Check-in pass: one unguessable code per registration, shown as a QR code.
alter table public.registrations add column if not exists checkin_code text;
alter table public.registrations add column if not exists checked_in_by text;
update public.registrations set checkin_code = replace(replace(encode(gen_random_bytes(16), 'base64'), '+', '-'), '/', '_')
  where checkin_code is null;
update public.registrations set checkin_code = rtrim(checkin_code, '=') where checkin_code like '%=';
create unique index if not exists registrations_checkin_code_unique on public.registrations (checkin_code);
