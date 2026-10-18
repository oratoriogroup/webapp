-- Written testimonies submitted from the livestream page. Shown publicly only
-- after an admin approves them.
create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  location text,
  message text not null,
  approved boolean not null default false,
  approved_at timestamptz,
  ip text
);
create index if not exists testimonies_created_idx on public.testimonies (created_at desc);
create index if not exists testimonies_approved_idx on public.testimonies (approved, created_at desc);
alter table public.testimonies enable row level security;
