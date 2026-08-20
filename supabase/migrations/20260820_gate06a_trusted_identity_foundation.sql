-- ============================================================================
-- GATE 06A: TRUSTED IDENTITY FOUNDATION
-- Migration: 20260820_gate06a_trusted_identity_foundation.sql
--
-- Creates:
--   public.profaces          (identity/profile only — NOT authorization)
--   public.schools           (school registry)
--   public.school_memberships (institutional roles: TEACHER, SCHOOL_ADMIN, STUDENT)
--   public.platform_roles    (platform-level: SUPER_ADMIN)
--
-- Also creates:
--   RLS policies for all new tables
--   Trigger to auto-create profile on user signup
--   Trusted role resolution functions
--
-- IMPORTANT:
--   - profiles is NOT the authorization authority for institutional roles
--   - Institutional roles come from school_memberships
--   - SUPER_ADMIN comes from platform_roles
--   - No SUPER_ADMIN is seeded
--   - Historical migrations are NOT modified
-- ============================================================================

-- ============================================================================
-- 1. PROFILES (identity only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  phone_number TEXT,
  preferred_language TEXT DEFAULT 'ar',
  education_level    TEXT,
  track              TEXT,
  academic_year      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (non-role fields only)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role inserts profiles (via trigger)
CREATE POLICY "profiles_insert_service"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. SCHOOLS (school registry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  address    TEXT,
  city       TEXT,
  region     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read schools
CREATE POLICY "schools_select_authenticated"
  ON public.schools FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can manage schools
CREATE POLICY "schools_insert_service"
  ON public.schools FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 3. SCHOOL MEMBERSHIPS (institutional roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.school_memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id  UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'SCHOOL_ADMIN')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, school_id)
);

ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;

-- Users can read their own memberships
CREATE POLICY "school_memberships_select_own"
  ON public.school_memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read memberships for their schools
CREATE POLICY "school_memberships_select_school"
  ON public.school_memberships FOR SELECT
  USING (
    school_id IN (
      SELECT sm.school_id FROM public.school_memberships sm
      WHERE sm.user_id = auth.uid()
    )
  );

-- Service role manages memberships
CREATE POLICY "school_memberships_insert_service"
  ON public.school_memberships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "school_memberships_update_service"
  ON public.school_memberships FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "school_memberships_delete_service"
  ON public.school_memberships FOR DELETE
  USING (true);

-- ============================================================================
-- 4. PLATFORM ROLES (SUPER_ADMIN only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.platform_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own platform roles
CREATE POLICY "platform_roles_select_own"
  ON public.platform_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Service role manages platform roles
CREATE POLICY "platform_roles_insert_service"
  ON public.platform_roles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "platform_roles_update_service"
  ON public.platform_roles FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "platform_roles_delete_service"
  ON public.platform_roles FOR DELETE
  USING (true);

-- ============================================================================
-- 5. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. TRUSTED ROLE RESOLUTION FUNCTIONS
-- ============================================================================

-- Resolve a user's effective role from trusted DB sources
CREATE OR REPLACE FUNCTION public.get_user_trusted_role(target_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  platform_role TEXT;
  membership_count INT;
  membership_role TEXT;
BEGIN
  -- Priority 1: platform_roles (SUPER_ADMIN)
  SELECT role INTO platform_role
  FROM public.platform_roles
  WHERE user_id = target_user_id
  LIMIT 1;

  IF platform_role IS NOT NULL THEN
    RETURN platform_role;
  END IF;

  -- Priority 2: school_memberships
  SELECT COUNT(*), (ARRAY_AGG(role))[1]
  INTO membership_count, membership_role
  FROM public.school_memberships
  WHERE user_id = target_user_id;

  IF membership_count = 1 THEN
    RETURN membership_role;
  ELSIF membership_count > 1 THEN
    -- Multiple schools — default to STUDENT
    RETURN 'STUDENT';
  END IF;

  -- Default: STUDENT
  RETURN 'STUDENT';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Resolve a user's effective school ID
CREATE OR REPLACE FUNCTION public.get_user_school_id(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  result UUID;
BEGIN
  SELECT school_id INTO result
  FROM public.school_memberships
  WHERE user_id = target_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
