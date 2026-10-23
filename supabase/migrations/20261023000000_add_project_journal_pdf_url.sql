alter table public.project_journal
  add column if not exists pdf_url text;
