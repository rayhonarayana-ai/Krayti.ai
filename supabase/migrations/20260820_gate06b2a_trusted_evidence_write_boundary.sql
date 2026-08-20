-- Qarayti.ai — Gate 06B.2A: Trusted Learning Evidence Write Boundary
-- Establishes server-side-only evidence persistence.
--
-- PROBLEM (Gate 06B.2 audit):
--   Authenticated browser clients could directly INSERT fabricated rows
--   into learning_observation_history via RLS INSERT policy.
--   Evidence persistence was NOT crossed through a trusted boundary.
--
-- SOLUTION:
--   1. REMOVE authenticated-client INSERT authority from learning_observation_history
--   2. Evidence persistence now requires trusted server boundary (Edge Function)
--   3. Edge Function derives user identity from verified JWT, not payload
--   4. Edge Function verifies school membership against trusted DB state
--
-- SAFETY:
--   - NO historical UPDATE
--   - NO historical DELETE
--   - NO backfill
--   - Historical rows remain untouched and readable
--   - Append-only semantics preserved
--   - service_role bypasses RLS — Edge Function writes are unaffected

-- ============================================================
-- 1. Remove authenticated-client INSERT authority
-- ============================================================
-- DROP the INSERT policy from Gate 06B.1.1.
-- After this, authenticated browser users CANNOT INSERT into learning_observation_history.
-- Only service_role (Edge Function) can INSERT (RLS is bypassed for service_role).
DROP POLICY IF EXISTS "users insert own observation history"
  ON public.learning_observation_history;

-- ============================================================
-- 2. Preserve SELECT authority (students read their own observations)
-- ============================================================
-- The existing SELECT policy remains unchanged:
--   student_id = auth.uid()
-- Students can still read their own observation history.

-- ============================================================
-- 3. Verify: no UPDATE/DELETE policies exist (append-only)
-- ============================================================
-- No UPDATE or DELETE policies have ever been created.
-- Append-only semantics are preserved by absence of policies.

-- ============================================================
-- 4. Verify: no INSERT policy exists for authenticated
-- ============================================================
-- After step 1, the only INSERT path is service_role (Edge Function).
-- RLS is bypassed for service_role, so Edge Function writes succeed.

-- ============================================================
-- 5. Grant minimal permissions (deny-by-default)
-- ============================================================
-- Revoke all and re-grant only SELECT (INSERT denied for authenticated)
REVOKE ALL ON public.learning_observation_history FROM authenticated;
GRANT SELECT ON public.learning_observation_history TO authenticated;

-- ============================================================
-- 6. Documentation: trusted ingestion boundary
-- ============================================================
-- Evidence persistence now requires:
--   1. Authenticated request with valid JWT
--   2. Edge Function validates JWT → extracts user_id
--   3. Edge Function verifies school membership against school_memberships
--   4. Edge Function inserts via service_role (RLS bypassed)
--
-- Browser cannot bypass this boundary:
--   - No INSERT policy for authenticated
--   - service_role key is NOT exposed to browser
--   - Edge Function URL is public, but JWT validation prevents unauthorized writes
