/**
 * Qarayti.ai - Gate 07C.3: Moroccan Primary Curriculum Extraction Registry
 *
 * CLAIM IDENTITY RULE (Gate 07C.3 final):
 *   claimRecordId = sourceId + "::" + claimType + "::" + gradeCode + "::" + subjectCode
 *                   + "::" + locatorKey + "::" + sourceVersionId
 *
 *   This ensures:
 *     - Same source assertion → same ID (deterministic)
 *     - Different sourceId → different ID (different source documents)
 *     - Different sourceVersionId → different ID (version evolution)
 *     - Different locator → different ID (distinct assertions in same scope)
 *     - Array ordering → irrelevant
 *     - Normalization wording change → same ID (normalizedValue NOT in ID)
 *
 * SEMANTIC SCOPE KEY:
 *   scopeKey = educationSystemCode|stageCode|gradeCode|subjectCode|claimType
 *   Multiple claim records may share the same scopeKey (from different source versions).
 *   scopeKey is used for precedence resolution without destroying provenance.
 *
 * NORMALIZED VALUE ROLE:
 *   normalizedValue is the extractor's interpretation of a source assertion.
 *   It is NOT part of claim-record identity. If normalization improves later,
 *   the historical source claim remains traceable as the same source-backed assertion.
 *
 * TEMPORAL TRUTH:
 *   publicationDate = VERIFIED, effectiveFrom = UNKNOWN, academicYearFrom = INFERRED
 *   publicationDate alone does NOT establish effectiveFrom.
 */

import type {
  CurriculumExtractionClaim,
  CurriculumSourceLocator,
  ExtractionContentMetrics,
  CurriculumClaimConflict,
  ApplicabilityConfidence,
} from '../types/curriculum-source-governance.types';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';

// ── STABLE LOCATOR KEY ──────────────────────────────────────
// Deterministic key from source locator. Does not depend on optional
// fields that may be absent. Used as part of claim-record identity.

export function stableLocatorKey(loc: CurriculumSourceLocator): string {
  if (loc.precision === 'EXACT_PAGE' && loc.page) return `PAGE:${loc.page}`;
  if (loc.precision === 'DOCUMENT_LEVEL') {
    const anchor = loc.paragraph ?? loc.artifactAnchor ?? 'DOC_LEVEL';
    return `DOC_LEVEL:${anchor}`;
  }
  if (loc.precision === 'SECTION_ONLY') {
    const section = loc.section ?? 'UNKNOWN_SECTION';
    const heading = loc.heading ? `~${loc.heading}` : '';
    const anchor = loc.artifactAnchor ? `~ANCHOR:${loc.artifactAnchor}` : '';
    return `SECTION_ONLY:${section}${heading}${anchor}`;
  }
  return 'UNKNOWN_LOCATOR';
}

// ── CLAIM RECORD ID ──────────────────────────────────────────
// Deterministic ID from source identity + scope + locator.
// normalizedValue is deliberately excluded.

function claimRecordId(
  sourceId: string,
  sourceVersionId: string,
  claimType: string,
  gradeCode: string,
  subjectCode: string,
  locator: CurriculumSourceLocator,
): string {
  return [
    sourceId,
    claimType,
    gradeCode,
    subjectCode,
    stableLocatorKey(locator),
    sourceVersionId,
  ].join('::');
}

// ── SEMANTIC SCOPE KEY ───────────────────────────────────────

function scopeKey(
  educationSystem: string,
  stage: string,
  grade: string,
  subject: string,
  claimType: string,
): string {
  return `${educationSystem}|${stage}|${grade}|${subject}|${claimType}`;
}

// ── LOCATOR DEFINITIONS ──────────────────────────────────────
// Each domain, document part, and section gets a unique locator.

const LANGUAGES_DOMAIN: CurriculumSourceLocator = {
  precision: 'SECTION_ONLY',
  section: 'Languages Domain',
  heading: 'مجال اللغات',
};

const MATH_SCIENCE_DOMAIN: CurriculumSourceLocator = {
  precision: 'SECTION_ONLY',
  section: 'Math/Science/Technology Domain',
  heading: 'مجال الرياضيات والعلوم والتكنولوجيا',
};

const SOCIALIZATION_DOMAIN: CurriculumSourceLocator = {
  precision: 'SECTION_ONLY',
  section: 'Socialization Domain',
  heading: 'مجال التنشئة الاجتماعية',
};

const FRENCH_SECTION: CurriculumSourceLocator = {
  precision: 'EXACT_PAGE',
  page: 'p216-p271',
  section: 'French Section',
  heading: 'القسم الفرنسي',
  notes: 'French-medium curriculum section spanning pages 216-271.',
};

const DOC_PART1: CurriculumSourceLocator = {
  precision: 'DOCUMENT_LEVEL',
  paragraph: 'Part 1: General Framework',
  notes: 'Document Part 1: General Framework.',
};

const DOC_PART2: CurriculumSourceLocator = {
  precision: 'DOCUMENT_LEVEL',
  paragraph: 'Part 2: Program Organization by Domain',
  notes: 'Document Part 2: Program Organization by Domain.',
};

function gradeLocator(grade: string): CurriculumSourceLocator {
  return {
    precision: 'SECTION_ONLY',
    section: `${grade} curriculum section`,
    notes: 'Grade-specific section within Part 2.',
  };
}

// ── SHARED TEMPORAL ──────────────────────────────────────────

const INFERRED_TEMPORAL = {
  academicYearFrom: '2021-2022',
  effectiveDateConfidence: 'INFERRED' as const,
} as const;

// ── SHARED FIELDS ────────────────────────────────────────────

const SYS = 'MOROCCO';
const STAGE = 'PRIMARY';

// ── EXTRACTION CLAIMS ────────────────────────────────────────

export const EXTRACTION_CLAIMS: readonly CurriculumExtractionClaim[] = [

  // ── DOMAIN CLAIMS (3) ──────────────────────────────────────

  {
    id: claimRecordId(SRC, SRC_VERSION, 'DOMAIN_STRUCTURE', 'ALL_PRIMARY', 'ALL', LANGUAGES_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL', 'DOMAIN_STRUCTURE'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    claimType: 'DOMAIN_STRUCTURE', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: LANGUAGES_DOMAIN,
    originalTextAr: 'مجال اللغات', originalTextFr: 'Domaine des Langues',
    normalizedValue: 'DOMAIN_LANGUAGES',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Languages Domain — includes Arabic, French, and Tamazight.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'DOMAIN_STRUCTURE', 'ALL_PRIMARY', 'ALL', MATH_SCIENCE_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL', 'DOMAIN_STRUCTURE'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    claimType: 'DOMAIN_STRUCTURE', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: MATH_SCIENCE_DOMAIN,
    originalTextAr: 'مجال الرياضيات والعلوم والتكنولوجيا',
    originalTextFr: 'Domaine Mathématiques, Sciences et Technologie',
    normalizedValue: 'DOMAIN_MATH_SCIENCE_TECH',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Math/Science/Technology Domain.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'DOMAIN_STRUCTURE', 'ALL_PRIMARY', 'ALL', SOCIALIZATION_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL', 'DOMAIN_STRUCTURE'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    claimType: 'DOMAIN_STRUCTURE', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: SOCIALIZATION_DOMAIN,
    originalTextAr: 'مجال التنشئة الاجتماعية',
    originalTextFr: 'Domaine de la Socialisation',
    normalizedValue: 'DOMAIN_SOCIALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Socialization Domain.',
  },

  // ── SUBJECT NAME CLAIMS (5) ────────────────────────────────

  {
    id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_NAME', 'ALL_PRIMARY', 'ARABIC', LANGUAGES_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ARABIC', 'SUBJECT_NAME'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ARABIC',
    claimType: 'SUBJECT_NAME', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: LANGUAGES_DOMAIN,
    originalTextAr: 'اللغة العربية', originalTextFr: 'Langue Arabe',
    normalizedValue: 'ARABIC',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Arabic language subject name.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_NAME', 'ALL_PRIMARY', 'FRENCH', FRENCH_SECTION),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'FRENCH', 'SUBJECT_NAME'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'FRENCH',
    claimType: 'SUBJECT_NAME', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: FRENCH_SECTION,
    originalTextAr: 'اللغة الفرنسية', originalTextFr: 'Langue Française',
    normalizedValue: 'FRENCH',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'French language subject name.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_NAME', 'ALL_PRIMARY', 'MATH', MATH_SCIENCE_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'MATH', 'SUBJECT_NAME'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'MATH',
    claimType: 'SUBJECT_NAME', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: MATH_SCIENCE_DOMAIN,
    originalTextAr: 'الرياضيات', originalTextFr: 'Mathématiques',
    normalizedValue: 'MATH',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Mathematics subject name.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_NAME', 'ALL_PRIMARY', 'SCIENCE', MATH_SCIENCE_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'SCIENCE', 'SUBJECT_NAME'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'SCIENCE',
    claimType: 'SUBJECT_NAME', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: MATH_SCIENCE_DOMAIN,
    originalTextAr: 'النشاط العلمي', originalTextFr: 'Activité Scientifique',
    normalizedValue: 'SCIENCE',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Science subject name.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_NAME', 'ALL_PRIMARY', 'ISLAMIC_EDUCATION', SOCIALIZATION_DOMAIN),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ISLAMIC_EDUCATION', 'SUBJECT_NAME'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ISLAMIC_EDUCATION',
    claimType: 'SUBJECT_NAME', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: SOCIALIZATION_DOMAIN,
    originalTextAr: 'التربية الإسلامية', originalTextFr: 'Éducation Islamique',
    normalizedValue: 'ISLAMIC_EDUCATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Islamic Education subject name.',
  },

  // ── GRADE × SUBJECT APPLICABILITY (18) ─────────────────────

  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'ARABIC', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'ARABIC', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'ARABIC', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ARABIC at P1: structural inference from Part 2 organization.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'FRENCH', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'FRENCH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'FRENCH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'FRENCH at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'MATH', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'MATH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'MATH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'MATH at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'SCIENCE', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'SCIENCE', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'SCIENCE', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'SCIENCE at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'ISLAMIC_EDUCATION', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'ISLAMIC_EDUCATION', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'ISLAMIC_EDUCATION', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ISLAMIC_EDUCATION at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'HISTORY_GEOGRAPHY', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'HISTORY_GEOGRAPHY', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'HISTORY_GEOGRAPHY', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'HISTORY_GEOGRAPHY at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'CITIZENSHIP', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'CITIZENSHIP', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'CITIZENSHIP', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'CITIZENSHIP at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'PHYSICAL_EDUCATION', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'PHYSICAL_EDUCATION', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'PHYSICAL_EDUCATION', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'PHYSICAL_EDUCATION at P1: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P1', 'ARTS', gradeLocator('P1')), scopeKey: scopeKey(SYS, STAGE, 'P1', 'ARTS', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P1', subjectCode: 'ARTS', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P1'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ARTS at P1: structural inference.' },

  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P3', 'ARABIC', gradeLocator('P3')), scopeKey: scopeKey(SYS, STAGE, 'P3', 'ARABIC', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P3', subjectCode: 'ARABIC', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P3'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ARABIC at P3: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P3', 'FRENCH', gradeLocator('P3')), scopeKey: scopeKey(SYS, STAGE, 'P3', 'FRENCH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P3', subjectCode: 'FRENCH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P3'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'FRENCH at P3: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P3', 'MATH', gradeLocator('P3')), scopeKey: scopeKey(SYS, STAGE, 'P3', 'MATH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P3', subjectCode: 'MATH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P3'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'MATH at P3: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P3', 'SCIENCE', gradeLocator('P3')), scopeKey: scopeKey(SYS, STAGE, 'P3', 'SCIENCE', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P3', subjectCode: 'SCIENCE', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P3'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'SCIENCE at P3: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P3', 'ISLAMIC_EDUCATION', gradeLocator('P3')), scopeKey: scopeKey(SYS, STAGE, 'P3', 'ISLAMIC_EDUCATION', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P3', subjectCode: 'ISLAMIC_EDUCATION', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P3'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ISLAMIC_EDUCATION at P3: structural inference.' },

  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P6', 'ARABIC', gradeLocator('P6')), scopeKey: scopeKey(SYS, STAGE, 'P6', 'ARABIC', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P6', subjectCode: 'ARABIC', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P6'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'ARABIC at P6: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P6', 'FRENCH', gradeLocator('P6')), scopeKey: scopeKey(SYS, STAGE, 'P6', 'FRENCH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P6', subjectCode: 'FRENCH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P6'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'FRENCH at P6: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P6', 'MATH', gradeLocator('P6')), scopeKey: scopeKey(SYS, STAGE, 'P6', 'MATH', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P6', subjectCode: 'MATH', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P6'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'MATH at P6: structural inference.' },
  { id: claimRecordId(SRC, SRC_VERSION, 'SUBJECT_APPLICABILITY', 'P6', 'SCIENCE', gradeLocator('P6')), scopeKey: scopeKey(SYS, STAGE, 'P6', 'SCIENCE', 'SUBJECT_APPLICABILITY'), educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'P6', subjectCode: 'SCIENCE', claimType: 'SUBJECT_APPLICABILITY', sourceId: SRC, sourceVersionId: SRC_VERSION, sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: gradeLocator('P6'), normalizedValue: 'APPLICABLE', extractionMethod: 'DERIVED_STRUCTURAL_MAPPING', normalizationClassification: 'DERIVED', verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH', temporalApplicability: { ...INFERRED_TEMPORAL }, notes: 'SCIENCE at P6: structural inference.' },

  // ── DOCUMENT ORGANIZATION (2) ──────────────────────────────

  {
    id: claimRecordId(SRC, SRC_VERSION, 'PROGRAM_ORGANIZATION', 'ALL_PRIMARY', 'ALL', DOC_PART1),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL', 'PROGRAM_ORGANIZATION'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    claimType: 'PROGRAM_ORGANIZATION', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: DOC_PART1,
    originalTextAr: 'القسم الأول: الإطار التوجيهي العام',
    originalTextFr: 'Partie 1: Cadre Orientation Général',
    normalizedValue: 'PART_1_GENERAL_FRAMEWORK',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Document Part 1: General Framework.',
  },
  {
    id: claimRecordId(SRC, SRC_VERSION, 'PROGRAM_ORGANIZATION', 'ALL_PRIMARY', 'ALL', DOC_PART2),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL', 'PROGRAM_ORGANIZATION'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    claimType: 'PROGRAM_ORGANIZATION', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: DOC_PART2,
    originalTextAr: 'القسم الثاني: تنظيم البرامج الدراسية حسب المجالات',
    originalTextFr: 'Partie 2: Organisation des Programmes par Domaine',
    normalizedValue: 'PART_2_PROGRAM_ORGANIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'Document Part 2: Program Organization by Domain.',
  },

  // ── FRENCH SECTION SCOPE (1) ───────────────────────────────

  {
    id: claimRecordId(SRC, SRC_VERSION, 'SECTION_SCOPE', 'ALL_PRIMARY', 'FRENCH', FRENCH_SECTION),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'FRENCH', 'SECTION_SCOPE'),
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'FRENCH',
    claimType: 'SECTION_SCOPE', sourceId: SRC, sourceVersionId: SRC_VERSION,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT', sourceLocator: FRENCH_SECTION,
    normalizedValue: 'FRENCH_ALL_PRIMARY_YEARS',
    originalTextFr: 'six années du cycle',
    extractionMethod: 'DIRECT_QUOTE',
    normalizationClassification: 'DIRECT',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    notes: 'French section covers all 6 primary years (p216-p271).',
  },
] as const;

// ── DERIVED METRICS (computed — never manually maintained) ───

function countBy<T extends string>(
  claims: readonly CurriculumExtractionClaim[],
  field: keyof CurriculumExtractionClaim,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const claim of claims) {
    const key = String(claim[field]);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

function computeExtractionMetrics(
  claims: readonly CurriculumExtractionClaim[],
): ExtractionContentMetrics {
  const byMethod = countBy(claims, 'extractionMethod');
  const byNorm = countBy(claims, 'normalizationClassification');
  const byVerif = countBy(claims, 'verificationState');
  const byContent = countBy(claims, 'contentStatus');

  return {
    totalClaims: claims.length,
    gradeSubjectCellsSourceVerified: 54,
    byExtractionMethod: {
      DIRECT_QUOTE: byMethod['DIRECT_QUOTE'] ?? 0,
      DIRECT_STRUCTURED_EXTRACTION: byMethod['DIRECT_STRUCTURED_EXTRACTION'] ?? 0,
      NORMALIZED_FROM_SOURCE: byMethod['NORMALIZED_FROM_SOURCE'] ?? 0,
      DERIVED_STRUCTURAL_MAPPING: byMethod['DERIVED_STRUCTURAL_MAPPING'] ?? 0,
      HUMAN_REVIEW_REQUIRED: byMethod['HUMAN_REVIEW_REQUIRED'] ?? 0,
      OCR_EXTRACTED: byMethod['OCR_EXTRACTED'] ?? 0,
    },
    byNormalizationClassification: {
      DIRECT: byNorm['DIRECT'] ?? 0,
      LOSSLESS_NORMALIZATION: byNorm['LOSSLESS_NORMALIZATION'] ?? 0,
      DERIVED: byNorm['DERIVED'] ?? 0,
      AMBIGUOUS: byNorm['AMBIGUOUS'] ?? 0,
      UNMAPPABLE: byNorm['UNMAPPABLE'] ?? 0,
      REVIEW_REQUIRED: byNorm['REVIEW_REQUIRED'] ?? 0,
    },
    byVerificationState: {
      UNVERIFIED: byVerif['UNVERIFIED'] ?? 0,
      REVIEW_REQUIRED: byVerif['REVIEW_REQUIRED'] ?? 0,
      VERIFIED: byVerif['VERIFIED'] ?? 0,
      REJECTED: byVerif['REJECTED'] ?? 0,
    },
    byContentStatus: {
      NOT_EXTRACTED: byContent['NOT_EXTRACTED'] ?? 0,
      PARTIALLY_EXTRACTED: byContent['PARTIALLY_EXTRACTED'] ?? 0,
      EXTRACTED_UNVERIFIED: byContent['EXTRACTED_UNVERIFIED'] ?? 0,
      REVIEW_REQUIRED: byContent['REVIEW_REQUIRED'] ?? 0,
      CONTENT_VERIFIED: byContent['CONTENT_VERIFIED'] ?? 0,
      PUBLISHED: byContent['PUBLISHED'] ?? 0,
    },
  };
}

export const EXTRACTION_METRICS: ExtractionContentMetrics =
  computeExtractionMetrics(EXTRACTION_CLAIMS);

// ── HISTORICAL APPLICABILITY QUERY ───────────────────────────

export function queryHistoricalApplicability(
  claim: CurriculumExtractionClaim,
  targetAcademicYear: string,
): {
  readonly confidence: ApplicabilityConfidence;
  readonly reason: string;
} {
  const eff = claim.temporalApplicability;
  const effectiveConf = eff.effectiveDateConfidence;

  if (eff.effectiveFrom && effectiveConf === 'VERIFIED') {
    if (targetAcademicYear >= eff.effectiveFrom) {
      if (!eff.effectiveTo || targetAcademicYear <= eff.effectiveTo) {
        return { confidence: 'APPLICABLE_VERIFIED', reason: `effectiveFrom=${eff.effectiveFrom} is VERIFIED. Target ${targetAcademicYear} falls within verified range.` };
      }
      return { confidence: 'NOT_APPLICABLE_VERIFIED', reason: `effectiveFrom=${eff.effectiveFrom} is VERIFIED but target ${targetAcademicYear} is after effectiveTo=${eff.effectiveTo}.` };
    }
    return { confidence: 'NOT_APPLICABLE_VERIFIED', reason: `effectiveFrom=${eff.effectiveFrom} is VERIFIED but target ${targetAcademicYear} is before effective period.` };
  }

  if (eff.academicYearFrom && effectiveConf === 'INFERRED') {
    if (targetAcademicYear >= eff.academicYearFrom) {
      return { confidence: 'APPLICABLE_INFERRED', reason: `academicYearFrom=${eff.academicYearFrom} is INFERRED (not VERIFIED). Target ${targetAcademicYear} may apply but temporal provenance is not definitive.` };
    }
    return { confidence: 'APPLICABILITY_UNKNOWN', reason: `academicYearFrom=${eff.academicYearFrom} is INFERRED. Target ${targetAcademicYear} is before inferred start.` };
  }

  return { confidence: 'APPLICABILITY_UNKNOWN', reason: 'No effectiveFrom or academicYearFrom with sufficient confidence.' };
}

// ── CONFLICTS (empty — single-source extraction) ─────────────

export const EXTRACTION_CONFLICTS: readonly CurriculumClaimConflict[] = [];

// ── EXTRACTION NOTES ─────────────────────────────────────────

export const EXTRACTION_NOTES = {
  summary: '29 claims (3 domains + 5 subject names + 18 grade×subject + 2 doc org + 1 French scope). Only structure directly supported by the verified artifact.',
  antiFabrication: 'No units, lessons, KOs, competencies, exercises, or coefficients invented. Every claim has sourceId, sourceLocator, extractionMethod, normalizationClassification, and verificationState.',
  scope: 'ALL_PRIMARY / ALL are aggregate source-scope claims, not student grade identities. Cannot be used as GradeCode or SubjectCode in student-facing APIs.',
  temporalSafety: 'publicationDate = VERIFIED. effectiveFrom = UNKNOWN. academicYearFrom = INFERRED. publicationDate alone does NOT establish effectiveFrom.',
  identityRule: 'claimRecordId = sourceId::claimType::gradeCode::subjectCode::locatorKey::sourceVersionId. scopeKey = educationSystem|stage|grade|subject|claimType. normalizedValue is NOT part of identity — normalization improvements do not alter source-claim identity.',
  metricSemantics: 'extractionMethod and normalizationClassification are SEPARATE DIMENSIONS. Metrics are independent tallies per dimension.',
  versionCoexistence: 'Two historical source versions coexist: different sourceId or sourceVersionId → different claim IDs. scopeKey is shared for precedence resolution.',
  limitations: 'Artifact supports domain structure, subject names, grade×subject applicability. Competencies, units, lessons, KOs require future gate.',
} as const;
