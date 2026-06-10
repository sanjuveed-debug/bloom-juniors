-- ============================================================
-- Bloom Juniors — Teacher Onboarding Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add columns to guardian_profiles FIRST (RLS policy below references school_id)
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS teacher_role TEXT;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.child_profiles ADD COLUMN IF NOT EXISTS class_id UUID;

-- 2. Schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- 2b. Classes table — the real isolation boundary inside a school
CREATE TABLE IF NOT EXISTS public.school_classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  age_group   TEXT NOT NULL DEFAULT 'early',
  class_code  TEXT UNIQUE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, name)
);

ALTER TABLE public.school_classes ADD COLUMN IF NOT EXISTS class_code TEXT;

UPDATE public.school_classes
SET class_code = UPPER(
  SUBSTRING(REPLACE(id::TEXT, '-', '') FROM 1 FOR 4) ||
  '-' ||
  SUBSTRING(MD5(id::TEXT) FROM 1 FOR 3)
)
WHERE class_code IS NULL OR class_code = '';

CREATE UNIQUE INDEX IF NOT EXISTS school_classes_class_code_key
  ON public.school_classes (class_code)
  WHERE class_code IS NOT NULL;

ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;

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

-- 3b. FKs for class-scoped teacher and pupil rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'guardian_profiles_class_id_fkey'
  ) THEN
    ALTER TABLE public.guardian_profiles
      ADD CONSTRAINT guardian_profiles_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.school_classes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'child_profiles_school_id_fkey'
  ) THEN
    ALTER TABLE public.child_profiles
      ADD CONSTRAINT child_profiles_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'child_profiles_class_id_fkey'
  ) THEN
    ALTER TABLE public.child_profiles
      ADD CONSTRAINT child_profiles_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.school_classes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3c. Backfill class rows from existing teacher profiles
INSERT INTO public.school_classes (school_id, name, age_group, created_by)
SELECT DISTINCT gp.school_id, COALESCE(NULLIF(gp.class_name, ''), 'Class'), 'early', gp.user_id
FROM public.guardian_profiles gp
WHERE gp.school_id IS NOT NULL
ON CONFLICT (school_id, name) DO NOTHING;

UPDATE public.guardian_profiles gp
SET class_id = sc.id
FROM public.school_classes sc
WHERE gp.school_id = sc.school_id
  AND COALESCE(NULLIF(gp.class_name, ''), 'Class') = sc.name
  AND gp.class_id IS NULL;

UPDATE public.child_profiles cp
SET school_id = gp.school_id,
    class_id = gp.class_id
FROM public.guardian_profiles gp
WHERE cp.user_id = gp.user_id
  AND gp.school_id IS NOT NULL
  AND cp.school_id IS NULL;

-- 6. Daily class lesson assignments
CREATE TABLE IF NOT EXISTS public.class_lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.school_classes(id) ON DELETE CASCADE,
  class_name  TEXT NOT NULL DEFAULT '',
  lesson_date DATE NOT NULL,
  module_ids  TEXT[] NOT NULL DEFAULT '{}',
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, class_name, lesson_date)
);

-- Existing deployments already have class_lessons, so CREATE TABLE IF NOT EXISTS
-- will not add new columns. Keep these explicit ALTERs for idempotent upgrades.
ALTER TABLE public.class_lessons ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE public.class_lessons ADD COLUMN IF NOT EXISTS class_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.class_lessons ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE public.class_lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'class_lessons_class_id_fkey'
  ) THEN
    ALTER TABLE public.class_lessons
      ADD CONSTRAINT class_lessons_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES public.school_classes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS class_lessons_class_id_lesson_date_key
  ON public.class_lessons (class_id, lesson_date)
  WHERE class_id IS NOT NULL;

UPDATE public.class_lessons cl
SET class_id = sc.id
FROM public.school_classes sc
WHERE cl.class_id IS NULL
  AND cl.school_id = sc.school_id
  AND cl.class_name = sc.name;

ALTER TABLE public.class_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "class_lessons_member_read" ON public.class_lessons;
DROP POLICY IF EXISTS "class_lessons_member_write" ON public.class_lessons;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'class_lessons' AND policyname = 'class_lessons_member_read'
  ) THEN
    CREATE POLICY "class_lessons_member_read" ON public.class_lessons
      FOR SELECT USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = class_lessons.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'class_lessons' AND policyname = 'class_lessons_member_write'
  ) THEN
    CREATE POLICY "class_lessons_member_write" ON public.class_lessons
      FOR ALL USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = class_lessons.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      )
      WITH CHECK (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = class_lessons.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      );
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

-- 4b. RLS: school members can see classes in their own school; admins can manage all classes in school
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'school_classes' AND policyname = 'school_classes_member_read'
  ) THEN
    CREATE POLICY "school_classes_member_read" ON public.school_classes
      FOR SELECT USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'school_classes' AND policyname = 'school_classes_member_write'
  ) THEN
    CREATE POLICY "school_classes_member_write" ON public.school_classes
      FOR ALL USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
      )
      WITH CHECK (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
      );
  END IF;
END $$;

-- 4c. RLS: class-scoped pupil/profile/progress access.
-- Existing owner policies can remain; these add school/class membership access.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'child_profiles_class_member_read'
  ) THEN
    CREATE POLICY "child_profiles_class_member_read" ON public.child_profiles
      FOR SELECT USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = child_profiles.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'child_profiles_class_member_write'
  ) THEN
    CREATE POLICY "child_profiles_class_member_write" ON public.child_profiles
      FOR ALL USING (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = child_profiles.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      )
      WITH CHECK (
        school_id IN (
          SELECT school_id FROM public.guardian_profiles
          WHERE user_id = auth.uid() AND school_id IS NOT NULL
        )
        AND (
          class_id IN (
            SELECT class_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND class_id IS NOT NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.guardian_profiles gp
            WHERE gp.user_id = auth.uid()
              AND gp.school_id = child_profiles.school_id
              AND gp.teacher_role = 'admin'
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'child_progress' AND policyname = 'child_progress_class_member_read'
  ) THEN
    CREATE POLICY "child_progress_class_member_read" ON public.child_progress
      FOR SELECT USING (
        profile_id IN (
          SELECT cp.id FROM public.child_profiles cp
          WHERE cp.school_id IN (
            SELECT school_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND school_id IS NOT NULL
          )
          AND (
            cp.class_id IN (
              SELECT class_id FROM public.guardian_profiles
              WHERE user_id = auth.uid() AND class_id IS NOT NULL
            )
            OR EXISTS (
              SELECT 1 FROM public.guardian_profiles gp
              WHERE gp.user_id = auth.uid()
                AND gp.school_id = cp.school_id
                AND gp.teacher_role = 'admin'
            )
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'child_progress' AND policyname = 'child_progress_class_member_write'
  ) THEN
    CREATE POLICY "child_progress_class_member_write" ON public.child_progress
      FOR ALL USING (
        profile_id IN (
          SELECT cp.id FROM public.child_profiles cp
          WHERE cp.school_id IN (
            SELECT school_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND school_id IS NOT NULL
          )
          AND (
            cp.class_id IN (
              SELECT class_id FROM public.guardian_profiles
              WHERE user_id = auth.uid() AND class_id IS NOT NULL
            )
            OR EXISTS (
              SELECT 1 FROM public.guardian_profiles gp
              WHERE gp.user_id = auth.uid()
                AND gp.school_id = cp.school_id
                AND gp.teacher_role = 'admin'
            )
          )
        )
      )
      WITH CHECK (
        profile_id IN (
          SELECT cp.id FROM public.child_profiles cp
          WHERE cp.school_id IN (
            SELECT school_id FROM public.guardian_profiles
            WHERE user_id = auth.uid() AND school_id IS NOT NULL
          )
          AND (
            cp.class_id IN (
              SELECT class_id FROM public.guardian_profiles
              WHERE user_id = auth.uid() AND class_id IS NOT NULL
            )
            OR EXISTS (
              SELECT 1 FROM public.guardian_profiles gp
              WHERE gp.user_id = auth.uid()
                AND gp.school_id = cp.school_id
                AND gp.teacher_role = 'admin'
            )
          )
        )
      );
  END IF;
END $$;

-- 4d. Tighten original owner policies so school/class records cannot leak through historical ownership.
-- Home/parent profiles still use owner policies; classroom profiles use the class policies above.
DROP POLICY IF EXISTS "child_profiles_select_own" ON public.child_profiles;
CREATE POLICY "child_profiles_select_own"
ON public.child_profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id AND school_id IS NULL);

DROP POLICY IF EXISTS "child_profiles_insert_own" ON public.child_profiles;
CREATE POLICY "child_profiles_insert_own"
ON public.child_profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id AND school_id IS NULL);

DROP POLICY IF EXISTS "child_profiles_update_own" ON public.child_profiles;
CREATE POLICY "child_profiles_update_own"
ON public.child_profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id AND school_id IS NULL)
WITH CHECK ((SELECT auth.uid()) = user_id AND school_id IS NULL);

DROP POLICY IF EXISTS "child_profiles_delete_own" ON public.child_profiles;
CREATE POLICY "child_profiles_delete_own"
ON public.child_profiles
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id AND school_id IS NULL);

DROP POLICY IF EXISTS "child_progress_select_own" ON public.child_progress;
CREATE POLICY "child_progress_select_own"
ON public.child_progress
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND profile_id IN (
    SELECT id FROM public.child_profiles
    WHERE user_id = (SELECT auth.uid())
      AND school_id IS NULL
  )
);

DROP POLICY IF EXISTS "child_progress_insert_own" ON public.child_progress;
CREATE POLICY "child_progress_insert_own"
ON public.child_progress
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND profile_id IN (
    SELECT id FROM public.child_profiles
    WHERE user_id = (SELECT auth.uid())
      AND school_id IS NULL
  )
);

DROP POLICY IF EXISTS "child_progress_update_own" ON public.child_progress;
CREATE POLICY "child_progress_update_own"
ON public.child_progress
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND profile_id IN (
    SELECT id FROM public.child_profiles
    WHERE user_id = (SELECT auth.uid())
      AND school_id IS NULL
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND profile_id IN (
    SELECT id FROM public.child_profiles
    WHERE user_id = (SELECT auth.uid())
      AND school_id IS NULL
  )
);

DROP POLICY IF EXISTS "child_progress_delete_own" ON public.child_progress;
CREATE POLICY "child_progress_delete_own"
ON public.child_progress
FOR DELETE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND profile_id IN (
    SELECT id FROM public.child_profiles
    WHERE user_id = (SELECT auth.uid())
      AND school_id IS NULL
  )
);

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
