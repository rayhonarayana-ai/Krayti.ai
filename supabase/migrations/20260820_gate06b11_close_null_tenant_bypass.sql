-- Qarayti.ai — Gate 06B.1.1: Close NULL Tenant Bypass + Multi-School Fail-Closed
-- CORRECTIVE MIGRATION — replaces INSERT policy from Gate 06B.1
--
-- Assumption: 20260820_gate06b1_tenant_bound_learning_evidence.sql is already applied.
-- Do NOT modify historical migrations.
-- Do NOT modify historical evidence rows.
-- Do NOT backfill.
--
-- SAFETY:
--   - Historical rows with school_id NULL remain untouched and readable
--   - New authenticated INSERTs MUST provide school_id IS NOT NULL
--   - RLS validates membership for the provided school_id

-- ============================================================
-- 1. Drop the Gate 06B.1 INSERT policy (NULL bypass exists)
-- ============================================================
DROP POLICY IF EXISTS "users insert own observation history"
  ON public.learning_observation_history;

-- ============================================================
-- 2. Recreate INSERT policy — NO NULL bypass for authenticated
-- ============================================================
-- Authenticated learner INSERT requires:
--   1. student_id = auth.uid()           (identity binding)
--   2. school_id IS NOT NULL              (institutional binding required)
--   3. matching school_memberships row    (membership validation)
--      WHERE user_id = auth.uid()
--        AND school_id = NEW.school_id
--        AND role = 'STUDENT'
--
-- Historical NULL rows are NOT affected — this policy only governs NEW inserts.
-- service_role bypasses RLS entirely — backend writes are unaffected.
CREATE POLICY "users insert own observation history"
  ON public.learning_observation_history
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND school_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.school_memberships sm
      WHERE sm.user_id = auth.uid()
        AND sm.school_id = learning_observation_history.school_id
        AND sm.role = 'STUDENT'
    )
  );

-- ============================================================
-- 3. Verify: no UPDATE/DELETE policies exist (append-only)
-- ============================================================
-- Gate 06B.1 intentionally created NO UPDATE or DELETE policies.
-- This migration preserves that invariant.
-- If any UPDATE/DELETE policies somehow exist, they should be dropped:
-- DROP POLICY IF EXISTS "...UPDATE..." ON public.learning_observation_history;
-- DROP POLICY IF EXISTS "...DELETE..." ON public.learning_observation_history;
-- (commented out — no such policies exist)
