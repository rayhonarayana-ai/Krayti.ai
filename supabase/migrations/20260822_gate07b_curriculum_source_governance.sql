-- Qarayti.ai - Gate 07B: Curriculum Source Governance
-- Forward-only migration for source tracking, ingestion pipeline, and version management.
--
-- SAFETY:
--   - NO historical migration edits
--   - NO existing table drops
--   - NO existing seed data mutations
--   - Additive only: new tables, new indexes
--   - All new tables RLS-enabled, authenticated users SELECT-only
--   - Grading authority remains private

-- ============================================================
-- 1. CURRICULUM SOURCE RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  source_classification TEXT NOT NULL
    CHECK (source_classification IN (
      'OFFICIAL_MINISTRY','OFFICIAL_EXAM','OFFICIAL_CURRICULUM_DOCUMENT',
      'OFFICIAL_TEXTBOOK_OR_GUIDE','AUTHORIZED_REFERENCE','SECONDARY_REFERENCE',
      'INTERNAL_DRAFT','AI_GENERATED'
    )),
  source_authority TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_url TEXT,
  source_reference TEXT,
  publication_date DATE,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  academic_year TEXT,
  curriculum_version TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  verification_state TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (verification_state IN ('UNVERIFIED','REVIEW_REQUIRED','VERIFIED','REJECTED')),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  content_hash TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_source_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read source records" ON public.curriculum_source_records
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_csr_education_system ON public.curriculum_source_records(education_system_id);
CREATE INDEX IF NOT EXISTS idx_csr_verification ON public.curriculum_source_records(verification_state);

-- ============================================================
-- 2. CURRICULUM INGESTION UNITS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_ingestion_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_record_id UUID NOT NULL REFERENCES public.curriculum_source_records(id),
  ingestion_state TEXT NOT NULL DEFAULT 'SOURCE_DISCOVERED'
    CHECK (ingestion_state IN (
      'SOURCE_DISCOVERED','SOURCE_CAPTURED','PARSED','NORMALIZED',
      'MAPPED','REVIEW_REQUIRED','VERIFIED','PUBLISHED','REJECTED','QUARANTINED','RETIRED'
    )),
  target_grade_id UUID REFERENCES public.curriculum_grades(id),
  target_subject_id UUID REFERENCES public.curriculum_subjects(id),
  target_program_code TEXT,
  content_payload TEXT NOT NULL,
  validation_errors JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.curriculum_ingestion_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read ingestion units" ON public.curriculum_ingestion_units
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ciu_source ON public.curriculum_ingestion_units(source_record_id);
CREATE INDEX IF NOT EXISTS idx_ciu_state ON public.curriculum_ingestion_units(ingestion_state);

-- ============================================================
-- 3. CURRICULUM VERSION RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_version_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  grade_id UUID NOT NULL REFERENCES public.curriculum_grades(id),
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id),
  curriculum_version TEXT NOT NULL,
  academic_year TEXT,
  effective_from DATE,
  effective_to DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  superseded_by UUID REFERENCES public.curriculum_version_records(id),
  source_record_id UUID REFERENCES public.curriculum_source_records(id),
  status TEXT NOT NULL DEFAULT 'NOT_INGESTED'
    CHECK (status IN ('NOT_INGESTED','SOURCE_REQUIRED','DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED','SUPERSEDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_version_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read version records" ON public.curriculum_version_records
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cvr_grade_subject ON public.curriculum_version_records(grade_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_cvr_current ON public.curriculum_version_records(is_current) WHERE is_current = true;

-- ============================================================
-- 4. PERMISSIONS
-- ============================================================

REVOKE ALL ON public.curriculum_source_records FROM authenticated;
GRANT SELECT ON public.curriculum_source_records TO authenticated;

REVOKE ALL ON public.curriculum_ingestion_units FROM authenticated;
GRANT SELECT ON public.curriculum_ingestion_units TO authenticated;

REVOKE ALL ON public.curriculum_version_records FROM authenticated;
GRANT SELECT ON public.curriculum_version_records TO authenticated;
