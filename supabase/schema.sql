-- Yaagvi's Learning World - Supabase Free Tier schema
-- Run this in Supabase SQL Editor after creating the project.

create table if not exists public.guardian_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  guardian_name text not null,
  relationship text not null,
  email text not null,
  phone text,
  parent_pin text not null check (parent_pin ~ '^[0-9]{4}$'),
  consent_accepted boolean not null default false,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_idx integer not null default 0,
  age_group text not null default 'early',
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null references public.child_profiles(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

alter table public.guardian_profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.child_progress enable row level security;

drop policy if exists "guardians_select_own" on public.guardian_profiles;
create policy "guardians_select_own"
on public.guardian_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "guardians_insert_own" on public.guardian_profiles;
create policy "guardians_insert_own"
on public.guardian_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "guardians_update_own" on public.guardian_profiles;
create policy "guardians_update_own"
on public.guardian_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "child_profiles_select_own" on public.child_profiles;
create policy "child_profiles_select_own"
on public.child_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "child_profiles_insert_own" on public.child_profiles;
create policy "child_profiles_insert_own"
on public.child_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "child_profiles_update_own" on public.child_profiles;
create policy "child_profiles_update_own"
on public.child_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "child_profiles_delete_own" on public.child_profiles;
create policy "child_profiles_delete_own"
on public.child_profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "child_progress_select_own" on public.child_progress;
create policy "child_progress_select_own"
on public.child_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "child_progress_insert_own" on public.child_progress;
create policy "child_progress_insert_own"
on public.child_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "child_progress_update_own" on public.child_progress;
create policy "child_progress_update_own"
on public.child_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "child_progress_delete_own" on public.child_progress;
create policy "child_progress_delete_own"
on public.child_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);
