/**
 * Qarayti.ai - Gate 07B: Moroccan Curriculum Coverage Manifest
 *
 * Machine-readable representation of the intended Moroccan launch curriculum.
 *
 * RULES:
 *   - This manifest defines TARGETS, not completed content
 *   - Subjects are based on the existing MOROCCAN_SUBJECTS_CATALOG
 *   - Missing content is explicitly NOT_INGESTED or SOURCE_REQUIRED
 *   - No fabricated units, lessons, or exercises
 *   - No AI-generated curriculum presented as official
 */

import {
  GradeCoverageEntry,
  SubjectCoverageEntry,
  CoverageStatus,
  ExamRelevanceLevel,
  SourceClassification,
  VerificationState,
  CanonicalPublicationState,
  IngestionState,
  TrustEscalationAttempt,
} from '../types/curriculum-source-governance.types';

import {
  LAUNCH_GRADES,
  LAUNCH_STAGES,
  PRIMARY_GRADE_CODES,
  MIDDLE_GRADE_CODES,
  SECONDARY_GRADE_CODES,
} from './curriculum-architecture.constants';

import { MOROCCAN_SUBJECTS_CATALOG } from './education.constants';

// ============================================================
// MOROCCAN SUBJECT MAPPING
// ============================================================

interface MoroccanSubjectDef {
  readonly code: string;
  readonly nameAr: string;
  readonly nameFr: string;
  readonly primary: boolean;
  readonly middle: boolean;
  readonly secondary: boolean;
}

export const MOROCCAN_LAUNCH_SUBJECTS: MoroccanSubjectDef[] = [
  { code: 'ARABIC', nameAr: 'اللغة العربية', nameFr: 'Arabe', primary: true, middle: true, secondary: true },
  { code: 'FRENCH', nameAr: 'اللغة الفرنسية', nameFr: 'Français', primary: true, middle: true, secondary: true },
  { code: 'MATH', nameAr: 'الرياضيات', nameFr: 'Mathématiques', primary: true, middle: true, secondary: true },
  { code: 'ISLAMIC_EDUCATION', nameAr: 'التربية الإسلامية', nameFr: 'Enseignement Islamique', primary: true, middle: true, secondary: true },
  { code: 'CIVIC_EDUCATION', nameAr: 'التربية المدنية', nameFr: 'Éducation Civique', primary: true, middle: true, secondary: false },
  { code: 'SCIENCE', nameAr: 'التربية العلمية', nameFr: 'Sciences', primary: true, middle: true, secondary: false },
  { code: 'HISTORY_GEOGRAPHY', nameAr: 'التاريخ والجغرافيا', nameFr: 'Histoire-Géographie', primary: false, middle: true, secondary: true },
  { code: 'PHYSICS', nameAr: 'الفيزياء', nameFr: 'Physique', primary: false, middle: false, secondary: true },
  { code: 'SVT', nameAr: 'علوم الحياة والأرض', nameFr: 'Sciences de la Vie et de la Terre', primary: false, middle: false, secondary: true },
  { code: 'ENGLISH', nameAr: 'اللغة الإنجليزية', nameFr: 'Anglais', primary: false, middle: true, secondary: true },
  { code: 'SPORT', nameAr: 'التربية البدنية', nameFr: 'Éducation Physique', primary: true, middle: true, secondary: true },
  { code: 'ART', nameAr: 'التربية التشكيلية', nameFr: 'Arts Plastiques', primary: true, middle: true, secondary: false },
  { code: 'MUSIC', nameAr: 'التربية الموسيقية', nameFr: 'Musique', primary: true, middle: false, secondary: false },
  { code: 'TECHNOLOGY', nameAr: 'التكنولوجيا', nameFr: 'Technologie', primary: false, middle: true, secondary: false },
];

// ============================================================
// COVERAGE MANIFEST — GRADE × SUBJECT MATRIX
// ============================================================

function gradeId(code: string): string {
  const g = LAUNCH_GRADES.find((gr) => gr.code === code);
  if (!g) throw new Error('Grade not found: ' + code);
  return g.id;
}

function stageId(code: string): string {
  const s = LAUNCH_STAGES.find((st) => st.code === code);
  if (!s) throw new Error('Stage not found: ' + code);
  return s.id;
}

function subjectId(code: string): string {
  const s = MOROCCAN_SUBJECTS_CATALOG.find((sub) => sub.code === code);
  return s?.id ?? 'subj-' + code.toLowerCase();
}

function makeSubject(code: string): SubjectCoverageEntry {
  const def = MOROCCAN_LAUNCH_SUBJECTS.find((s) => s.code === code);
  if (!def) throw new Error('Subject not found: ' + code);
  return {
    subjectId: subjectId(code),
    subjectCode: code,
    subjectNameAr: def.nameAr,
    subjectNameFr: def.nameFr,
    status: 'NOT_INGESTED' as CoverageStatus,
    hasUnits: false,
    hasLessons: false,
    hasKO: false,
    hasExercises: false,
  };
}

function subjectsForGrade(gradeCode: string): SubjectCoverageEntry[] {
  const isPrimary = PRIMARY_GRADE_CODES.includes(gradeCode as any);
  const isMiddle = MIDDLE_GRADE_CODES.includes(gradeCode as any);
  const isSecondary = SECONDARY_GRADE_CODES.includes(gradeCode as any);

  return MOROCCAN_LAUNCH_SUBJECTS
    .filter((s) => (isPrimary && s.primary) || (isMiddle && s.middle) || (isSecondary && s.secondary))
    .map((s) => makeSubject(s.code));
}

function examRelevance(gradeCode: string): ExamRelevanceLevel {
  if (gradeCode === 'M3') return 'NATIONAL_APPLICABLE';
  if (gradeCode === 'S1') return 'REGIONAL_APPLICABLE';
  if (gradeCode === 'S2') return 'REGIONAL_APPLICABLE';
  if (gradeCode === 'S3') return 'BAC_APPLICABLE';
  if (MIDDLE_GRADE_CODES.includes(gradeCode as any)) return 'LOCAL_ONLY';
  if (PRIMARY_GRADE_CODES.includes(gradeCode as any)) return 'LOCAL_ONLY';
  return 'NONE';
}

function stageCodeForGrade(gradeCode: string): string {
  if (PRIMARY_GRADE_CODES.includes(gradeCode as any)) return 'PRIMARY';
  if (MIDDLE_GRADE_CODES.includes(gradeCode as any)) return 'MIDDLE_SCHOOL';
  if (SECONDARY_GRADE_CODES.includes(gradeCode as any)) return 'QUALIFYING_SECONDARY';
  throw new Error('Unknown grade: ' + gradeCode);
}

const ALL_GRADE_CODES = [
  ...PRIMARY_GRADE_CODES,
  ...MIDDLE_GRADE_CODES,
  ...SECONDARY_GRADE_CODES,
];

export const MOROCCAN_COVERAGE_MANIFEST: GradeCoverageEntry[] = ALL_GRADE_CODES.map((code) => {
  const grade = LAUNCH_GRADES.find((g) => g.code === code)!;
  const subjects = subjectsForGrade(code);
  return {
    gradeId: grade.id,
    gradeCode: code,
    stageCode: stageCodeForGrade(code),
    nameAr: grade.nameAr,
    nameFr: grade.nameFr,
    subjects,
    overallStatus: 'NOT_INGESTED' as CoverageStatus,
    examRelevance: examRelevance(code),
  };
});

// ============================================================
// SOURCE CLASSIFICATION REFERENCE
// ============================================================

export const SOURCE_CLASSIFICATIONS: Record<SourceClassification, { labelAr: string; labelFr: string; trustedForPublishing: boolean }> = {
  OFFICIAL_MINISTRY: { labelAr: 'official ministry', labelFr: 'Source ministérielle officielle', trustedForPublishing: true },
  OFFICIAL_EXAM: { labelAr: 'official exam', labelFr: 'Examen officiel', trustedForPublishing: true },
  OFFICIAL_CURRICULUM_DOCUMENT: { labelAr: 'official curriculum document', labelFr: 'Document curriculaire officiel', trustedForPublishing: true },
  OFFICIAL_TEXTBOOK_OR_GUIDE: { labelAr: 'official textbook', labelFr: 'Manuel ou guide officiel', trustedForPublishing: true },
  AUTHORIZED_REFERENCE: { labelAr: 'authorized reference', labelFr: 'Référence autorisée', trustedForPublishing: true },
  SECONDARY_REFERENCE: { labelAr: 'secondary reference', labelFr: 'Référence secondaire', trustedForPublishing: false },
  INTERNAL_DRAFT: { labelAr: 'internal draft', labelFr: 'Brouillon interne', trustedForPublishing: false },
  AI_GENERATED: { labelAr: 'AI generated', labelFr: 'Généré par IA', trustedForPublishing: false },
};

// ============================================================
// INGESTION PIPELINE VALIDATION BOUNDARIES
// ============================================================

export const INGESTION_STATE_MACHINE: Record<IngestionState, IngestionState[]> = {
  SOURCE_DISCOVERED: ['SOURCE_CAPTURED', 'REJECTED'],
  SOURCE_CAPTURED: ['PARSED', 'REJECTED'],
  PARSED: ['NORMALIZED', 'QUARANTINED'],
  NORMALIZED: ['MAPPED', 'QUARANTINED'],
  MAPPED: ['REVIEW_REQUIRED', 'QUARANTINED'],
  REVIEW_REQUIRED: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['RETIRED'],
  REJECTED: [],
  QUARANTINED: ['REVIEW_REQUIRED', 'REJECTED'],
  RETIRED: [],
};

// ============================================================
// INGESTION REJECTION REASONS
// ============================================================

export const INGESTION_REJECTION_REASONS = {
  MISSING_SOURCE: 'No source record provided',
  UNKNOWN_GRADE: 'Target grade not found in curriculum architecture',
  UNKNOWN_SUBJECT: 'Target subject not found in curriculum catalog',
  INVALID_PARENT_HIERARCHY: 'Parent entity does not exist in hierarchy',
  DUPLICATE_CANONICAL: 'Content with same canonical identity already exists',
  CONFLICTING_VERSIONS: 'Conflicting curriculum version for same grade/subject',
  INVALID_KO_MAPPING: 'Knowledge object mapping references invalid entity',
  UNSUPPORTED_EXAM_MAPPING: 'Exam mapping references unsupported structure',
  AI_GENERATED_AS_OFFICIAL: 'AI-generated content cannot be presented as official curriculum',
  PUBLISHED_WITHOUT_VERIFICATION: 'Content cannot be published without verification',
  MISSING_VERIFICATION: 'Source record lacks verification state',
  UNTRUSTED_SOURCE: 'Source classification not trusted for publishing',
} as const;

// ============================================================
// TRUST ESCALATION ADVERSARIAL TESTS
// ============================================================

export const TRUST_ESCALATION_ATTEMPTS: TrustEscalationAttempt[] = [
  {
    description: 'AI-generated content presented as OFFICIAL_MINISTRY',
    shouldFail: true,
    failureReason: 'AI_GENERATED source cannot be trusted for publishing',
  },
  {
    description: 'UNVERIFIED content marked as PUBLISHED',
    shouldFail: true,
    failureReason: 'DB CHECK constraint rejects PUBLISHED + UNVERIFIED provenance',
  },
  {
    description: 'INTERNAL_DRAFT promoted to PUBLISHED without review',
    shouldFail: true,
    failureReason: 'INTERNAL_DRAFT not trusted for publishing',
  },
  {
    description: 'Content with no source record attempts PUBLISHED',
    shouldFail: true,
    failureReason: 'Source record mandatory for canonical content',
  },
  {
    description: 'SECONDARY_REFERENCE used as sole source for national curriculum',
    shouldFail: true,
    failureReason: 'SECONDARY_REFERENCE not trusted for publishing',
  },
];
