-- Qarayti.ai - Gate 07A: Expansion-Ready Moroccan Curriculum Architecture
-- Single forward-only migration for curriculum graph foundation.
--
-- SAFETY:
--   - NO historical migration edits
--   - NO existing table drops or column drops
--   - NO existing seed data mutations
--   - Additive only: new tables, new nullable columns, new indexes, structural seed data
--   - curriculum_subjects: cycle/track columns preserved for backward compatibility
--   - curriculum_knowledge_objects: existing TEXT columns preserved
--   - Structural seed data (stages, grades) is architecture-only, not curriculum content

-- ============================================================
-- 1. EDUCATION SYSTEMS (top-level boundary)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_education_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  country_territory_code TEXT,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (status != 'PUBLISHED' OR provenance NOT IN ('UNVERIFIED', 'PROTOTYPE'))
);

ALTER TABLE public.curriculum_education_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read education systems" ON public.curriculum_education_systems
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 2. EDUCATION STAGES (registry table, NOT enum)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  education_system_id UUID NOT NULL REFERENCES public.curriculum_education_systems(id),
  code TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(education_system_id, code)
);

ALTER TABLE public.curriculum_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read stages" ON public.curriculum_stages
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_stage_system ON public.curriculum_stages(education_system_id);

-- ============================================================
-- 2. GRADE LEVELS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  stage_id UUID NOT NULL REFERENCES public.curriculum_stages(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(stage_id, code)
);

ALTER TABLE public.curriculum_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read grades" ON public.curriculum_grades
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_grade_stage ON public.curriculum_grades(stage_id);

-- ============================================================
-- 3. TRACKS / STREAMS (optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  stage_id UUID NOT NULL REFERENCES public.curriculum_stages(id),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(stage_id, code)
);

ALTER TABLE public.curriculum_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read tracks" ON public.curriculum_tracks
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_track_stage ON public.curriculum_tracks(stage_id);

-- ============================================================
-- 4. CURRICULUM PROGRAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id),
  grade_id UUID NOT NULL REFERENCES public.curriculum_grades(id),
  track_id UUID REFERENCES public.curriculum_tracks(id),
  curriculum_version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE')),
  source_reference TEXT,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(grade_id, subject_id, curriculum_version),
  CHECK (status != 'PUBLISHED' OR provenance NOT IN ('UNVERIFIED', 'PROTOTYPE'))
);

ALTER TABLE public.curriculum_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read programs" ON public.curriculum_programs
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_program_subject ON public.curriculum_programs(subject_id);
CREATE INDEX IF NOT EXISTS idx_curr_program_grade ON public.curriculum_programs(grade_id);
CREATE INDEX IF NOT EXISTS idx_curr_program_track ON public.curriculum_programs(track_id);

-- ============================================================
-- 5. CURRICULUM UNITS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  program_id UUID NOT NULL REFERENCES public.curriculum_programs(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(program_id, code),
  CHECK (status != 'PUBLISHED' OR provenance NOT IN ('UNVERIFIED', 'PROTOTYPE'))
);

ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read units" ON public.curriculum_units
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_unit_program ON public.curriculum_units(program_id);

-- ============================================================
-- 6. CURRICULUM LESSONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  unit_id UUID NOT NULL REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(unit_id, code),
  CHECK (status != 'PUBLISHED' OR provenance NOT IN ('UNVERIFIED', 'PROTOTYPE'))
);

ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read lessons" ON public.curriculum_lessons
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_curr_lesson_unit ON public.curriculum_lessons(unit_id);

-- ============================================================
-- 7. EXTEND CURRICULUM SUBJECTS (additive columns)
-- ============================================================

ALTER TABLE public.curriculum_subjects
  ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.curriculum_stages(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ============================================================
-- 8. EXTEND CURRICULUM KNOWLEDGE OBJECTS (additive columns)
-- ============================================================

ALTER TABLE public.curriculum_knowledge_objects
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.curriculum_programs(id),
  ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.curriculum_units(id),
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.curriculum_lessons(id),
  ADD COLUMN IF NOT EXISTS provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE'));

CREATE INDEX IF NOT EXISTS idx_curr_ko_program ON public.curriculum_knowledge_objects(program_id);
CREATE INDEX IF NOT EXISTS idx_curr_ko_unit ON public.curriculum_knowledge_objects(unit_id);
CREATE INDEX IF NOT EXISTS idx_curr_ko_lesson ON public.curriculum_knowledge_objects(lesson_id);

-- ============================================================
-- 9. EXAM ARCHITECTURE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exam_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  exam_type TEXT NOT NULL,
  grade_id UUID NOT NULL REFERENCES public.curriculum_grades(id),
  track_id UUID REFERENCES public.curriculum_tracks(id),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  provenance TEXT NOT NULL DEFAULT 'UNVERIFIED'
    CHECK (provenance IN ('OFFICIAL_SOURCE','VERIFIED_SECONDARY_SOURCE','INTERNAL_CURATED','UNVERIFIED','PROTOTYPE')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (status != 'PUBLISHED' OR provenance NOT IN ('UNVERIFIED', 'PROTOTYPE'))
);

ALTER TABLE public.exam_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam definitions" ON public.exam_definitions
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exam_definitions(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  session_type TEXT NOT NULL,
  session_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam sessions" ON public.exam_sessions
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exam_session_exam ON public.exam_sessions(exam_id);

CREATE TABLE IF NOT EXISTS public.exam_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id),
  language TEXT NOT NULL DEFAULT 'fr',
  source_document_ref TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','UNVERIFIED','VERIFIED','PUBLISHED','RETIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam papers" ON public.exam_papers
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exam_paper_session ON public.exam_papers(session_id);

CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.exam_papers(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL DEFAULT 0,
  parent_question_id UUID REFERENCES public.exam_questions(id),
  prompt TEXT NOT NULL,
  max_points NUMERIC,
  grading_metadata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam questions" ON public.exam_questions
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_exam_question_paper ON public.exam_questions(paper_id);

CREATE TABLE IF NOT EXISTS public.exam_question_kos (
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  ko_id UUID NOT NULL REFERENCES public.curriculum_knowledge_objects(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 1.0,
  PRIMARY KEY (question_id, ko_id)
);

ALTER TABLE public.exam_question_kos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam question kos" ON public.exam_question_kos
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.exam_question_competencies (
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.curriculum_competencies(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 1.0,
  PRIMARY KEY (question_id, competency_id)
);

ALTER TABLE public.exam_question_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read exam question competencies" ON public.exam_question_competencies
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 12. PERMISSIONS
-- ============================================================

REVOKE ALL ON public.curriculum_education_systems FROM authenticated;
GRANT SELECT ON public.curriculum_education_systems TO authenticated;

REVOKE ALL ON public.curriculum_stages FROM authenticated;
GRANT SELECT ON public.curriculum_stages TO authenticated;

REVOKE ALL ON public.curriculum_grades FROM authenticated;
GRANT SELECT ON public.curriculum_grades TO authenticated;

REVOKE ALL ON public.curriculum_tracks FROM authenticated;
GRANT SELECT ON public.curriculum_tracks TO authenticated;

REVOKE ALL ON public.curriculum_programs FROM authenticated;
GRANT SELECT ON public.curriculum_programs TO authenticated;

REVOKE ALL ON public.curriculum_units FROM authenticated;
GRANT SELECT ON public.curriculum_units TO authenticated;

REVOKE ALL ON public.curriculum_lessons FROM authenticated;
GRANT SELECT ON public.curriculum_lessons TO authenticated;

REVOKE ALL ON public.exam_definitions FROM authenticated;
GRANT SELECT ON public.exam_definitions TO authenticated;

REVOKE ALL ON public.exam_sessions FROM authenticated;
GRANT SELECT ON public.exam_sessions TO authenticated;

REVOKE ALL ON public.exam_papers FROM authenticated;
GRANT SELECT ON public.exam_papers TO authenticated;

REVOKE ALL ON public.exam_questions FROM authenticated;
GRANT SELECT ON public.exam_questions TO authenticated;

REVOKE ALL ON public.exam_question_kos FROM authenticated;
GRANT SELECT ON public.exam_question_kos TO authenticated;

REVOKE ALL ON public.exam_question_competencies FROM authenticated;
GRANT SELECT ON public.exam_question_competencies TO authenticated;

-- ============================================================
-- 13. SEED DATA - STRUCTURAL REGISTRY ONLY
-- ============================================================
-- NO curriculum content. NO lesson lists. NO competencies. NO exam rules.

INSERT INTO public.curriculum_education_systems (id, code, country_territory_code, name_ar, name_fr, status, provenance, is_active) VALUES
  ('00000000-0000-0000-0000-000000000099', 'MOROCCO', 'MA', 'النظام التعليمي المغربي', 'Système Éducatif Marocain', 'PUBLISHED', 'OFFICIAL_SOURCE', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.curriculum_stages (id, education_system_id, code, name_ar, name_fr, sort_order, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', 'PRIMARY', 'التعليم الابتدائي', 'Enseignement Primaire', 1, true),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000099', 'MIDDLE_SCHOOL', 'التعليم الثانوي الإعدادي', 'Enseignement Secondaire Collégial', 2, true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000099', 'QUALIFYING_SECONDARY', 'التعليم الثانوي التأهيلي', 'Enseignement Secondaire Qualifiant', 3, true)
ON CONFLICT (education_system_id, code) DO NOTHING;

DO 
DECLARE
  v_primary_id UUID;
  v_middle_id UUID;
  v_secondary_id UUID;
BEGIN
  SELECT id INTO v_primary_id FROM public.curriculum_stages WHERE code = 'PRIMARY';
  SELECT id INTO v_middle_id FROM public.curriculum_stages WHERE code = 'MIDDLE_SCHOOL';
  SELECT id INTO v_secondary_id FROM public.curriculum_stages WHERE code = 'QUALIFYING_SECONDARY';

  INSERT INTO public.curriculum_grades (id, code, stage_id, sort_order, name_ar, name_fr, is_active) VALUES
    ('10000000-0000-0000-0000-000000000001', 'P1', v_primary_id, 1, '?????? ???????', '1�re Ann�e Primaire', true),
    ('10000000-0000-0000-0000-000000000002', 'P2', v_primary_id, 2, '??????? ???????', '2�me Ann�e Primaire', true),
    ('10000000-0000-0000-0000-000000000003', 'P3', v_primary_id, 3, '??????? ???????', '3�me Ann�e Primaire', true),
    ('10000000-0000-0000-0000-000000000004', 'P4', v_primary_id, 4, '??????? ???????', '4�me Ann�e Primaire', true),
    ('10000000-0000-0000-0000-000000000005', 'P5', v_primary_id, 5, '??????? ???????', '5�me Ann�e Primaire', true),
    ('10000000-0000-0000-0000-000000000006', 'P6', v_primary_id, 6, '??????? ???????', '6�me Ann�e Primaire', true)
  ON CONFLICT (stage_id, code) DO NOTHING;

  INSERT INTO public.curriculum_grades (id, code, stage_id, sort_order, name_ar, name_fr, is_active) VALUES
    ('20000000-0000-0000-0000-000000000001', 'M1', v_middle_id, 7, '?????? ??????', '1�re Ann�e Coll�ge', true),
    ('20000000-0000-0000-0000-000000000002', 'M2', v_middle_id, 8, '??????? ??????', '2�me Ann�e Coll�ge', true),
    ('20000000-0000-0000-0000-000000000003', 'M3', v_middle_id, 9, '??????? ??????', '3�me Ann�e Coll�ge', true)
  ON CONFLICT (stage_id, code) DO NOTHING;

  INSERT INTO public.curriculum_grades (id, code, stage_id, sort_order, name_ar, name_fr, is_active) VALUES
    ('30000000-0000-0000-0000-000000000001', 'S1', v_secondary_id, 10, '????? ???????', 'Tronc Commun', true),
    ('30000000-0000-0000-0000-000000000002', 'S2', v_secondary_id, 11, '?????? ????????', '1�re Ann�e Bac', true),
    ('30000000-0000-0000-0000-000000000003', 'S3', v_secondary_id, 12, '??????? ????????', '2�me Ann�e Bac', true)
  ON CONFLICT (stage_id, code) DO NOTHING;
END ;
