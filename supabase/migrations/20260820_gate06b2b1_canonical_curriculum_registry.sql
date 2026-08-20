-- Qarayti.ai — Gate 06B.2B.1: Canonical Curriculum Registry Foundation
-- Creates database-backed canonical registry for subjects, KOs, competencies,
-- exercises, and grading authority.
--
-- SAFETY:
--   - NO historical migration edits
--   - NO historical evidence mutation
--   - NO learner_memory modification
--   - NO Faheem/BKT/IRT modification
--   - NO existing CMS deletion
--   - Additive only — new tables + seed data
--   - Only relationships proven from existing source definitions are seeded

-- ============================================================
-- 1. CURRICULUM SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ar TEXT,
  cycle TEXT,
  track TEXT,
  version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_subjects ENABLE ROW LEVEL SECURITY;

-- Students may read subject metadata
CREATE POLICY "students read subjects" ON public.curriculum_subjects
  FOR SELECT TO authenticated USING (true);

-- No student mutation
-- No INSERT/UPDATE/DELETE policies for authenticated

-- ============================================================
-- 2. CURRICULUM COMPETENCIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  taxonomy_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read competencies" ON public.curriculum_competencies
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 3. CURRICULUM KNOWLEDGE OBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_knowledge_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  version TEXT,
  grade TEXT,
  unit TEXT,
  lesson TEXT,
  bloom_level TEXT,
  difficulty TEXT,
  approval_status TEXT NOT NULL DEFAULT 'DRAFT',
  ministry_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_knowledge_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read knowledge objects" ON public.curriculum_knowledge_objects
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 4. CURRICULUM KO ↔ COMPETENCY (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_ko_competencies (
  ko_id UUID NOT NULL REFERENCES public.curriculum_knowledge_objects(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES public.curriculum_competencies(id) ON DELETE CASCADE,
  PRIMARY KEY (ko_id, competency_id)
);

ALTER TABLE public.curriculum_ko_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students read ko competencies" ON public.curriculum_ko_competencies
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 5. CURRICULUM EXERCISES (public content)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  subject_id UUID NOT NULL REFERENCES public.curriculum_subjects(id),
  ko_id UUID REFERENCES public.curriculum_knowledge_objects(id),
  exercise_type TEXT NOT NULL,
  prompt TEXT,
  grading_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_exercises ENABLE ROW LEVEL SECURITY;

-- Students may read exercise prompts (public content)
CREATE POLICY "students read exercises" ON public.curriculum_exercises
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- 6. CURRICULUM EXERCISE GRADING (PRIVATE — answer authority)
-- ============================================================
-- Students must NOT read correct answers or rubric details.
-- Only service_role (Edge Function) can access this table.
CREATE TABLE IF NOT EXISTS public.curriculum_exercise_grading (
  exercise_id UUID PRIMARY KEY REFERENCES public.curriculum_exercises(id) ON DELETE CASCADE,
  correct_answer TEXT,
  rubric_criteria JSONB,
  irt_difficulty NUMERIC,
  irt_discrimination NUMERIC,
  irt_pseudoguessing NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.curriculum_exercise_grading ENABLE ROW LEVEL SECURITY;

-- NO SELECT policy for authenticated — students CANNOT read answer keys
-- NO INSERT/UPDATE/DELETE policies for authenticated
-- Only service_role (Edge Function) can access via RLS bypass

-- ============================================================
-- 7. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_curr_ko_subject ON public.curriculum_knowledge_objects(subject_id);
CREATE INDEX IF NOT EXISTS idx_curr_exercise_subject ON public.curriculum_exercises(subject_id);
CREATE INDEX IF NOT EXISTS idx_curr_exercise_ko ON public.curriculum_exercises(ko_id);
CREATE INDEX IF NOT EXISTS idx_curr_exercise_code ON public.curriculum_exercises(code);

-- ============================================================
-- 8. GRANT MINIMAL PERMISSIONS
-- ============================================================
-- Revoke all and re-grant SELECT only for public tables
REVOKE ALL ON public.curriculum_subjects FROM authenticated;
GRANT SELECT ON public.curriculum_subjects TO authenticated;

REVOKE ALL ON public.curriculum_competencies FROM authenticated;
GRANT SELECT ON public.curriculum_competencies TO authenticated;

REVOKE ALL ON public.curriculum_knowledge_objects FROM authenticated;
GRANT SELECT ON public.curriculum_knowledge_objects TO authenticated;

REVOKE ALL ON public.curriculum_ko_competencies FROM authenticated;
GRANT SELECT ON public.curriculum_ko_competencies TO authenticated;

REVOKE ALL ON public.curriculum_exercises FROM authenticated;
GRANT SELECT ON public.curriculum_exercises TO authenticated;

-- Grading table: NO grants for authenticated — answer keys are private
REVOKE ALL ON public.curriculum_exercise_grading FROM authenticated;

-- ============================================================
-- 9. SEED DATA — PROVEN RELATIONSHIPS ONLY
-- ============================================================
-- Only relationships proven from existing TypeScript CMS definitions.
-- Unresolved mappings are documented but NOT fabricated.

-- --- SUBJECTS ---
INSERT INTO public.curriculum_subjects (code, title, title_ar, cycle, track, version) VALUES
  ('MATH', 'Mathématiques', 'الرياضيات', 'LYCEE', 'BAC2_SCIENCES_MATHS_A', '2026.1.0-OFFICIAL'),
  ('PHYS', 'Physique-Chimie', 'الفيزياء والكيمياء', 'LYCEE', 'BAC2_SCIENCES_PHYSIQUES', '2026.1.0-OFFICIAL'),
  ('SVT', 'Sciences de la Vie et de la Terre', 'علوم الحياة وال earth', 'LYCEE', 'BAC2_SVT', '2026.1.0-OFFICIAL')
ON CONFLICT (code) DO NOTHING;

-- --- COMPETENCIES ---
-- Proven from cms-engine.ts:138-153
INSERT INTO public.curriculum_competencies (code, title, description, taxonomy_level) VALUES
  ('COMP-MATH-2BAC-01', 'Étude des Limites et Continuité d une Fonction Numérique',
   'Maîtriser les théorèmes de continuité (TVI), la continuité à droite/gauche et l encadrement.', 'APPLICATION'),
  ('COMP-MATH-2BAC-02', 'Calcul des Nombres Complexes et Géométrie du Plan',
   'Calcul des formes algébriques, trigonométriques et exponentielles, équations dans C.', 'ANALYSIS')
ON CONFLICT (code) DO NOTHING;

-- --- KNOWLEDGE OBJECTS ---
-- Proven from cms-engine.ts:177-247
DO $$
DECLARE
  v_math_id UUID;
  v_ko1_id UUID;
  v_ko2_id UUID;
  v_comp1_id UUID;
BEGIN
  SELECT id INTO v_math_id FROM public.curriculum_subjects WHERE code = 'MATH';
  SELECT id INTO v_comp1_id FROM public.curriculum_competencies WHERE code = 'COMP-MATH-2BAC-01';

  INSERT INTO public.curriculum_knowledge_objects (code, subject_id, title, type, version, grade, unit, lesson, bloom_level, difficulty, approval_status, ministry_reference)
  VALUES ('ko-math-001', v_math_id, 'Théorème des Valeurs Intermédiaires (TVI)', 'THEOREM_PROOF', '2026.1.0-OFFICIAL', '2ème BAC', 'Unité 1 : Analyse', 'Continuité et TVI', 'APPLY', 'MOYEN', 'PUBLISHED', 'MENPS-2026-DIR-42')
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO v_ko1_id;

  SELECT id INTO v_ko1_id FROM public.curriculum_knowledge_objects WHERE code = 'ko-math-001';

  INSERT INTO public.curriculum_knowledge_objects (code, subject_id, title, type, version, grade, unit, lesson, bloom_level, difficulty, approval_status, ministry_reference)
  VALUES ('ko-math-002', v_math_id, 'Méthode de Dichotomie pour la résolution de f(x)=0', 'WORKED_EXAMPLE', '2026.1.0-OFFICIAL', '2ème BAC', 'Unité 1 : Analyse', 'Continuité et TVI', 'ANALYZE', 'DIFFICILE', 'PUBLISHED', 'MENPS-2026-DIR-42')
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO v_ko2_id;

  SELECT id INTO v_ko2_id FROM public.curriculum_knowledge_objects WHERE code = 'ko-math-002';

  -- KO ↔ Competency mappings (proven from cms-engine.ts:190,225)
  IF v_ko1_id IS NOT NULL AND v_comp1_id IS NOT NULL THEN
    INSERT INTO public.curriculum_ko_competencies (ko_id, competency_id)
    VALUES (v_ko1_id, v_comp1_id)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_ko2_id IS NOT NULL AND v_comp1_id IS NOT NULL THEN
    INSERT INTO public.curriculum_ko_competencies (ko_id, competency_id)
    VALUES (v_ko2_id, v_comp1_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- --- EXERCISES ---
-- Proven mappings:
--   q-math-001 → ko-math-001 (proven by cms-engine.ts:196 assessmentMapping)
--   q-math-002 → ko-math-002 (proven by cms-engine.ts:231 assessmentMapping)
-- Unresolved:
--   ex-01 — no KO mapping exists (exercise about complex numbers, no complex numbers KO in CMS)
--   ex-02 — no KO mapping exists (exercise about physics, no physics KO in CMS)
--   q-phys-001 — no KO mapping exists (no physics KO in CMS)
--   q-svt-001 — no KO mapping exists (no SVT KO in CMS)
DO $$
DECLARE
  v_math_id UUID;
  v_phys_id UUID;
  v_svt_id UUID;
  v_ko1_id UUID;
  v_ko2_id UUID;
  v_ex_qmath1 UUID;
  v_ex_qmath2 UUID;
BEGIN
  SELECT id INTO v_math_id FROM public.curriculum_subjects WHERE code = 'MATH';
  SELECT id INTO v_phys_id FROM public.curriculum_subjects WHERE code = 'PHYS';
  SELECT id INTO v_svt_id FROM public.curriculum_subjects WHERE code = 'SVT';
  SELECT id INTO v_ko1_id FROM public.curriculum_knowledge_objects WHERE code = 'ko-math-001';
  SELECT id INTO v_ko2_id FROM public.curriculum_knowledge_objects WHERE code = 'ko-math-002';

  -- MAPPABLE: q-math-001 → ko-math-001
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('q-math-001', v_math_id, v_ko1_id, 'ASSESSMENT_QCM',
          'Calculer la limite quand x tend vers 0 de (sin(3x) / x)', 'EXACT_ANSWER')
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO v_ex_qmath1;

  -- MAPPABLE: q-math-002 → ko-math-002 (proven by CMS, content mismatch noted)
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('q-math-002', v_math_id, v_ko2_id, 'ASSESSMENT_STEP_BY_STEP',
          'Soit z = 1 + i√3. Écrire z sous forme trigonométrique et calculer z⁶.', 'RUBRIC')
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO v_ex_qmath2;

  -- UNRESOLVED: ex-01 (no KO mapping)
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('ex-01', v_math_id, NULL, 'PRACTICE',
          'حل في مجموعة الأعداد العقدية المعادلة التالية: z² - 2√3z + 4 = 0', 'EXACT_ANSWER')
  ON CONFLICT (code) DO NOTHING;

  -- UNRESOLVED: ex-02 (no KO mapping)
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('ex-02', v_phys_id, NULL, 'PRACTICE',
          'أوجد تعبير constante de temps τ لدارة RC', 'EXACT_ANSWER')
  ON CONFLICT (code) DO NOTHING;

  -- UNRESOLVED: q-phys-001 (no KO mapping)
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('q-phys-001', v_phys_id, NULL, 'ASSESSMENT_QCM',
          'La célérité d une onde mécanique le long d une corde dépend de :', 'EXACT_ANSWER')
  ON CONFLICT (code) DO NOTHING;

  -- UNRESOLVED: q-svt-001 (no KO mapping)
  INSERT INTO public.curriculum_exercises (code, subject_id, ko_id, exercise_type, prompt, grading_type)
  VALUES ('q-svt-001', v_svt_id, NULL, 'ASSESSMENT_ESSAY',
          'Analyser l arbre généalogique fourni et déterminer si l allèle est dominant ou récessif.', 'RUBRIC')
  ON CONFLICT (code) DO NOTHING;
END $$;

-- --- GRADING DATA (PRIVATE) ---
-- Proven from assessment-engine.ts:115-197 and studentPortal.repository.ts:227-266
DO $$
DECLARE
  v_ex_qmath1 UUID;
  v_ex_qmath2 UUID;
  v_ex_qphys1 UUID;
  v_ex_qsvt1 UUID;
  v_ex_ex01 UUID;
  v_ex_ex02 UUID;
BEGIN
  SELECT id INTO v_ex_qmath1 FROM public.curriculum_exercises WHERE code = 'q-math-001';
  SELECT id INTO v_ex_qmath2 FROM public.curriculum_exercises WHERE code = 'q-math-002';
  SELECT id INTO v_ex_qphys1 FROM public.curriculum_exercises WHERE code = 'q-phys-001';
  SELECT id INTO v_ex_qsvt1 FROM public.curriculum_exercises WHERE code = 'q-svt-001';
  SELECT id INTO v_ex_ex01 FROM public.curriculum_exercises WHERE code = 'ex-01';
  SELECT id INTO v_ex_ex02 FROM public.curriculum_exercises WHERE code = 'ex-02';

  -- q-math-001: exact answer '3'
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer, irt_difficulty, irt_discrimination, irt_pseudoguessing)
  VALUES (v_ex_qmath1, '3', 0.2, 1.4, 0.1)
  ON CONFLICT (exercise_id) DO NOTHING;

  -- q-math-002: rubric-based grading
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer, rubric_criteria, irt_difficulty, irt_discrimination, irt_pseudoguessing)
  VALUES (v_ex_qmath2, 'z = 2(cos(π/3) + i sin(π/3)) et z⁶ = 64',
          '[{"criterion":"Calcul du module |z| = 2","maxPoints":1},{"criterion":"Détermination de l argument arg(z) = π/3","maxPoints":1.5},{"criterion":"Calcul de z⁶ avec Moivre = 64","maxPoints":1.5}]',
          1.1, 1.8, 0.05)
  ON CONFLICT (exercise_id) DO NOTHING;

  -- q-phys-001: exact answer
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer, irt_difficulty, irt_discrimination, irt_pseudoguessing)
  VALUES (v_ex_qphys1, 'La tension et masse linéique de la corde', -0.5, 1.1, 0.1)
  ON CONFLICT (exercise_id) DO NOTHING;

  -- q-svt-001: rubric-based
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer, rubric_criteria, irt_difficulty, irt_discrimination, irt_pseudoguessing)
  VALUES (v_ex_qsvt1, 'Allèle récessif porté par le chromosome X.',
          '[{"criterion":"Justification du caractère récessif","maxPoints":2},{"criterion":"Exclusion de la transmission portée par Y ou autosome","maxPoints":2}]',
          1.3, 1.9, 0.15)
  ON CONFLICT (exercise_id) DO NOTHING;

  -- ex-01: exact answer (practice — stub grading in current code)
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer)
  VALUES (v_ex_ex01, 'z_1 = \\sqrt{3} + i, z_2 = \\sqrt{3} - i')
  ON CONFLICT (exercise_id) DO NOTHING;

  -- ex-02: exact answer (practice — stub grading in current code)
  INSERT INTO public.curriculum_exercise_grading (exercise_id, correct_answer)
  VALUES (v_ex_ex02, '1 ms')
  ON CONFLICT (exercise_id) DO NOTHING;
END $$;

-- ============================================================
-- 10. DOCUMENTATION: UNRESOLVED MAPPINGS
-- ============================================================
-- The following exercises have NO proven KO mapping:
--   ex-01  — Complex numbers exercise, no complex numbers KO in CMS
--   ex-02  — Physics RC circuit, no physics KO in CMS
--   q-phys-001 — Physics waves, no physics KO in CMS
--   q-svt-001 — SVT genetics, no SVT KO in CMS
--
-- The following mapping has content mismatch:
--   q-math-002 → ko-math-002 — question is about complex numbers,
--     but ko-math-002 is about dichotomy. Mapping proven by CMS
--     assessmentMapping but semantically inconsistent.
--
-- NO_COMPETENCY_MAPPING is diagnostic state, NOT curriculum identity.
-- It is NOT seeded as a curriculum row.
