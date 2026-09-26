create extension if not exists pgcrypto;
create table if not exists public.assessment_trainers (id uuid primary key default gen_random_uuid(), name text not null, studio_group text not null default 'Other', photo_url text, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (name, studio_group));
create table if not exists public.trainer_assessments (id uuid primary key default gen_random_uuid(), form_type text not null check (form_type in ('power_cycle', 'fit_lab')), trainer_name text not null, evaluator_name text not null, location text not null, session_name text not null, class_date timestamptz not null, scores jsonb not null default '{}'::jsonb, sections jsonb not null default '{}'::jsonb, total_score numeric(6,2) not null, performance_band text not null, key_strengths text not null default '', areas_for_improvement text not null default '', coaching_action_plan text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists trainer_assessments_form_date_idx on public.trainer_assessments (form_type, class_date desc);
create index if not exists trainer_assessments_trainer_idx on public.trainer_assessments (trainer_name);
create table if not exists public.assessment_settings (form_type text not null check (form_type in ('power_cycle', 'fit_lab')), setting_key text not null, setting_value text not null default '', updated_at timestamptz not null default now(), primary key (form_type, setting_key));
insert into storage.buckets (id, name, public) values ('assessment-media', 'assessment-media', true) on conflict (id) do update set public = true;
alter table public.assessment_trainers enable row level security;
alter table public.trainer_assessments enable row level security;
alter table public.assessment_settings enable row level security;
-- Access stays server-side through the service role; no anonymous table policies.

insert into public.assessment_trainers (name, studio_group) values
  ('Anisha Shah', 'Other'), ('Atulan Purohit', 'Other'), ('Karanvir Bhatia', 'Other'),
  ('Mrigakshi Jaiswal', 'Other'), ('Pranjali Jain', 'Other'), ('Reshma Sharma', 'Other'),
  ('Richard D''Costa', 'Other'), ('Rohan Dahima', 'Other'), ('Karan Bhatia', 'Other'),
  ('Vivaran Dhasmana', 'Other'), ('Cauveri Vikrant', 'Other'), ('Simonelle De Vitre', 'Other'),
  ('Simran Dutt', 'Other'), ('Anmol Sharma', 'Other'), ('Bret Saldanha', 'Other'),
  ('Raunak Khemuka', 'Other'), ('Pushyank Nahar', 'Kenkere'), ('Kajol Kanchan', 'Kenkere'),
  ('Siddhartha Kusuma', 'Kenkere'), ('Shruti Kulkarni', 'Kenkere'), ('Chaitanya Nahar', 'Kenkere')
on conflict (name, studio_group) do nothing;
