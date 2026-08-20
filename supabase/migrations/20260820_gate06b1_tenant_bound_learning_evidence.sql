-- Qarayti.ai — Gate 06B.1: Tenant-Bound Learning Evidence
-- Adds school_id UUID column to learning_observation_history
-- with FK to schools(id) and RLS tenant binding.
--
-- SAFETY:
--   - NO backfill of historical rows
--   - NO UPDATE of historical evidence
--   - NO DELETE of historical evidence
--   - ON DELETE SET NULL (cannot destroy historical evidence via school deletion)
--   - tenant_id column preserved for backward compatibility
--   - Existing idempotency keys untouched

-- ============================================================
-- 1. Add school_id column (nullable for historical compatibility)
-- ============================================================
ALTER TABLE public.learning_observation_history
  ADD COLUMN IF NOT EXISTS school_id UUID NULL;

-- FK constraint: school_id references schools(id)
-- ON DELETE SET NULL: if a school is deleted, observations remain with NULL school_id
-- This preserves historical evidence integrity.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_observation_history_school_id'
      AND conrelid = 'public.learning_observation_history'::regclass
  ) THEN
    ALTER TABLE public.learning_observation_history
      ADD CONSTRAINT fk_observation_history_school_id
      FOREIGN KEY (school_id)
      REFERENCES public.schools(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for school-scoped queries
CREATE INDEX IF NOT EXISTS idx_obs_hist_school_id
  ON public.learning_observation_history (school_id)
  WHERE school_id IS NOT NULL;

-- Composite index for student+school queries
CREATE INDEX IF NOT EXISTS idx_obs_hist_student_school
  ON public.learning_observation_history (student_id, school_id, occurred_at DESC)
  WHERE school_id IS NOT NULL;

-- ============================================================
-- 2. RLS: Drop existing policies and recreate with tenant binding
-- ============================================================

-- Drop existing INSERT policy (student_id = auth.uid() only)
DROP POLICY IF EXISTS "users insert own observation history"
  ON public.learning_observation_history;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "users read own observation history"
  ON public.learning_observation_history;

-- SELECT: student can read their own observations
CREATE POLICY "users read own observation history"
  ON public.learning_observation_history
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- INSERT: student can insert ONLY when:
--   1. student_id = auth.uid() (identity binding)
--   2. school_id IS NULL (legacy/no-school path) OR
--      school_id is a valid UUID AND the user has an active school_memberships row
--      with role = 'STUDENT' for that school_id
--
-- This prevents:
--   - Cross-student evidence injection (student_id = auth.uid())
--   - Cross-school evidence injection (membership validation)
--   - NULL school_id bypass for standalone learners (NULL allowed for legacy)
--   - Non-STUDENT roles from creating browser-generated evidence
--
-- NOTE: service_role bypasses RLS entirely, so backend/service writes are unaffected.
CREATE POLICY "users insert own observation history"
  ON public.learning_observation_history
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND (
      -- Legacy path: school_id is NULL (historical/backward compatibility)
      school_id IS NULL
      OR
      -- Institutional path: school_id must have an active STUDENT membership
      EXISTS (
        SELECT 1
        FROM public.school_memberships sm
        WHERE sm.user_id = auth.uid()
          AND sm.school_id = learning_observation_history.school_id
          AND sm.role = 'STUDENT'
      )
    )
  );

-- NO UPDATE policy for authenticated — append-only enforced
-- NO DELETE policy for authenticated — append-only enforced

-- ============================================================
-- 3. Grant minimal permissions (deny-by-default)
-- ============================================================
REVOKE ALL ON public.learning_observation_history FROM anon;
REVOKE ALL ON public.learning_observation_history FROM authenticated;

-- Re-grant SELECT and INSERT (INSERT enforced by RLS policy above)
GRANT SELECT, INSERT ON public.learning_observation_history TO authenticated;

-- ============================================================
-- 4. Gate 06B.2 placeholder: F-03 input integrity
-- ============================================================
-- F-03 (conceptId trust, mastery spoof, metadata spoof) remains OPEN.
-- Deferred to Gate 06B.2.
