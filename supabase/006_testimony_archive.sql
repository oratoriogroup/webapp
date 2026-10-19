-- Testimonies can be archived (rejected) instead of deleted.
alter table public.testimonies add column if not exists archived boolean not null default false;
create index if not exists testimonies_queue_idx on public.testimonies (archived, approved, created_at desc);
