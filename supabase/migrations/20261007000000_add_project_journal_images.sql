alter table public.project_journal
  add column if not exists images text[] not null default '{}'::text[];
