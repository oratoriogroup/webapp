-- "Save and continue later" drafts. Only a SHA-256 hash of the resume token is
-- stored, so the database alone cannot be used to open anyone's draft.
create table if not exists public.registration_drafts (
  token_hash text primary key,
  answers jsonb not null default '{}'::jsonb,
  step int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default '2026-11-13 00:00:00+01'
);
create index if not exists registration_drafts_expires_idx on public.registration_drafts (expires_at);
alter table public.registration_drafts enable row level security;
