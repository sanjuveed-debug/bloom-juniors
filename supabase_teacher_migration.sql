-- ============================================================
-- Bloom Juniors — Teacher Onboarding Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add columns to guardian_profiles FIRST (RLS policy below references school_id)
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS teacher_role TEXT;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS class_name TEXT;

-- 2. Schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 3. FK from guardian_profiles.school_id → schools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'guardian_profiles_school_id_fkey'
  ) THEN
    ALTER TABLE public.guardian_profiles
      ADD CONSTRAINT guardian_profiles_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. RLS: teachers can read their own school
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'schools_read_member'
  ) THEN
    CREATE POLICY "schools_read_member" ON public.schools
      FOR SELECT USING (
        id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
      );
  END IF;
END $$;

-- 5. Teacher invites table
CREATE TABLE IF NOT EXISTS public.teacher_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,
  invited_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teacher_invites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teacher_invites' AND policyname = 'invites_read_own'
  ) THEN
    CREATE POLICY "invites_read_own" ON public.teacher_invites
      FOR SELECT USING (invited_by = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'teacher_invites' AND policyname = 'invites_insert_own'
  ) THEN
    CREATE POLICY "invites_insert_own" ON public.teacher_invites
      FOR INSERT WITH CHECK (invited_by = auth.uid());
  END IF;
END $$;
