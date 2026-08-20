-- ============================================================================
-- GATE 06A.1 — SECURITY CORRECTION
-- Migration: 20260820_gate06a1_security_correction.sql
--
-- Corrects P0 findings from Tech Lead review:
--   1. Drops all unsafe mutation policies (WITH CHECK (true) / USING (true))
--   2. Replaces with deny-by-default + service_role-only mutation policies
--   3. Hardens SECURITY DEFINER functions (search_path, auth.uid, EXECUTE grants)
--   4. Revokes inappropriate default EXECUTE from PUBLIC
--
-- This is a forward-only corrective migration.
-- Assumes 20260820_gate06a_trusted_identity_foundation.sql may already be applied.
-- DO NOT edit the original migration.
-- ============================================================================

-- ============================================================================
-- 1. DROP ALL UNSAFE MUTATION POLICIES
-- ============================================================================

-- profiles: drop unsafe INSERT and UPDATE policies
DROP POLICY IF EXISTS profiles_insert_service ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

-- schools: drop unsafe INSERT policy
DROP POLICY IF EXISTS schools_insert_service ON public.schools;

-- school_memberships: drop all unsafe mutation policies
DROP POLICY IF EXISTS school_memberships_insert_service ON public.school_memberships;
DROP POLICY IF EXISTS school_memberships_update_service ON public.school_memberships;
DROP POLICY IF EXISTS school_memberships_delete_service ON public.school_memberships;

-- platform_roles: drop all unsafe mutation policies
DROP POLICY IF EXISTS platform_roles_insert_service ON public.platform_roles;
DROP POLICY IF EXISTS platform_roles_update_service ON public.platform_roles;
DROP POLICY IF EXISTS platform_roles_delete_service ON public.platform_roles;

-- ============================================================================
-- 2. REVOKE DEFAULT GRANTS (deny-by-default)
-- ============================================================================

-- Revoke all defaults on Gate 06A tables from anon and authenticated
REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.schools FROM anon, authenticated;
REVOKE ALL ON public.school_memberships FROM anon, authenticated;
REVOKE ALL ON public.platform_roles FROM anon, authenticated;

-- Revoke default EXECUTE on Gate 06A functions from PUBLIC
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_trusted_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_school_id() FROM PUBLIC;

-- ============================================================================
-- 3. RE-GRANT MINIMUM READ ACCESS
-- ============================================================================

-- profiles: users can read/update own
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- schools: authenticated can read
GRANT SELECT ON public.schools TO authenticated;

-- school_memberships: users can read own
GRANT SELECT ON public.school_memberships TO authenticated;

-- platform_roles: users can read own
GRANT SELECT ON public.platform_roles TO authenticated;

-- ============================================================================
-- 4. REPLACE POLICIES — SAFE VERSIONS
-- ============================================================================

-- --- profiles ---
CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- profiles INSERT is handled by handle_new_user() trigger (SECURITY DEFINER).
-- No INSERT policy for authenticated — only the trigger can insert.

-- --- schools ---
CREATE POLICY schools_select_authenticated
  ON public.schools FOR SELECT
  TO authenticated
  USING (true);

-- schools INSERT/UPDATE/DELETE: NO policy for authenticated.
-- Only service_role can mutate schools (bypasses RLS).

-- --- school_memberships ---
CREATE POLICY school_memberships_select_own
  ON public.school_memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY school_memberships_select_school
  ON public.school_memberships FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT sm.school_id FROM public.school_memberships sm
      WHERE sm.user_id = auth.uid()
    )
  );

-- school_memberships INSERT/UPDATE/DELETE: NO policy for authenticated.
-- Only service_role can mutate memberships (bypasses RLS).
-- This prevents normal users from granting themselves TEACHER or SCHOOL_ADMIN.

-- --- platform_roles ---
CREATE POLICY platform_roles_select_own
  ON public.platform_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- platform_roles INSERT/UPDATE/DELETE: NO policy for authenticated.
-- Only service_role can mutate platform_roles (bypasses RLS).
-- This prevents normal users from granting themselves SUPER_ADMIN.

-- ============================================================================
-- 5. HARDEN SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- 5a. handle_new_user() — trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- 5b. get_user_trusted_role() — no parameters, always resolves auth.uid()
--     Normal callers can only resolve themselves.
--     Service role can also use this freely.
CREATE OR REPLACE FUNCTION public.get_user_trusted_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  current_user_id UUID;
  platform_role TEXT;
  membership_count INT;
  membership_role TEXT;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN 'STUDENT';
  END IF;

  -- Priority 1: platform_roles (SUPER_ADMIN)
  SELECT pr.role INTO platform_role
  FROM public.platform_roles pr
  WHERE pr.user_id = current_user_id
  LIMIT 1;

  IF platform_role IS NOT NULL THEN
    RETURN platform_role;
  END IF;

  -- Priority 2: school_memberships
  SELECT COUNT(*), (ARRAY_AGG(sm.role))[1]
  INTO membership_count, membership_role
  FROM public.school_memberships sm
  WHERE sm.user_id = current_user_id;

  IF membership_count = 1 THEN
    RETURN membership_role;
  ELSIF membership_count > 1 THEN
    RETURN 'STUDENT';
  END IF;

  -- Default: STUDENT
  RETURN 'STUDENT';
END;
$$;

-- 5c. get_user_school_id() — no parameters, always resolves auth.uid()
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  current_user_id UUID;
  result UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT sm.school_id INTO result
  FROM public.school_memberships sm
  WHERE sm.user_id = current_user_id
  ORDER BY sm.created_at ASC
  LIMIT 1;

  RETURN result;
END;
$$;

-- ============================================================================
-- 6. EXECUTE GRANTS
-- ============================================================================

-- Grant EXECUTE to authenticated for self-resolution functions
GRANT EXECUTE ON FUNCTION public.get_user_trusted_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_school_id() TO authenticated;

-- handle_new_user() is a trigger function — no explicit EXECUTE grant needed.
-- It is invoked by the trigger, not by application code.

-- ============================================================================
-- END GATE 06A.1 CORRECTION
-- ============================================================================
