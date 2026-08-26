/**
 * Qarayti.ai - Gate 07C.1: Verified Primary Coverage Matrix
 *
 * Grade × Subject matrix for P1-P6 with per-cell source provenance.
 *
 * PROVENANCE RULES:
 *   - Every cell cites at least one official source
 *   - STATUS reflects ACTUAL verification, not assumed coverage
 *   - UNIT/LESSON/EXERCISE counts are NOT fabricated — they are SOURCE_REQUIRED
 *   - Missing content is NOT_INGESTED, never FABRICATED
 *   - REVIEW_REQUIRED cells indicate unresolved conflicts
 */

import {
  CoverageStatus,
  CurriculumSourceRecord,
  SubjectCoverageEntry,
  GradeCoverageEntry,
  VerificationState,
} from '../types/curriculum-source-governance.types';

import {
  PRIMARY_GRADE_CODES,
  LAUNCH_GRADES,
  LAUNCH_STAGES,
} from './curriculum-architecture.constants';

import {
  PRIMARY_CURRICULUM_SOURCES,
  PRIMARY_SUBJECT_SOURCE_MAPPINGS,
  FRENCH_INTRODUCTION_CONFLICT,
  SubjectSourceMapping,
} from './moroccan-primary-curriculum-sources';

// ============================================================
// VERIFIED SUBJECT LIST (from official curriculum 2021)
// ============================================================

const OFFICIAL_PRIMARY_SUBJECTS = [
  { code: 'ARABIC',           nameAr: 'اللغة العربية',             nameFr: 'Arabe' },
  { code: 'FRENCH',           nameAr: 'اللغة الفرنسية',            nameFr: 'Français' },
  { code: 'MATH',             nameAr: 'الرياضيات',                 nameFr: 'Mathématiques' },
  { code: 'ISLAMIC_EDUCATION', nameAr: 'التربية الإسلامية',        nameFr: 'Enseignement Islamique' },
  { code: 'CIVIC_EDUCATION',  nameAr: 'التربية المدنية',           nameFr: 'Éducation Civique' },
  { code: 'SCIENCE',          nameAr: 'النشاط العلمي',             nameFr: 'Activité Scientifique' },
  { code: 'SPORT',            nameAr: 'التربية البدنية',           nameFr: 'Éducation Physique' },
  { code: 'ART',              nameAr: 'التربية التشكيلية',          nameFr: 'Arts Plastiques' },
  { code: 'MUSIC',            nameAr: 'التربية الموسيقية',          nameFr: 'Musique' },
] as const;

type SubjectCode = typeof OFFICIAL_PRIMARY_SUBJECTS[number]['code'];

// ============================================================
// GRADE × SUBJECT COVERAGE CELL
// ============================================================

export interface CoverageCell {
  readonly gradeCode: string;
  readonly subjectCode: string;
  readonly subjectNameAr: string;
  readonly subjectNameFr: string;
  readonly status: CoverageStatus;
  readonly sourceIds: readonly string[];
  readonly verificationState: VerificationState;
  readonly unitCountKnown: boolean;
  readonly lessonCountKnown: boolean;
  readonly exerciseCountKnown: boolean;
  readonly notes: string;
}

// ============================================================
// HELPER: Find source mapping for a subject
// ============================================================

function findSourceMapping(subjectCode: string): SubjectSourceMapping | undefined {
  return PRIMARY_SUBJECT_SOURCE_MAPPINGS.find((m) => m.subjectCode === subjectCode);
}

// ============================================================
// HELPER: Determine coverage status for a cell
// ============================================================

function determineCellStatus(
  gradeCode: string,
  subjectCode: string,
  sourceMapping: SubjectSourceMapping | undefined,
): { status: CoverageStatus; notes: string; verificationState: VerificationState } {
  if (!sourceMapping) {
    return {
      status: 'NOT_INGESTED',
      notes: 'Subject not found in verified source mappings',
      verificationState: 'UNVERIFIED',
    };
  }

  const gradeInSource = sourceMapping.confirmedGrades.includes(gradeCode);

  if (!gradeInSource) {
    // Special case: French introduction conflict
    if (subjectCode === 'FRENCH' && gradeCode === 'P1') {
      return {
        status: 'SOURCE_REQUIRED',
        notes: 'French introduction at P1: REVIEW_REQUIRED (source conflict — national standard is P3, some experimental regions P1/P2)',
        verificationState: 'REVIEW_REQUIRED',
      };
    }
    if (subjectCode === 'FRENCH' && gradeCode === 'P2') {
      return {
        status: 'SOURCE_REQUIRED',
        notes: 'French introduction at P2: REVIEW_REQUIRED (source conflict — national standard is P3, some experimental regions P1/P2)',
        verificationState: 'REVIEW_REQUIRED',
      };
    }
    return {
      status: 'NOT_INGESTED',
      notes: `Subject not confirmed at ${gradeCode} level by verified sources`,
      verificationState: 'UNVERIFIED',
    };
  }

  // Subject is confirmed at this grade level by secondary references
  // but primary source (src-primary-curriculum-2021) is AUTHORIZED_REFERENCE / UNVERIFIED
  const sourceRecord = PRIMARY_CURRICULUM_SOURCES.find(
    (s) => s.id === sourceMapping.sourceIds[0],
  );

  const verificationState: VerificationState = sourceRecord?.verificationState === 'VERIFIED'
    ? 'VERIFIED'
    : 'UNVERIFIED';

  return {
    status: 'SOURCE_REQUIRED',
    notes: `Corroborated at ${gradeCode} level by secondary references. Primary source AUTHORIZED_REFERENCE / UNVERIFIED. Grade×subject claim: SOURCE_REQUIRED. Unit/lesson/exercise counts: SOURCE_REQUIRED.`,
    verificationState,
  };
}

// ============================================================
// BUILD COVERAGE MATRIX
// ============================================================

export const VERIFIED_PRIMARY_COVERAGE_MATRIX: CoverageCell[] = [];

for (const gradeCode of [...PRIMARY_GRADE_CODES]) {
  for (const subject of OFFICIAL_PRIMARY_SUBJECTS) {
    const sourceMapping = findSourceMapping(subject.code);
    const { status, notes, verificationState } = determineCellStatus(
      gradeCode,
      subject.code,
      sourceMapping,
    );

    VERIFIED_PRIMARY_COVERAGE_MATRIX.push({
      gradeCode,
      subjectCode: subject.code,
      subjectNameAr: subject.nameAr,
      subjectNameFr: subject.nameFr,
      status,
      sourceIds: sourceMapping?.sourceIds ?? [],
      verificationState,
      unitCountKnown: false,
      lessonCountKnown: false,
      exerciseCountKnown: false,
      notes,
    });
  }
}

// ============================================================
// COVERAGE SUMMARY
// ============================================================

export const COVERAGE_SUMMARY = {
  totalCells: VERIFIED_PRIMARY_COVERAGE_MATRIX.length,
  byStatus: {
    SOURCE_REQUIRED: VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.status === 'SOURCE_REQUIRED').length,
    NOT_INGESTED: VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.status === 'NOT_INGESTED').length,
    PARTIALLY_COVERED: 0,
    FULLY_COVERED: 0,
    VERIFIED: 0,
    PUBLISHED: 0,
  },
  byVerification: {
    UNVERIFIED: VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.verificationState === 'UNVERIFIED').length,
    REVIEW_REQUIRED: VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.verificationState === 'REVIEW_REQUIRED').length,
    VERIFIED: VERIFIED_PRIMARY_COVERAGE_MATRIX.filter((c) => c.verificationState === 'VERIFIED').length,
  },
  subjectsWithSourceConflict: [FRENCH_INTRODUCTION_CONFLICT],
  sourceAuthorityNote: 'Primary source (src-primary-curriculum-2021) is AUTHORIZED_REFERENCE / UNVERIFIED — issuer not independently verified. All 54 cells are SOURCE_REQUIRED. No cell can progress beyond SOURCE_REQUIRED until the primary source issuer is verified or an OFFICIAL source is acquired.',
  notes: 'All SOURCE_REQUIRED cells lack unit/lesson/exercise counts. Source authority itself is UNVERIFIED. These must be resolved by a future ingestion gate acquiring verified official sources.',
};

// ============================================================
// NORMALIZATION BLUEPRINT
// ============================================================

/**
 * Defines how source curriculum content maps into the Gate 07A hierarchy.
 *
 * GATE 07A HIERARCHY:
 *   EducationSystem → EducationStage → GradeLevel → CurriculumUnit → CurriculumLesson
 *
 * SOURCE AUTHORITY NOTE:
 *   The primary source (src-primary-curriculum-2021) is AUTHORIZED_REFERENCE / UNVERIFIED.
 *   All mappings below are PROVISIONAL — they describe the intended mapping structure
 *   but cannot be executed until the source issuer is verified.
 *
 * OFFICIAL CURRICULUM STRUCTURE (reported in secondary references):
 *   Grade → Subject → Domain → Unit (Topic) → Lesson
 *
 * MAPPING CHALLENGES:
 *   1. Gate 07A has no explicit "Domain" level — must be modeled as metadata on CurriculumUnit
 *   2. "النشاط العلمي" (Scientific Activity) ≠ our SCIENCE code exactly — name mapping review required
 *   3. Primary has no explicit "CurriculumProgram" in Gate 07A — program maps to grade × subject
 *   4. The reported curriculum organizes by "Competencies" not "Units" — structural mismatch
 *   5. "Activity-based" pedagogy means traditional unit/lesson structure may not apply 1:1
 *   6. Source itself is UNVERIFIED — all mappings are provisional until source authority confirmed
 */

export interface NormalizationRule {
  readonly sourceField: string;
  readonly targetField: string;
  readonly mappingType: 'DIRECT' | 'DERIVED' | 'MANUAL_REVIEW' | 'NOT_MAPPABLE';
  readonly notes: string;
}

export const NORMALIZATION_BLUEPRINT: NormalizationRule[] = [
  {
    sourceField: 'Grade (P1-P6)',
    targetField: 'GradeLevel.code',
    mappingType: 'DIRECT',
    notes: 'Direct mapping: P1→grade-p1, P2→grade-p2, etc. Codes already aligned in Gate 07A.',
  },
  {
    sourceField: 'Subject (e.g., الرياضيات)',
    targetField: 'CurriculumUnit → subjectCode',
    mappingType: 'DIRECT',
    notes: 'Direct mapping for 8 of 9 subjects. SCIENCE↔النشاط العلمي requires MANUAL_REVIEW for exact scope alignment.',
  },
  {
    sourceField: 'Domain (e.g., Majalat al-Lughat)',
    targetField: 'CurriculumUnit.metadata.domain',
    mappingType: 'DERIVED',
    notes: 'No "Domain" level in Gate 07A hierarchy. Model as metadata field on CurriculumUnit. Three domains: Languages, Math/Science/Tech, Social Upbringing.',
  },
  {
    sourceField: 'Unit/Topic (e.g., الوحدة)',
    targetField: 'CurriculumUnit',
    mappingType: 'MANUAL_REVIEW',
    notes: 'Official curriculum uses competency-based organization, not traditional units. Mapping requires manual review to align competency groups with unit structure.',
  },
  {
    sourceField: 'Lesson (e.g., الدرس)',
    targetField: 'CurriculumLesson',
    mappingType: 'MANUAL_REVIEW',
    notes: 'Lesson structure varies by subject and grade. Must be extracted from full curriculum document (556 pages). Cannot be fabricated.',
  },
  {
    sourceField: 'Competency (e.g., الكفاية)',
    targetField: 'CurriculumUnit.learningObjectives',
    mappingType: 'DERIVED',
    notes: 'Competencies map to learning objectives within units. No direct Gate 07A field for competencies — use as structured metadata.',
  },
  {
    sourceField: 'Assessment Criteria',
    targetField: 'CurriculumLesson.assessmentCriteria',
    mappingType: 'NOT_MAPPABLE',
    notes: 'No Gate 07A field for assessment criteria. Must be stored in supplemental metadata or custom extension.',
  },
  {
    sourceField: 'Coefficient/Weight',
    targetField: 'N/A (primary has no coefficients)',
    mappingType: 'NOT_MAPPABLE',
    notes: 'Primary education does not use coefficients. This field is only relevant for secondary education.',
  },
];

// ============================================================
// CONTENT UNITS CATALOG (for future ingestion reference)
// ============================================================

/**
 * Known content domains from the official curriculum structure.
 * These are the 3 integrated learning domains, NOT subjects.
 */
export const OFFICIAL_PRIMARY_DOMAINS = [
  {
    code: 'LANGUAGES',
    nameAr: 'مجال اللغات',
    nameFr: 'Domaine des Langues',
    subjects: ['ARABIC', 'FRENCH'],
    notes: 'Language acquisition and communication competencies',
  },
  {
    code: 'MATH_SCIENCE_TECH',
    nameAr: 'مجال الرياضيات والعلوم والتكنولوجيا',
    nameFr: 'Domaine des Mathématiques, Sciences et Technologie',
    subjects: ['MATH', 'SCIENCE'],
    notes: 'Numerical reasoning, scientific inquiry, and technological literacy',
  },
  {
    code: 'SOCIAL_UPBRINGING',
    nameAr: 'مجال التنشئة الاجتماعية',
    nameFr: 'Domaine de la Socialisation',
    subjects: ['ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'],
    notes: 'Values, civic responsibility, physical and artistic development',
  },
] as const;

// ============================================================
// NORMALIZATION RISK REGISTER
// ============================================================

export const NORMALIZATION_RISKS = [
  {
    risk: 'Primary source issuer unverified',
    severity: 'CRITICAL',
    description: 'The primary curriculum source (src-primary-curriculum-2021) is AUTHORIZED_REFERENCE / UNVERIFIED. Issuer (MEN) not independently confirmed from accessible evidence. All 54 grade×subject cells are SOURCE_REQUIRED.',
    mitigation: 'Acquire an OFFICIAL_CURRICULUM_DOCUMENT from a verified issuer (e.g., MEN documents portal) or obtain independent verification of the existing document\'s issuer.',
  },
  {
    risk: 'Retrieval host does not imply official issuer',
    severity: 'HIGH',
    description: 'Moutamadris.ma is an independent portal, not a Ministry site. Documents hosted there cannot be assumed official. Similarly, profpress.net is a secondary mirror.',
    mitigation: 'Always distinguish issuer from retrieval host. Never infer official status from the hosting domain.',
  },
  {
    risk: 'Competency-based vs Unit-based structure',
    severity: 'HIGH',
    description: 'Reported curriculum organizes by competencies, not traditional units. Direct 1:1 mapping may not be possible.',
    mitigation: 'Map competency groups to units; accept that some lossy compression may occur. Provisional until source verified.',
  },
  {
    risk: 'SCIENCE ↔ النشاط العلمي scope mismatch',
    severity: 'MEDIUM',
    description: 'Our SCIENCE code may have different scope than "النشاط العلمي" (Scientific Activity). The reported primary name is activity-based.',
    mitigation: 'Manual review during ingestion to verify scope alignment. Provisional until source verified.',
  },
  {
    risk: 'French introduction grade ambiguity',
    severity: 'MEDIUM',
    description: 'Multiple secondary references disagree on whether French starts at P1, P2, or P3.',
    mitigation: 'Treat P3 as most-supported; P1/P2 as REVIEW_REQUIRED. Regional ingestion may vary. Provisional until source verified.',
  },
  {
    risk: 'No unit/lesson/exercise counts available',
    severity: 'HIGH',
    description: 'Cannot fabricate content structure counts. Must be provided by future ingestion from actual documents.',
    mitigation: 'Gate 07C.1 only establishes source provenance. Counts come from Gate 07C.2+ ingestion.',
  },
  {
    risk: 'Framework law cannot substitute for curriculum source',
    severity: 'HIGH',
    description: 'Law 51-17 is a system governance document, not grade×subject curriculum evidence. Vision 2015-2030 is strategic direction, not curriculum content.',
    mitigation: 'Use law/vision only for system context. Never cite as evidence for specific grade×subject claims.',
  },
];
