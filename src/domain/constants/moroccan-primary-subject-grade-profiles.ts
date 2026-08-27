/**
 * Qarayti.ai - Gate 07C.5/07C.6: Moroccan Primary Curriculum Subject & Grade Profiles
 *
 * Subject structural profiles (9 subjects) and grade completeness profiles (P1-P6).
 *
 * GATE 07C.6 UPDATE:
 *   Deep extraction from public sources confirmed internal structure for 5 subjects:
 *     ARABIC: 3 components (listening/speaking, reading, writing)
 *     FRENCH: 2 components (reading, written production)
 *     MATH: 3 components (numbers/arithmetic, geometry/measurement, data)
 *     SCIENCE: 4 components (life/earth, physical, space, technology)
 *     CIVIC_EDUCATION: 3 components (history, geography, citizenship) — P4-P6
 *   Competency model confirmed: annual competency + entry/exit profiles + sub-competencies.
 *
 * RULES:
 *   - Profiles describe source-derived structure only
 *   - No fabrication of internal organization
 *   - Unknown remains unknown
 *   - Different subjects may have different structural depth
 *   - All profiles trace to src-primary-curriculum-2021
 */

import type {
  SubjectStructuralProfile,
  GradeCompletenessProfile,
  CellCompletenessCategory,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';
import { COMPLETENESS_CELLS } from './moroccan-primary-completeness-registry';
import {
  getSubjectComponents,
  COMPONENT_COUNTS,
  COMPETENCY_MODEL_ENTRIES,
  COMPETENCY_SUB_ELEMENTS,
  type DeepCurriculumElement,
} from './moroccan-primary-deep-structure';

// ── SOURCE CONSTANTS ─────────────────────────────────────────

const SRC = 'src-primary-curriculum-2021';
const SRC_VERSION = 'v1.0.0';

// ── OFFICIAL SUBJECTS ────────────────────────────────────────

const OFFICIAL_SUBJECTS = [
  { code: 'ARABIC',            nameAr: 'اللغة العربية',              nameFr: 'Arabe',                domain: 'LANGUAGES' },
  { code: 'FRENCH',            nameAr: 'اللغة الفرنسية',             nameFr: 'Français',             domain: 'LANGUAGES' },
  { code: 'MATH',              nameAr: 'الرياضيات',                  nameFr: 'Mathématiques',        domain: 'MATH_SCIENCE_TECH' },
  { code: 'SCIENCE',           nameAr: 'النشاط العلمي',              nameFr: 'Activité Scientifique', domain: 'MATH_SCIENCE_TECH' },
  { code: 'ISLAMIC_EDUCATION', nameAr: 'التربية الإسلامية',         nameFr: 'Enseignement Islamique', domain: 'SOCIALIZATION' },
  { code: 'CIVIC_EDUCATION',   nameAr: 'التربية المدنية',            nameFr: 'Éducation Civique',    domain: 'SOCIALIZATION' },
  { code: 'SPORT',             nameAr: 'التربية البدنية',            nameFr: 'Éducation Physique',   domain: 'SOCIALIZATION' },
  { code: 'ART',               nameAr: 'التربية التشكيلية',           nameFr: 'Arts Plastiques',      domain: 'SOCIALIZATION' },
  { code: 'MUSIC',             nameAr: 'التربية الموسيقية',           nameFr: 'Musique',              domain: 'SOCIALIZATION' },
] as const;

// ============================================================
// SUBJECT STRUCTURAL PROFILES (Gate 07C.5 §20-26)
// Updated in Gate 07C.6 with deep extraction findings
// ============================================================

function componentsForSubject(subjectCode: string): readonly DeepCurriculumElement[] {
  const comps = getSubjectComponents(subjectCode);
  const result: DeepCurriculumElement[] = [];
  for (const comp of comps) {
    for (const gradeCode of comp.confirmedGrades) {
      result.push({
        id: `${SRC}::${SRC_VERSION}::${gradeCode}::${subjectCode}::COMPONENT::${comp.componentCode}`,
        sourceId: SRC,
        sourceVersionId: SRC_VERSION,
        educationSystemCode: 'MOROCCO',
        stageCode: 'PRIMARY',
        gradeCode,
        subjectCode,
        sourceStructuralType: 'COMPONENT',
        sourceTerm: comp.nameFr,
        sourceTermAr: comp.nameAr,
        sourceTermFr: comp.nameFr,
        sourceLocator: { precision: 'SECTION_ONLY', section: `${comp.nameFr} — ${gradeCode}`, heading: comp.nameAr },
        extractionMethod: 'PUBLIC_SOURCE_CROSS_REFERENCE',
        normalizationClassification: 'DERIVED',
        evidenceClass: comp.evidenceClass,
        verificationState: 'UNVERIFIED',
        contentStatus: 'EXTRACTED_UNVERIFIED',
        primaryArtifactConfirmation: comp.primaryArtifactConfirmation,
        denominatorMembership: comp.componentCode,
        evidenceLevel: comp.evidenceLevel,
        evidenceSources: comp.evidenceSources,
        publisherOrIssuer: comp.publisherOrIssuer,
        retrievalHost: comp.retrievalHost,
      });
    }
  }
  return result;
}

function buildSubjectProfile(subjectCode: string, nameAr: string, nameFr: string, domainCode: string): SubjectStructuralProfile {
  const comps = getSubjectComponents(subjectCode);
  const compCount = COMPONENT_COUNTS[subjectCode] ?? 0;
  const gradeScope = compCount > 0 ? comps[0]?.confirmedGrades : [];

  const hasComponents = compCount > 0;
  const sourceOrg = hasComponents
    ? `${compCount} cross-reference-supported component candidates: ${comps.map((c) => c.nameFr).join(', ')}. Present in grades ${gradeScope?.join(', ')}. Supported by public cross-reference (NOT PDF extraction, NOT primary-artifact verified).`
    : 'Grade sections within domain. Internal structure not confirmed by public sources. Component-level extraction pending.';

  const terminology = hasComponents
    ? `Component candidates (مكونات) from cross-reference: ${comps.map((c) => `${c.nameFr} (${c.nameAr})`).join('; ')}. Competency model: CROSS_REFERENCE_SUPPORTED (annual competency + sub-competencies per grade), NOT primary-artifact verified.`
    : 'Internal organization unknown. No component structure confirmed by available public sources.';

  const reviewStatus = hasComponents
    ? `COMPONENT denominator PARTIAL (cross-reference candidate). Primary artifact deep extraction BLOCKED_BY_ARTIFACT_ACCESS. Direct PDF verification required for: (1) exact page locators, (2) verification of component counts, (3) competency enumeration.`
    : 'Denominator unknown. Internal structure requires extraction. Competency-based organization expected but not confirmed.';

  const depth = hasComponents ? 'PARTIAL' : 'SURFACE';

  return {
    subjectCode,
    subjectNameAr: nameAr,
    subjectNameFr: nameFr,
    domainCode,
    sourceOrganization: sourceOrg,
    sourceStructuralTerminology: terminology,
    gradeDifferentiation: hasComponents
      ? `Present in all 6 grades (P1-P6). Component candidates supported for grades: ${gradeScope?.join(', ')}.`
      : 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: hasComponents ? 'COMPONENT' : 'NONE_IDENTIFIED',
    locatorRange: `Domaine ${domainCode} — P1 through P6`,
    hierarchyDepth: depth,
    reviewStatus,
  };
}

export const SUBJECT_STRUCTURAL_PROFILES: readonly SubjectStructuralProfile[] = OFFICIAL_SUBJECTS.map((s) =>
  buildSubjectProfile(s.code, s.nameAr, s.nameFr, s.domain),
);

// ── PROFILE LOOKUP ───────────────────────────────────────────

export function getSubjectProfile(subjectCode: string): SubjectStructuralProfile | undefined {
  return SUBJECT_STRUCTURAL_PROFILES.find((p) => p.subjectCode === subjectCode);
}

// ============================================================
// GRADE COMPLETENESS PROFILES (Gate 07C.5 §27)
// Updated in Gate 07C.6 with deep extraction cell counts
// ============================================================

function cellCategory(gradeCode: string, subjectCode: string): CellCompletenessCategory {
  const cell = COMPLETENESS_CELLS.find(
    (c) => c.gradeCode === gradeCode && c.subjectCode === subjectCode,
  );
  if (!cell) return 'UNKNOWN';
  switch (cell.denominatorConfidence) {
    case 'VERIFIED': return 'VERIFIED';
    case 'SUPPORTED': return 'SUPPORTED';
    case 'PARTIAL': return 'PARTIAL';
    case 'UNKNOWN': return 'UNKNOWN';
    default: return 'UNKNOWN';
  }
}

export const GRADE_COMPLETENESS_PROFILES: readonly GradeCompletenessProfile[] =
  PRIMARY_GRADE_CODES.map((gradeCode) => {
    const gradeCells = COMPLETENESS_CELLS.filter((c) => c.gradeCode === gradeCode);
    const subjectCodes = OFFICIAL_SUBJECTS.map((s) => s.code);

    const cellStatuses: Record<string, CellCompletenessCategory> = {};
    for (const subj of subjectCodes) {
      cellStatuses[subj] = cellCategory(gradeCode, subj);
    }

    const partialCount = gradeCells.filter((c) => c.denominatorConfidence === 'PARTIAL').length;
    const unknownCount = gradeCells.filter((c) => c.denominatorConfidence === 'UNKNOWN').length;

    return {
      gradeCode,
      subjects: subjectCodes,
      totalCells: gradeCells.length,
      denominatorReadyCells: gradeCells.filter((c) => c.denominatorConfidence !== 'UNKNOWN').length,
      partialCells: partialCount,
      blockedCells: gradeCells.filter((c) => c.knownGapCount > 0).length,
      reviewQueueCount: gradeCells.filter((c) => c.reviewRequiredCount > 0).length,
      cellStatuses,
      notes: `Grade ${gradeCode}: ${gradeCells.length} cells. ${partialCount} PARTIAL (cross-reference-supported component candidates), ${unknownCount} UNKNOWN (no public-source confirmation).`,
    };
  });

export function getGradeProfile(gradeCode: string): GradeCompletenessProfile | undefined {
  return GRADE_COMPLETENESS_PROFILES.find((p) => p.gradeCode === gradeCode);
}

// ── DEEP EXTRACTION CROSS-REFERENCES ─────────────────────────
// Useful for test assertions.

export const SUBJECT_COMPONENT_MAP: Record<string, { componentCode: string; nameAr: string; nameFr: string; grades: readonly string[] }[]> = {};
const allSubjects = ['ARABIC', 'FRENCH', 'MATH', 'SCIENCE', 'ISLAMIC_EDUCATION', 'CIVIC_EDUCATION', 'SPORT', 'ART', 'MUSIC'];
for (const subj of allSubjects) {
  const comps = getSubjectComponents(subj);
  if (comps.length > 0) {
    SUBJECT_COMPONENT_MAP[subj] = comps.map((c) => ({
      componentCode: c.componentCode,
      nameAr: c.nameAr,
      nameFr: c.nameFr,
      grades: c.confirmedGrades,
    }));
  }
}

export const COMPETENCY_MODEL_STRUCTURE = {
  modelElement: 'ANNUAL_COMPETENCY',
  subElements: COMPETENCY_SUB_ELEMENTS.map((e) => ({ code: e.code, nameFr: e.nameFr })),
  coveredGrades: PRIMARY_GRADE_CODES,
  classification: 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE',
  primaryArtifactConfirmation: 'NOT_VERIFIED',
} as const;

// ── PROFILE NOTES ────────────────────────────────────────────

export const PROFILE_NOTES = {
  subjectProfiles: '9 subject profiles. 5 have PARTIAL hierarchy depth with COMPONENT denominator candidate (cross-reference-supported, NOT primary-artifact verified). 4 remain SURFACE with NONE_IDENTIFIED denominator. All deep extraction is PUBLIC_SOURCE_CROSS_REFERENCE, NOT direct artifact extraction.',
  gradeProfiles: '6 grade profiles (P1-P6). Each has 9 cells. 27 cells PARTIAL, 27 cells UNKNOWN. No grade claims completeness.',
  antiFabrication: 'No internal organization invented. Profiles document what public sources support AND what they do not. Missing component structures for Islamic Education, Sport, Art, Music are explicitly documented as UNKNOWN.',
  sourceBacking: 'All profiles trace to src-primary-curriculum-2021 v1.0.0. Deep extraction uses PUBLIC_SOURCE_CROSS_REFERENCE, not direct PDF extraction. All primary-artifact deep extraction BLOCKED_BY_ARTIFACT_ACCESS.',
  denominatorReadiness: '27 of 54 cells have PARTIAL (cross-reference) denominator candidate. 27 cells remain UNKNOWN. No cell has VERIFIED denominator. Ratio undefined for all cells.',
  competencyModel: 'CROSS_REFERENCE_SUPPORTED_COMPETENCY_STRUCTURE — per-grade annual competency + entry/exit profiles + sub-competencies supported by Scribd snippets, PIRLS 2021, academic papers. NOT primary-artifact verified.',
  deepExtraction: `Gate 07C.6: ${COMPONENT_COUNTS.ARABIC ?? 0} Arabic component candidates, ${COMPONENT_COUNTS.FRENCH ?? 0} French, ${COMPONENT_COUNTS.MATH ?? 0} Math, ${COMPONENT_COUNTS.SCIENCE ?? 0} Science, ${COMPONENT_COUNTS.CIVIC_EDUCATION ?? 0} Civic candidates. All are cross-reference candidates, NOT verified official denominators.`,
} as const;
