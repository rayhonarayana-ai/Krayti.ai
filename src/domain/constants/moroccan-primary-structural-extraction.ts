/**
 * Qarayti.ai - Gate 07C.4: Moroccan Primary Curriculum Structural Extraction
 *
 * SOURCE: src-primary-curriculum-2021 (Al-Manhaj Al-Dirasi, July 2021, Version Finale)
 *
 * STRUCTURAL EXTRACTION RULES:
 *   - Only structure explicitly present in the artifact is extracted
 *   - No invented units, lessons, competencies, exercises, or content
 *   - Every element retains claim-level provenance
 *   - IDs are source/version/locator safe
 *   - Original Arabic/French terminology preserved
 *   - Completeness is measured against artifact structure, not invented denominators
 *
 * DOCUMENT STRUCTURE (from artifact):
 *   Part 1: General Framework (القسم الأول: الإطار التوجيهي العام)
 *   Part 2: Program Organization by Domain (القسم الثاني: تنظيم البرامج الدراسية حسب المجالات)
 *     Domain 1: Languages (مجال اللغات) — ARABIC, FRENCH
 *     Domain 2: Math/Science/Tech (مجال الرياضيات والعلوم والتكنولوجيا) — MATH, SCIENCE
 *     Domain 3: Socialization (مجال التنشئة الاجتماعية) — ISLAMIC_EDUCATION, CIVIC_EDUCATION, SPORT, ART, MUSIC
 *
 * GRADE COVERAGE:
 *   The document covers all 6 primary grades (P1-P6).
 *   Each grade section within Part 2 lists subjects organized by domain.
 *
 * HIERARCHY:
 *   Document → Part → Domain → Subject → Grade Section
 *   (only when explicitly supported by artifact structure)
 */

import type {
  CurriculumStructuralElement,
  CurriculumSourceLocator,
  StructuralExtractionMetrics,
  GradeExtractionEntry,
  SubjectExtractionEntry,
  ExtractionGap,
  SourceStructuralType,
  NormalizedStructuralType,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';
const SYS = 'MOROCCO';
const STAGE = 'PRIMARY';

// ── SHARED TEMPORAL ──────────────────────────────────────────

const INFERRED_TEMPORAL = {
  academicYearFrom: '2021-2022',
  effectiveDateConfidence: 'INFERRED' as const,
} as const;

// ── OFFICIAL SUBJECTS (from artifact) ────────────────────────

const OFFICIAL_SUBJECTS = [
  { code: 'ARABIC', nameAr: 'اللغة العربية', nameFr: 'Arabe', domain: 'LANGUAGES' },
  { code: 'FRENCH', nameAr: 'اللغة الفرنسية', nameFr: 'Français', domain: 'LANGUAGES' },
  { code: 'MATH', nameAr: 'الرياضيات', nameFr: 'Mathématiques', domain: 'MATH_SCIENCE_TECH' },
  { code: 'SCIENCE', nameAr: 'النشاط العلمي', nameFr: 'Activité Scientifique', domain: 'MATH_SCIENCE_TECH' },
  { code: 'ISLAMIC_EDUCATION', nameAr: 'التربية الإسلامية', nameFr: 'Enseignement Islamique', domain: 'SOCIALIZATION' },
  { code: 'CIVIC_EDUCATION', nameAr: 'التربية المدنية', nameFr: 'Éducation Civique', domain: 'SOCIALIZATION' },
  { code: 'SPORT', nameAr: 'التربية البدنية', nameFr: 'Éducation Physique', domain: 'SOCIALIZATION' },
  { code: 'ART', nameAr: 'التربية التشكيلية', nameFr: 'Arts Plastiques', domain: 'SOCIALIZATION' },
  { code: 'MUSIC', nameAr: 'التربية الموسيقية', nameFr: 'Musique', domain: 'SOCIALIZATION' },
] as const;

// ── DOMAINS ──────────────────────────────────────────────────

const DOMAINS = [
  { code: 'LANGUAGES', nameAr: 'مجال اللغات', nameFr: 'Domaine des Langues', order: 1 },
  { code: 'MATH_SCIENCE_TECH', nameAr: 'مجال الرياضيات والعلوم والتكنولوجيا', nameFr: 'Domaine Mathématiques, Sciences et Technologie', order: 2 },
  { code: 'SOCIALIZATION', nameAr: 'مجال التنشئة الاجتماعية', nameFr: 'Domaine de la Socialisation', order: 3 },
] as const;

// ── STABLE ID GENERATION ─────────────────────────────────────
// Source-safe, version-safe, locator-safe identity.

function stableLocatorKey(loc: CurriculumSourceLocator): string {
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

function structuralElementId(
  sourceId: string,
  sourceVersionId: string,
  gradeCode: string,
  subjectCode: string,
  sourceStructuralType: string,
  locator: CurriculumSourceLocator,
): string {
  return [
    sourceId,
    sourceVersionId,
    gradeCode,
    subjectCode,
    sourceStructuralType,
    stableLocatorKey(locator),
  ].join('::');
}

function scopeKey(
  educationSystem: string,
  stage: string,
  grade: string,
  subject: string,
): string {
  return `${educationSystem}|${stage}|${grade}|${subject}`;
}

// ── LOCATOR FACTORIES ────────────────────────────────────────

const DOC_PART1_LOCATOR: CurriculumSourceLocator = {
  precision: 'DOCUMENT_LEVEL',
  paragraph: 'Part 1: General Framework',
  notes: 'Document Part 1.',
};

const DOC_PART2_LOCATOR: CurriculumSourceLocator = {
  precision: 'DOCUMENT_LEVEL',
  paragraph: 'Part 2: Program Organization by Domain',
  notes: 'Document Part 2.',
};

function domainLocator(domainCode: string): CurriculumSourceLocator {
  const d = DOMAINS.find((dm) => dm.code === domainCode);
  return {
    precision: 'SECTION_ONLY',
    section: d?.nameFr ?? domainCode,
    heading: d?.nameAr,
  };
}

function gradeLocator(gradeCode: string): CurriculumSourceLocator {
  return {
    precision: 'SECTION_ONLY',
    section: `${gradeCode} curriculum section`,
    notes: `Grade-specific section within Part 2.`,
  };
}

function subjectGradeLocator(
  domainCode: string,
  gradeCode: string,
): CurriculumSourceLocator {
  const d = DOMAINS.find((dm) => dm.code === domainCode);
  return {
    precision: 'SECTION_ONLY',
    section: `${d?.nameFr ?? domainCode} — ${gradeCode}`,
    heading: `${d?.nameAr ?? ''} — ${gradeCode}`,
  };
}

// ── STRUCTURAL ELEMENTS ──────────────────────────────────────

const elements: CurriculumStructuralElement[] = [];

function add(el: CurriculumStructuralElement) {
  elements.push(el);
}

// ── DOCUMENT PARTS (2) ──────────────────────────────────────

add({
  id: structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', 'ALL', 'DOCUMENT_PART', DOC_PART1_LOCATOR),
  scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL'),
  sourceId: SRC, sourceVersionId: SRC_VERSION,
  educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
  sourceStructuralType: 'DOCUMENT_PART',
  sourceTerm: 'Part 1: General Framework',
  sourceTermAr: 'القسم الأول: الإطار التوجيهي العام',
  sourceTermFr: 'Part 1: Cadre Orientation Général',
  normalizedStructuralType: 'DOCUMENT_PART',
  orderInSource: 1,
  sourceLocator: DOC_PART1_LOCATOR,
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  normalizationClassification: 'LOSSLESS_NORMALIZATION',
  verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED',
  temporalApplicability: { ...INFERRED_TEMPORAL },
  reviewNotes: 'Document Part 1: General Framework.',
});

add({
  id: structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', 'ALL', 'DOCUMENT_PART', DOC_PART2_LOCATOR),
  scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL'),
  sourceId: SRC, sourceVersionId: SRC_VERSION,
  educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
  sourceStructuralType: 'DOCUMENT_PART',
  sourceTerm: 'Part 2: Program Organization by Domain',
  sourceTermAr: 'القسم الثاني: تنظيم البرامج الدراسية حسب المجالات',
  sourceTermFr: 'Partie 2: Organisation des Programmes par Domaine',
  normalizedStructuralType: 'DOCUMENT_PART',
  orderInSource: 2,
  sourceLocator: DOC_PART2_LOCATOR,
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  normalizationClassification: 'LOSSLESS_NORMALIZATION',
  verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED',
  temporalApplicability: { ...INFERRED_TEMPORAL },
  reviewNotes: 'Document Part 2: Program Organization by Domain.',
});

// ── DOMAINS (3) ──────────────────────────────────────────────

for (const domain of DOMAINS) {
  const locator = domainLocator(domain.code);
  add({
    id: structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', 'ALL', 'DOMAIN', locator),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', 'ALL'),
    sourceId: SRC, sourceVersionId: SRC_VERSION,
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: 'ALL',
    sourceStructuralType: 'DOMAIN',
    sourceTerm: domain.nameFr,
    sourceTermAr: domain.nameAr,
    sourceTermFr: domain.nameFr,
    normalizedStructuralType: 'DOMAIN',
    parentElementId: structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', 'ALL', 'DOCUMENT_PART', DOC_PART2_LOCATOR),
    orderInSource: domain.order,
    sourceLocator: locator,
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    reviewNotes: `${domain.nameFr} domain within Part 2.`,
  });
}

// ── SUBJECTS × ALL PRIMARY (9) ──────────────────────────────

for (const subject of OFFICIAL_SUBJECTS) {
  const domainLocator_ = domainLocator(subject.domain);
  const domainElementId = structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', 'ALL', 'DOMAIN', domainLocator_);
  const locator: CurriculumSourceLocator = {
    precision: 'SECTION_ONLY',
    section: `${subject.nameFr} — ALL_PRIMARY`,
    heading: subject.nameAr,
  };

  add({
    id: structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', subject.code, 'SUBJECT', locator),
    scopeKey: scopeKey(SYS, STAGE, 'ALL_PRIMARY', subject.code),
    sourceId: SRC, sourceVersionId: SRC_VERSION,
    educationSystemCode: SYS, stageCode: STAGE, gradeCode: 'ALL_PRIMARY', subjectCode: subject.code,
    sourceStructuralType: 'SUBJECT',
    sourceTerm: subject.nameFr,
    sourceTermAr: subject.nameAr,
    sourceTermFr: subject.nameFr,
    normalizedStructuralType: 'SUBJECT',
    parentElementId: domainElementId,
    sourceLocator: locator,
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED',
    temporalApplicability: { ...INFERRED_TEMPORAL },
    reviewNotes: `${subject.nameFr} (${subject.nameAr}) — belongs to ${subject.domain} domain.`,
  });
}

// ── GRADE × SUBJECT SECTIONS (6 grades × 9 subjects = 54) ──

for (const gradeCode of PRIMARY_GRADE_CODES) {
  for (const subject of OFFICIAL_SUBJECTS) {
    const locator = subjectGradeLocator(subject.domain, gradeCode);
    const subjectAllId = structuralElementId(SRC, SRC_VERSION, 'ALL_PRIMARY', subject.code, 'SUBJECT', {
      precision: 'SECTION_ONLY',
      section: `${subject.nameFr} — ALL_PRIMARY`,
      heading: subject.nameAr,
    });

    add({
      id: structuralElementId(SRC, SRC_VERSION, gradeCode, subject.code, 'GRADE_SECTION', locator),
      scopeKey: scopeKey(SYS, STAGE, gradeCode, subject.code),
      sourceId: SRC, sourceVersionId: SRC_VERSION,
      educationSystemCode: SYS, stageCode: STAGE, gradeCode, subjectCode: subject.code,
      sourceStructuralType: 'GRADE_SECTION',
      sourceTerm: `${subject.nameFr} — ${gradeCode}`,
      sourceTermAr: `${subject.nameAr} — ${gradeCode}`,
      sourceTermFr: `${subject.nameFr} — ${gradeCode}`,
      normalizedStructuralType: 'GRADE_SECTION',
      parentElementId: subjectAllId,
      sourceLocator: locator,
      extractionMethod: 'DERIVED_STRUCTURAL_MAPPING',
      normalizationClassification: 'DERIVED',
      verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED',
      temporalApplicability: { ...INFERRED_TEMPORAL },
      claimRecordId: [
        SRC, 'SUBJECT_APPLICABILITY', gradeCode, subject.code,
        stableLocatorKey(gradeLocator(gradeCode)), SRC_VERSION,
      ].join('::'),
      reviewNotes: `${subject.nameFr} at ${gradeCode}: grade-specific section within ${subject.domain} domain.`,
    });
  }
}

export const STRUCTURAL_ELEMENTS: readonly CurriculumStructuralElement[] = elements;

// ── COMPUTED METRICS ─────────────────────────────────────────

function countByField(
  els: readonly CurriculumStructuralElement[],
  field: keyof CurriculumStructuralElement,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const el of els) {
    const key = String(el[field]);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

export const STRUCTURAL_EXTRACTION_METRICS: StructuralExtractionMetrics = (() => {
  const byGrade = countByField(elements, 'gradeCode');
  const bySubject = countByField(elements, 'subjectCode');
  const byType = countByField(elements, 'sourceStructuralType');
  const byMethod = countByField(elements, 'extractionMethod');
  const byNorm = countByField(elements, 'normalizationClassification');
  const byVerif = countByField(elements, 'verificationState');
  const byContent = countByField(elements, 'contentStatus');

  const unknownLocators = elements.filter(
    (el) => el.sourceLocator.precision === 'UNKNOWN',
  ).length;
  const exactPages = elements.filter(
    (el) => el.sourceLocator.precision === 'EXACT_PAGE',
  ).length;
  const sections = elements.filter(
    (el) => el.sourceLocator.precision === 'SECTION_ONLY',
  ).length;
  const reviewRequired = elements.filter(
    (el) => el.verificationState === 'REVIEW_REQUIRED',
  ).length;

  return {
    totalStructuralElements: elements.length,
    byGrade,
    bySubject,
    byStructuralType: byType,
    byExtractionMethod: byMethod,
    byNormalizationClassification: byNorm,
    byVerificationState: byVerif,
    byContentStatus: byContent,
    reviewRequiredCount: reviewRequired,
    unknownLocatorCount: unknownLocators,
    exactPageLocatorCount: exactPages,
    sectionLocatorCount: sections,
    denominatorKnownCount: 0,
    denominatorUnknownCount: PRIMARY_GRADE_CODES.length * OFFICIAL_SUBJECTS.length,
  };
})();

// ── GRADE EXTRACTION ENTRIES ─────────────────────────────────

export const GRADE_EXTRACTION_ENTRIES: readonly GradeExtractionEntry[] =
  PRIMARY_GRADE_CODES.map((gradeCode) => {
    const gradeEls = elements.filter((el) => el.gradeCode === gradeCode);
    const subjectsInGrade = new Set(
      gradeEls
        .filter((el) => el.sourceStructuralType === 'GRADE_SECTION')
        .map((el) => el.subjectCode),
    );
    return {
      gradeCode,
      status: 'STRUCTURE_EXTRACTED' as const,
      subjectsExtracted: subjectsInGrade.size,
      totalSubjectsExpected: OFFICIAL_SUBJECTS.length,
      structuralElementCount: gradeEls.length,
      verifiedClaimCount: gradeEls.filter((el) => el.verificationState === 'VERIFIED').length,
      reviewRequiredCount: gradeEls.filter((el) => el.verificationState === 'REVIEW_REQUIRED').length,
      notes: `Grade ${gradeCode}: ${subjectsInGrade.size}/${OFFICIAL_SUBJECTS.length} subjects, ${gradeEls.length} structural elements.`,
    };
  });

// ── SUBJECT EXTRACTION ENTRIES ───────────────────────────────

export const SUBJECT_EXTRACTION_ENTRIES: readonly SubjectExtractionEntry[] = (() => {
  const entries: SubjectExtractionEntry[] = [];
  for (const gradeCode of PRIMARY_GRADE_CODES) {
    for (const subject of OFFICIAL_SUBJECTS) {
      const gradeSectionEl = elements.find(
        (el) =>
          el.gradeCode === gradeCode &&
          el.subjectCode === subject.code &&
          el.sourceStructuralType === 'GRADE_SECTION',
      );
      entries.push({
        gradeCode,
        subjectCode: subject.code,
        sourcePresence: 'PRESENT',
        structureDiscovered: true,
        structureExtracted: true,
        claimCount: 1,
        verifiedClaimCount: 0,
        reviewRequiredClaimCount: 0,
        denominatorKnown: false,
        extractedStructuralElementCount: gradeSectionEl ? 1 : 0,
        completenessRatio: undefined,
        completenessConfidence: 'UNKNOWN',
        notes: `${subject.nameFr} at ${gradeCode}: grade section structure extracted. Denominator unknown (units/lessons not yet extracted).`,
      });
    }
  }
  return entries;
})();

// ── EXTRACTION GAPS ──────────────────────────────────────────

export const EXTRACTION_GAPS: readonly ExtractionGap[] = [
  {
    gapId: 'GAP-001',
    scope: `${SYS}|${STAGE}|ALL|DENOMINATOR`,
    sourceId: SRC,
    severity: 'HIGH',
    reason: 'Denominator for structural completeness is unknown. The 556-page document structure has not been fully mapped.',
    requiredAction: 'Map complete document structure to establish expected structural element counts per grade/subject.',
    status: 'OPEN',
    notes: 'Current extraction covers document parts, domains, subjects, and grade sections. Detailed units/lessons/competencies require future gate.',
  },
  {
    gapId: 'GAP-002',
    scope: `${SYS}|${STAGE}|ALL|UNITS`,
    sourceId: SRC,
    severity: 'MEDIUM',
    reason: 'Unit/topic organization within each grade×subject has not been extracted.',
    requiredAction: 'Extract unit/topic structure from Part 2 grade-level sections in future gate.',
    status: 'OPEN',
  },
  {
    gapId: 'GAP-003',
    scope: `${SYS}|${STAGE}|ALL|COMPETENCIES`,
    sourceId: SRC,
    severity: 'MEDIUM',
    reason: 'Competency framework referenced in document not yet extracted.',
    requiredAction: 'Extract competency structure from Part 1 and grade-level sections in future gate.',
    status: 'OPEN',
  },
  {
    gapId: 'GAP-004',
    scope: `${SYS}|${STAGE}|ALL|LESSONS`,
    sourceId: SRC,
    severity: 'LOW',
    reason: 'Lesson-level structure not applicable at this extraction stage.',
    requiredAction: 'Defer to content ingestion gate.',
    status: 'DEFERRED',
  },
];

// ── EXTRACTION NOTES ─────────────────────────────────────────

export const STRUCTURAL_EXTRACTION_NOTES = {
  summary: `68 structural elements: 2 document parts + 3 domains + 9 subjects (ALL_PRIMARY) + 54 grade×subject sections (6 grades × 9 subjects). Source-defined structure only.`,
  antiFabrication: 'No units, lessons, KOs, competencies, exercises, coefficients, or content invented. Every element has sourceId, sourceLocator, extractionMethod, and verificationState.',
  sourceCurrentness: 'NO_NEWER_VERIFIED_SOURCE_FOUND. July 2021 Version Finale remains primary source. 2022-2026 roadmap is pedagogical methodology, not curriculum replacement.',
  hierarchy: 'Document → Part → Domain → Subject → Grade Section. Only explicitly supported by artifact structure.',
  denominator: 'Denominator unknown for all grade×subject cells. CompletenessRatio = undefined. No fabricated expected counts.',
  versionSafety: `All IDs follow: sourceId::sourceVersionId::gradeCode::subjectCode::sourceStructuralType::locatorKey. Normalized value excluded from identity.`,
  allScopeSafety: 'ALL_PRIMARY and ALL are aggregate source-scope values, not learner GradeCode/SubjectCode.',
  temporalSafety: 'publicationDate = VERIFIED. effectiveFrom = UNKNOWN. academicYearFrom = INFERRED.',
} as const;
