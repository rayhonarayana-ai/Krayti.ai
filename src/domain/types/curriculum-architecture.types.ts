/**
 * Qarayti.ai - Gate 07A: Expansion-Ready Moroccan Curriculum Architecture
 *
 * Domain types for the canonical curriculum graph:
 *   EducationSystem -> EducationStage -> GradeLevel -> (optional Track) -> CurriculumProgram
 *   CurriculumProgram -> CurriculumUnit -> CurriculumLesson
 *   KnowledgeObject <-> Competency (many-to-many)
 *   CurriculumProgram -> Subject (via subject_id)
 *
 * PRESERVATION RULES:
 *   - EducationLevel, HighSchoolTrack enums remain for backward compatibility
 *   - curriculum_subjects table rows remain untouched
 *   - curriculum_knowledge_objects existing rows remain untouched
 *   - curriculum_exercises / curriculum_exercise_grading remain untouched
 *   - ingest-evidence Edge Function contract unchanged
 *   - learning_observation_history semantics unchanged
 *   - mastery = NOT_DERIVED, accuracy != mastery
 *
 * DESIGN CHOICES:
 *   - Education stages use a TABLE (not PostgreSQL enum) for extensibility
 *   - Grade codes are stable machine-readable identifiers (P1-P6, M1-M3, S1-S3)
 *   - Grade identity is parent-scoped: UNIQUE(stage_id, code) — not globally unique
 *   - Tracks are optional; primary/middle work without tracks
 *   - Track identity is parent-scoped: UNIQUE(stage_id, code)
 *   - Program identity is multi-system safe: UNIQUE(grade_id, subject_id, curriculum_version)
 *   - Unit identity is parent-scoped: UNIQUE(program_id, code)
 *   - Lesson identity is parent-scoped: UNIQUE(unit_id, code)
 *   - Exam definitions retain global code uniqueness
 *   - Subject identity is separated from curriculum program binding
 *   - Provenance (source origin) and publication status are distinct concepts
 *   - DB CHECK constraints enforce: PUBLISHED requires provenance NOT IN (UNVERIFIED, PROTOTYPE)
 *   - Localization uses identity + name + name_ar + name_fr (not duplicate rows)
 */

// ============================================================
// EDUCATION SYSTEM (top-level boundary)
// ============================================================

export type EducationSystemCode = 'MOROCCO' | string;

export interface EducationSystem {
  readonly id: string;
  readonly code: EducationSystemCode;
  readonly countryTerritoryCode?: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// EDUCATION STAGE
// ============================================================

export type StageCode =
  | 'PRIMARY'
  | 'MIDDLE_SCHOOL'
  | 'QUALIFYING_SECONDARY'
  | 'PRESCHOOL'
  | 'CPGE'
  | 'BTS'
  | 'VOCATIONAL'
  | 'HIGHER_EDUCATION';

export interface EducationStage {
  readonly id: string;
  readonly educationSystemId: string;
  readonly code: StageCode;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// GRADE LEVEL
// ============================================================

export type GradeCode =
  | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
  | 'M1' | 'M2' | 'M3'
  | 'S1' | 'S2' | 'S3';

export interface GradeLevel {
  readonly id: string;
  readonly code: GradeCode;
  readonly stageId: string;
  readonly sortOrder: number;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// TRACK / STREAM
// ============================================================

export interface CurriculumTrack {
  readonly id: string;
  readonly code: string;
  readonly stageId: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// PROVENANCE & PUBLICATION
// ============================================================

export type ProvenanceType =
  | 'OFFICIAL_SOURCE'
  | 'VERIFIED_SECONDARY_SOURCE'
  | 'INTERNAL_CURATED'
  | 'UNVERIFIED'
  | 'PROTOTYPE';

export type PublicationStatus =
  | 'DRAFT'
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'RETIRED';

export interface CurriculumProvenance {
  readonly sourceType: ProvenanceType;
  readonly sourceReference?: string;
  readonly sourceVersion?: string;
  readonly verifiedAt?: string;
  readonly verificationStatus: PublicationStatus;
}

// ============================================================
// CURRICULUM PROGRAM
// ============================================================

export interface CurriculumProgram {
  readonly id: string;
  readonly code: string;
  readonly subjectId: string;
  readonly gradeId: string;
  readonly trackId?: string;
  readonly curriculumVersion: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly sourceReference?: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// CURRICULUM UNIT
// ============================================================

export interface CurriculumUnit {
  readonly id: string;
  readonly code: string;
  readonly programId: string;
  readonly sortOrder: number;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// CURRICULUM LESSON
// ============================================================

export interface CurriculumLesson {
  readonly id: string;
  readonly code: string;
  readonly unitId: string;
  readonly sortOrder: number;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// CURRICULUM SUBJECT (extends existing curriculum_subjects)
// ============================================================

export interface CurriculumSubject {
  readonly id: string;
  readonly code: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

// ============================================================
// KNOWLEDGE OBJECT (extends existing curriculum_knowledge_objects)
// ============================================================

export interface CurriculumKnowledgeObject {
  readonly id: string;
  readonly code: string;
  readonly subjectId: string;
  readonly programId?: string;
  readonly unitId?: string;
  readonly lessonId?: string;
  readonly title: string;
  readonly type: string;
  readonly version?: string;
  readonly bloomLevel?: string;
  readonly difficulty?: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly createdAt: string;
}

// ============================================================
// COMPETENCY (extends existing curriculum_competencies)
// ============================================================

export interface CurriculumCompetency {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly taxonomyLevel?: string;
  readonly createdAt: string;
}

// ============================================================
// EXAM ARCHITECTURE
// ============================================================

export type ExamTypeCode =
  | 'CONTINUOUS_ASSESSMENT'
  | 'LOCAL_EXAM'
  | 'REGIONAL_EXAM'
  | 'NATIONAL_EXAM';

export interface ExamDefinition {
  readonly id: string;
  readonly code: string;
  readonly examType: ExamTypeCode;
  readonly gradeId: string;
  readonly trackId?: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly status: PublicationStatus;
  readonly provenance: ProvenanceType;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface ExamSession {
  readonly id: string;
  readonly examId: string;
  readonly academicYear: string;
  readonly sessionType: string;
  readonly sessionDate?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface ExamPaper {
  readonly id: string;
  readonly sessionId: string;
  readonly subjectId: string;
  readonly language: string;
  readonly sourceDocumentRef?: string;
  readonly status: PublicationStatus;
  readonly createdAt: string;
}

export interface ExamQuestion {
  readonly id: string;
  readonly paperId: string;
  readonly questionOrder: number;
  readonly parentQuestionId?: string;
  readonly prompt: string;
  readonly maxPoints?: number;
  readonly gradingMetadata?: string;
  readonly createdAt: string;
}

export interface ExamQuestionKO {
  readonly questionId: string;
  readonly koId: string;
  readonly weight?: number;
}

export interface ExamQuestionCompetency {
  readonly questionId: string;
  readonly competencyId: string;
  readonly weight?: number;
}

// ============================================================
// IN-SESSION STATE TYPES (for tests / in-memory verification)
// ============================================================

export interface CurriculumArchitectureState {
  readonly educationSystems: EducationSystem[];
  readonly stages: EducationStage[];
  readonly grades: GradeLevel[];
  readonly tracks: CurriculumTrack[];
  readonly programs: CurriculumProgram[];
  readonly units: CurriculumUnit[];
  readonly lessons: CurriculumLesson[];
  readonly subjects: CurriculumSubject[];
  readonly knowledgeObjects: CurriculumKnowledgeObject[];
  readonly competencies: CurriculumCompetency[];
  readonly examDefinitions: ExamDefinition[];
  readonly examSessions: ExamSession[];
  readonly examPapers: ExamPaper[];
  readonly examQuestions: ExamQuestion[];
}
