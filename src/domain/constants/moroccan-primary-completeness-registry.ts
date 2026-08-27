/**
 * Qarayti.ai - Gate 07C.5/07C.6: Moroccan Primary Curriculum Completeness Registry
 *
 * SOURCE-DERIVED DENOMINATORS + GAP RESOLUTION + DEEP EXTRACTION UPDATE
 *
 * GATE 07C.6 UPDATE:
 *   Deep extraction from public sources confirmed subject components for:
 *     ARABIC: 3 components (listening/speaking, reading, writing)
 *     FRENCH: 2 components (reading, written production)
 *     MATH: 3 components (numbers/arithmetic, geometry/measurement, data)
 *     SCIENCE: 4 components (life/earth, physical, space, technology)
 *     CIVIC_EDUCATION: 3 components (history, geography, citizenship) — P4-P6 only
 *   Islamic Education, Sport, Art, Music: no components confirmed by public sources.
 *
 * RULES:
 *   - Denominator comes from evidence, never invented
 *   - Unknown denominator → ratio = undefined (never 0%)
 *   - 100% requires VERIFIED denominator + exact match + no blocking gaps
 *   - Different subjects may use different denominator types
 *   - Every denominator has source provenance and confidence level
 *   - PUBLISHED remains 0
 *   - No curriculum volume added
 */

import type {
  CurriculumExtractionDenominator,
  GradeSubjectCompletenessCell,
  DenominatorConfidence,
  DenominatorType,
  CompletenessStatus,
  CellScanStatus,
  CurriculumSourceLocator,
  EvidenceClass,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';
import { STRUCTURAL_ELEMENTS } from './moroccan-primary-structural-extraction';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';
const SYS = 'MOROCCO';
const STAGE = 'PRIMARY';

// ── OFFICIAL SUBJECTS ────────────────────────────────────────

const OFFICIAL_SUBJECTS = [
  { code: 'ARABIC',           nameAr: 'اللغة العربية',             nameFr: 'Arabe',              domain: 'LANGUAGES' },
  { code: 'FRENCH',           nameAr: 'اللغة الفرنسية',            nameFr: 'Français',           domain: 'LANGUAGES' },
  { code: 'MATH',             nameAr: 'الرياضيات',                 nameFr: 'Mathématiques',      domain: 'MATH_SCIENCE_TECH' },
  { code: 'SCIENCE',          nameAr: 'النشاط العلمي',             nameFr: 'Activité Scientifique', domain: 'MATH_SCIENCE_TECH' },
  { code: 'ISLAMIC_EDUCATION', nameAr: 'التربية الإسلامية',        nameFr: 'Enseignement Islamique', domain: 'SOCIALIZATION' },
  { code: 'CIVIC_EDUCATION',  nameAr: 'التربية المدنية',           nameFr: 'Éducation Civique',  domain: 'SOCIALIZATION' },
  { code: 'SPORT',            nameAr: 'التربية البدنية',           nameFr: 'Éducation Physique', domain: 'SOCIALIZATION' },
  { code: 'ART',              nameAr: 'التربية التشكيلية',          nameFr: 'Arts Plastiques',    domain: 'SOCIALIZATION' },
  { code: 'MUSIC',            nameAr: 'التربية الموسيقية',          nameFr: 'Musique',            domain: 'SOCIALIZATION' },
] as const;

// ── DENOMINATOR ID ───────────────────────────────────────────

function denominatorId(
  sourceId: string,
  sourceVersionId: string,
  gradeCode: string,
  subjectCode: string,
  denominatorType: DenominatorType,
): string {
  return [sourceId, sourceVersionId, gradeCode, subjectCode, denominatorType].join('::');
}

// ── SUBJECT DENOMINATOR CONFIG ───────────────────────────────
// What denominator each subject uses based on Gate 07C.6 deep extraction.

interface SubjectDenominatorConfig {
  readonly subjectCode: string;
  readonly denominatorType: DenominatorType;
  readonly componentCount: number | undefined;
  readonly confidence: DenominatorConfidence;
  readonly evidenceMethod: string;
  readonly evidenceClass: EvidenceClass;
  readonly primaryArtifactConfirmation: 'NOT_VERIFIED' | 'VERIFIED';
  readonly notes: string;
  readonly civicGradesOnly?: boolean;
}

const SUBJECT_DENOMINATOR_CONFIGS: readonly SubjectDenominatorConfig[] = [
  {
    subjectCode: 'ARABIC',
    denominatorType: 'COMPONENT',
    componentCount: 3,
    confidence: 'PARTIAL',
    evidenceMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: '3 component candidate count from public cross-reference (Hespress, Cariatmaaref, teacher guides). PARTIAL — NOT a verified official denominator. Primary artifact NOT inspected.',
  },
  {
    subjectCode: 'FRENCH',
    denominatorType: 'COMPONENT',
    componentCount: 2,
    confidence: 'PARTIAL',
    evidenceMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
    evidenceClass: 'SECONDARY_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: '2 component candidate count from public cross-reference (Cariatmaaref, Modarissi). PARTIAL — NOT a verified official denominator. French section p216-p271 from external file title, not direct access.',
  },
  {
    subjectCode: 'MATH',
    denominatorType: 'COMPONENT',
    componentCount: 3,
    confidence: 'PARTIAL',
    evidenceMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: '3 component candidate count. Kech24 reports a ministry announcement (official cross-reference); Scribd/Moualimi (secondary). PARTIAL — NOT a verified official denominator.',
  },
  {
    subjectCode: 'SCIENCE',
    denominatorType: 'COMPONENT',
    componentCount: 4,
    confidence: 'PARTIAL',
    evidenceMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: '4 component candidate count. Kech24 ministry announcement (official cross-reference); Scribd, LeadingEducation (secondary). Space/Technology are STRONGLY_SUPPORTED only. PARTIAL — NOT a verified official denominator.',
  },
  {
    subjectCode: 'CIVIC_EDUCATION',
    denominatorType: 'COMPONENT',
    componentCount: 3,
    confidence: 'PARTIAL',
    evidenceMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
    evidenceClass: 'OFFICIAL_CROSS_REFERENCE',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: '3 component candidate count (history, geography, citizenship). ONLY for P4-P6 (social studies begins at Grade 4). Kech24, Atarbawi, Moualimi. PARTIAL — NOT a verified official denominator.',
    civicGradesOnly: true,
  },
  {
    subjectCode: 'ISLAMIC_EDUCATION',
    denominatorType: 'NONE_IDENTIFIED',
    componentCount: undefined,
    confidence: 'UNKNOWN',
    evidenceMethod: 'ARTIFACT_SECTION_INSPECTION',
    evidenceClass: 'PRIMARY_ARTIFACT',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: 'No internal components confirmed by public sources. Structure remains UNKNOWN.',
  },
  {
    subjectCode: 'SPORT',
    denominatorType: 'NONE_IDENTIFIED',
    componentCount: undefined,
    confidence: 'UNKNOWN',
    evidenceMethod: 'ARTIFACT_SECTION_INSPECTION',
    evidenceClass: 'PRIMARY_ARTIFACT',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: 'No internal components confirmed by public sources.',
  },
  {
    subjectCode: 'ART',
    denominatorType: 'NONE_IDENTIFIED',
    componentCount: undefined,
    confidence: 'UNKNOWN',
    evidenceMethod: 'ARTIFACT_SECTION_INSPECTION',
    evidenceClass: 'PRIMARY_ARTIFACT',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: 'No internal components confirmed by public sources.',
  },
  {
    subjectCode: 'MUSIC',
    denominatorType: 'NONE_IDENTIFIED',
    componentCount: undefined,
    confidence: 'UNKNOWN',
    evidenceMethod: 'ARTIFACT_SECTION_INSPECTION',
    evidenceClass: 'PRIMARY_ARTIFACT',
    primaryArtifactConfirmation: 'NOT_VERIFIED',
    notes: 'No internal components confirmed by public sources.',
  },
];

// ── LOCATOR FACTORY ──────────────────────────────────────────

function subjectGradeLocator(domainCode: string, gradeCode: string): CurriculumSourceLocator {
  const domainNames: Record<string, { ar: string; fr: string }> = {
    LANGUAGES:            { ar: 'مجال اللغات',                          fr: 'Domaine des Langues' },
    MATH_SCIENCE_TECH:    { ar: 'مجال الرياضيات والعلوم والتكنولوجيا',   fr: 'Domaine Mathématiques, Sciences et Technologie' },
    SOCIALIZATION:        { ar: 'مجال التنشئة الاجتماعية',                fr: 'Domaine de la Socialisation' },
  };
  const d = domainNames[domainCode] ?? { ar: domainCode, fr: domainCode };
  return {
    precision: 'SECTION_ONLY',
    section: `${d.fr} — ${gradeCode}`,
    heading: `${d.ar} — ${gradeCode}`,
  };
}

// ── DENOMINATOR REGISTRY ─────────────────────────────────────
// One denominator record per grade×subject cell.

const denominatorRegistry: CurriculumExtractionDenominator[] = [];

for (const gradeCode of PRIMARY_GRADE_CODES) {
  for (const subject of OFFICIAL_SUBJECTS) {
    const config = SUBJECT_DENOMINATOR_CONFIGS.find((c) => c.subjectCode === subject.code)!;
    const locator = subjectGradeLocator(subject.domain, gradeCode);

    // CIVIC_EDUCATION only has components from P4-P6
    const isCivicP1P3 = config.civicGradesOnly && ['P1', 'P2', 'P3'].includes(gradeCode);

    denominatorRegistry.push({
      id: denominatorId(
        SRC,
        SRC_VERSION,
        gradeCode,
        subject.code,
        isCivicP1P3 ? 'NONE_IDENTIFIED' : config.denominatorType,
      ),
      educationSystemCode: SYS,
      stageCode: STAGE,
      gradeCode,
      subjectCode: subject.code,
      denominatorType: isCivicP1P3 ? 'NONE_IDENTIFIED' : config.denominatorType,
      expectedCount: isCivicP1P3 ? undefined : config.componentCount,
      sourceId: SRC,
      sourceVersionId: SRC_VERSION,
      sourceLocator: locator,
      evidenceMethod: config.evidenceMethod,
      evidenceClass: isCivicP1P3 ? 'PRIMARY_ARTIFACT' : config.evidenceClass,
      primaryArtifactConfirmation: config.primaryArtifactConfirmation,
      confidence: isCivicP1P3 ? 'UNKNOWN' : config.confidence,
      completenessLevel: isCivicP1P3 ? 'DENOMINATOR_UNKNOWN' : 'DENOMINATOR_PARTIAL',
      verificationState: 'UNVERIFIED',
      notes: isCivicP1P3
        ? 'Civic Education / Social Studies begins at Grade 4. P1-P3: no social studies components. Denominator unknown.'
        : config.notes,
    });
  }
}

export const DENOMINATOR_REGISTRY: readonly CurriculumExtractionDenominator[] = denominatorRegistry;

// ── COMPLETENESS CELLS ───────────────────────────────────────

function completenessStatus(confidence: DenominatorConfidence, expected: number | undefined, extracted: number, blockingGaps: number, reviewRequired: number): CompletenessStatus {
  if (confidence === 'UNKNOWN') return 'DENOMINATOR_UNKNOWN';
  if (confidence === 'PARTIAL') return 'DENOMINATOR_PARTIAL';
  if (expected === undefined) return 'DENOMINATOR_UNKNOWN';
  if (extracted === 0) return 'EXTRACTION_NOT_STARTED';
  if (extracted < expected) return 'EXTRACTION_PARTIAL';
  if (blockingGaps > 0 || reviewRequired > 0) return 'REVIEW_REQUIRED';
  if (confidence === 'VERIFIED') return 'STRUCTURE_COMPLETE_VERIFIED';
  return 'EXTRACTION_MATCHES_DENOMINATOR';
}

function scanStatusForGradeSubject(gradeCode: string, subjectCode: string): CellScanStatus {
  const found = STRUCTURAL_ELEMENTS.find(
    (el) => el.gradeCode === gradeCode && el.subjectCode === subjectCode && el.sourceStructuralType === 'GRADE_SECTION',
  );
  if (!found) return 'NOT_SCANNED';
  return 'STRUCTURE_EXTRACTED';
}

const completenessCells: GradeSubjectCompletenessCell[] = [];

for (const gradeCode of PRIMARY_GRADE_CODES) {
  for (const subject of OFFICIAL_SUBJECTS) {
    const denom = denominatorRegistry.find(
      (d) => d.gradeCode === gradeCode && d.subjectCode === subject.code,
    );

    const scanStatus = scanStatusForGradeSubject(gradeCode, subject.code);
    const extractedCount = scanStatus === 'STRUCTURE_EXTRACTED' ? 1 : 0;

    completenessCells.push({
      gradeCode,
      subjectCode: subject.code,
      sourcePresence: 'PRESENT',
      sourceSectionLocated: true,
      sourceSectionScanned: scanStatus,
      denominatorType: denom?.denominatorType ?? 'NONE_IDENTIFIED',
      denominatorConfidence: denom?.confidence ?? 'UNKNOWN',
      expectedCount: denom?.expectedCount,
      extractedCount,
      reviewRequiredCount: 0,
      knownGapCount: denom?.confidence === 'UNKNOWN' ? 1 : 0,
      completenessRatio: undefined,
      completenessStatus: completenessStatus(
        denom?.confidence ?? 'UNKNOWN',
        denom?.expectedCount,
        extractedCount,
        denom?.confidence === 'UNKNOWN' ? 1 : 0,
        0,
      ),
      denominatorId: denom?.id,
      notes: denom?.confidence === 'PARTIAL'
        ? `Component denominator established from public sources (${denom.expectedCount} components). Ratio undefined — deep extraction not yet performed.`
        : `Grade section extracted. Internal structure unknown. Denominator not established.`,
    });
  }
}

export const COMPLETENESS_CELLS: readonly GradeSubjectCompletenessCell[] = completenessCells;

// ── COMPLETENESS METRICS (computed) ──────────────────────────

function countByStatus(cells: readonly GradeSubjectCompletenessCell[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const cell of cells) {
    result[cell.completenessStatus] = (result[cell.completenessStatus] ?? 0) + 1;
  }
  return result;
}

function countByConfidence(cells: readonly GradeSubjectCompletenessCell[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const cell of cells) {
    result[cell.denominatorConfidence] = (result[cell.denominatorConfidence] ?? 0) + 1;
  }
  return result;
}

export const COMPLETENESS_METRICS = {
  totalCells: completenessCells.length,
  byStatus: countByStatus(completenessCells),
  byConfidence: countByConfidence(completenessCells),
  measurableCells: completenessCells.filter((c) => c.completenessRatio !== undefined).length,
  unmeasurableCells: completenessCells.filter((c) => c.completenessRatio === undefined).length,
  hundredPercentCells: completenessCells.filter((c) => c.completenessRatio === 1.0).length,
  denominatorKnownCount: completenessCells.filter((c) => c.denominatorConfidence !== 'UNKNOWN').length,
  denominatorUnknownCount: completenessCells.filter((c) => c.denominatorConfidence === 'UNKNOWN').length,
} as const;

// ── GAP REGISTRY ─────────────────────────────────────────────

export interface ResolvedGap {
  readonly gapId: string;
  readonly beforeStatus: string;
  readonly evidenceInvestigated: string;
  readonly afterStatus: string;
  readonly resolutionReason: string;
  readonly remainingBlocker: string | undefined;
}

export const RESOLVED_GAPS: readonly ResolvedGap[] = [
  {
    gapId: 'GAP-001',
    beforeStatus: 'OPEN / BLOCKING / 54 UNKNOWN denominators',
    evidenceInvestigated: 'Gate 07C.6 public cross-reference produced candidate component evidence: ARABIC (3), FRENCH (2), MATH (3), SCIENCE (4), CIVIC_EDUCATION (3 from P4). 27 cells transitioned from UNKNOWN to PARTIAL. 27 cells remain UNKNOWN (CIVIC P1-P3 = 3, ISLAMIC_EDUCATION = 6, SPORT = 6, ART = 6, MUSIC = 6).',
    afterStatus: 'PARTIALLY_RESOLVED at most — 27 cells have cross-reference-supported PARTIAL denominator evidence, 27 remain UNKNOWN',
    resolutionReason: 'Cross-reference-supported PARTIAL denominator evidence established for 5 subjects. Primary artifact confirmation for all component counts = NOT_VERIFIED. Primary artifact confirmation of denominators remains OPEN.',
    remainingBlocker: 'PDF access required for: (1) verification of component counts against primary artifact, (2) exact page locators, (3) component structure for Islamic Education, Sport, Art, Music, (4) competency enumeration per grade. Primary artifact confirmation still open.',
  },
  {
    gapId: 'GAP-002',
    beforeStatus: 'OPEN / units organization unresolved',
    evidenceInvestigated: 'Gate 07C.6: public sources suggest source uses COMPONENTS (مكونات) rather than UNITS. Arabic: listening/speaking, reading, writing. French: reading, written production. Math: numbers/arithmetic, geometry/measurement, data. Science: life/earth, physical, space, technology. This is CROSS-REFERENCE_SUPPORTED, not direct-artifact verified.',
    afterStatus: 'CLARIFIED_BY_CROSS_REFERENCE — source likely uses COMPONENTS not UNITS; NOT fully artifact-resolved',
    resolutionReason: 'Subject-specific public evidence suggests source uses COMPONENTS (not UNITS). However, primary artifact was NOT inspected. Do NOT mark fully artifact-resolved.',
    remainingBlocker: 'Primary artifact inspection required to confirm COMPONENTS terminology and structure.',
  },
  {
    gapId: 'GAP-003',
    beforeStatus: 'OPEN / competencies unresolved',
    evidenceInvestigated: 'Gate 07C.6: CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE. Per-grade model: annual competency (الكفاية السنوية), entry profile, exit profile, sub-competencies. Supported by Scribd snippets, PIRLS 2021, academic papers — NOT direct-artifact verified.',
    afterStatus: 'PARTIALLY_RESOLVED — competency structure CROSS_REFERENCE_SUPPORTED, not direct-artifact verified',
    resolutionReason: 'Competency organizational model is CROSS_REFERENCE_SUPPORTED (annual competency + sub-competencies per grade), NOT direct-artifact verified. Specific competency text not created. Enumeration is future gate work.',
    remainingBlocker: 'Primary artifact parsing required for direct competency structure verification. Competency enumeration per grade×subject not yet performed.',
  },
  {
    gapId: 'GAP-004',
    beforeStatus: 'DEFERRED / lessons not applicable',
    evidenceInvestigated: 'Lesson denominator NOT_APPLICABLE — established in Gate 07C.5 independently of this gate: curriculum is competency-based, not lesson-based.',
    afterStatus: 'RESOLVED — lesson denominator NOT_APPLICABLE (from prior Gate 07C.5 evidence)',
    resolutionReason: 'Lesson denominator NOT_APPLICABLE established independently by Gate 07C.5. Not dependent on Gate 07C.6 evidence.',
    remainingBlocker: undefined,
  },
];

// ── COMPLETENESS NOTES ───────────────────────────────────────

export const COMPLETENESS_NOTES = {
  summary: 'Gate 07C.6: 27 cells now have PARTIAL cross-reference-supported denominator candidates. 27 cells remain UNKNOWN. ARABIC(3), FRENCH(2), MATH(3), SCIENCE(4) candidate counts for 6 grades = 24 cells. CIVIC_EDUCATION(3) candidate count for P4-P6 = 3 cells. Total 27 PARTIAL (cross-reference candidates, NOT verified official denominators). Islamic Education, Sport, Art, Music (27 cells): no components confirmed. All ratios remain undefined. All primary-artifact deep extraction BLOCKED_BY_ARTIFACT_ACCESS.',
  antiFabrication: 'No denominators invented. Component counts are public cross-reference candidates (Hespress, Kech24, Cariatmaaref, Scribd, teacher guides) — NOT verified official denominators. No PDF content was directly extracted. Component counts may be incomplete — public sources may not list all components.',
  denominatorRule: 'A percentage requires a denominator. CROSS-REFERENCE PARTIAL denominator → ratio still undefined (not VERIFIED). Only VERIFIED denominator permits 100%.',
  hundredPercentRule: '100% requires: VERIFIED denominator + expectedCount > 0 + extractedCount == expectedCount + no blocking gaps + no review-required items.',
  gapResolution: 'GAP-001: PARTIALLY_RESOLVED at most (27/54 cross-reference PARTIAL, primary artifact confirmation open). GAP-002: CLARIFIED_BY_CROSS_REFERENCE (not artifact-resolved). GAP-003: PARTIALLY_RESOLVED (competency CROSS_REFERENCE_SUPPORTED, not artifact-verified). GAP-004: RESOLVED (from prior Gate 07C.5 evidence, NOT_APPLICABLE).',
  authoritySeparation: 'ORIGINAL CURRICULUM ARTIFACT != PUBLIC CROSS-REFERENCE != RETRIEVAL HOST. Cross-reference evidence does NOT inherit OFFICIAL_CURRICULUM_DOCUMENT authority. Retrieval host cannot grant artifact authority.',
  sourceCurrentness: 'NO_NEWER_VERIFIED_SOURCE_FOUND. July 2021 Version Finale remains primary source.',
  versionSafety: 'All denominator IDs include sourceId and sourceVersionId. Historical denominators coexist.',
  allScopeSafety: 'ALL_PRIMARY and ALL are aggregate source-scope values, not learner GradeCode/SubjectCode.',
  published: 'PUBLISHED = 0. No curriculum content published.',
  locatorQuality: 'SECTION_ONLY = 54 (grade×subject cells), DOCUMENT_LEVEL = 3., EXACT_PAGE = 1 (French p216-p271, from external/cross-reference, NOT primary-artifact-verified), UNKNOWN = 0.',
  deepExtraction: 'Gate 07C.6 performed PUBLIC_SOURCE_CROSS_REFERENCE extraction (CROSS_REFERENCE_SUPPORTED). 15 subject component candidates across 5 subjects. Competency structure CROSS_REFERENCE_SUPPORTED. PRIMARY_ARTIFACT_DEEP_EXTRACTION = BLOCKED_BY_ARTIFACT_ACCESS. No direct PDF extraction performed.',
} as const;
