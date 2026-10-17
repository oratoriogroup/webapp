-- Oratorio webapp schema. All access goes through the Next.js server with the
-- database connection, so RLS is ON with no public policies: the publishable
-- key cannot read or write these tables through the REST API.

create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique not null,
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  email text not null,
  age_range text,
  location text,
  church text,
  connect_type text not null check (connect_type in ('attend','online','volunteer','partner')),
  party_size text,
  volunteer_kind text,
  answers jsonb not null default '{}'::jsonb,
  email_sent_at timestamptz,
  email_error text,
  gform_status text,
  gform_error text,
  checked_in_at timestamptz,
  ip text,
  user_agent text
);
create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_email_idx on public.registrations (lower(email));
create index if not exists registrations_connect_idx on public.registrations (connect_type);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins enable row level security;

insert into public.site_settings (key, value) values
  ('livestream_url', ''),
  ('featured_video_url', ''),
  ('registration_open', 'true')
on conflict (key) do nothing;

insert into public.site_settings (key, value) values ('getdp_url', '') on conflict (key) do nothing;
