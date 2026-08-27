/**
 * Qarayti.ai - Gate 07C.5: Moroccan Primary Curriculum Subject & Grade Profiles
 *
 * Subject structural profiles (9 subjects) and grade completeness profiles (P1-P6).
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
  DenominatorType,
  CellCompletenessCategory,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';
import { COMPLETENESS_CELLS } from './moroccan-primary-completeness-registry';

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
// ============================================================
// Each profile records what the artifact establishes about the
// subject's structural organization. No fabrication.

export const SUBJECT_STRUCTURAL_PROFILES: readonly SubjectStructuralProfile[] = [
  {
    subjectCode: 'ARABIC',
    subjectNameAr: 'اللغة العربية',
    subjectNameFr: 'Arabe',
    domainCode: 'LANGUAGES',
    sourceOrganization: 'Grade sections within Languages domain. Each grade has a dedicated Arabic section. Within-grade organization: not yet extracted. Expected to include reading, writing, and language components based on domain context.',
    sourceStructuralTerminology: 'اللغة العربية (Arabic Language). Internal components likely include: القراءة (Reading), الكتابة (Writing), اللغة (Language). Not confirmed by extraction.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section within Part 2.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine des Langues — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Internal structure requires extraction. Competency-based organization expected.',
  },
  {
    subjectCode: 'FRENCH',
    subjectNameAr: 'اللغة الفرنسية',
    subjectNameFr: 'Français',
    domainCode: 'LANGUAGES',
    sourceOrganization: 'Grade sections within Languages domain. French section spans pages p216-p271 covering all 6 years (six années du cycle). Within-grade organization: not yet extracted. Expected to include comprehension, expression, and language activities.',
    sourceStructuralTerminology: 'Français / Langue Française. Internal structure likely includes: compréhension, expression orale, expression écrite. Not confirmed by extraction.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Explicit scope claim: "six années du cycle" confirms full primary coverage.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine des Langues — P1 through P6 (explicit p216-p271)',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. French section has most precise locator (EXACT_PAGE p216-p271). Internal structure requires extraction.',
  },
  {
    subjectCode: 'MATH',
    subjectNameAr: 'الرياضيات',
    subjectNameFr: 'Mathématiques',
    domainCode: 'MATH_SCIENCE_TECH',
    sourceOrganization: 'Grade sections within Math/Science/Technology domain. Within-grade organization: not yet extracted. Mathematics typically organizes around domains/axes (e.g., Numbers, Geometry, Measurement) but this has not been confirmed by extraction.',
    sourceStructuralTerminology: 'Mathématiques / الرياضيات. Potential internal axes: الأعداد (Numbers), الهندسة (Geometry), القياس (Measurement). Not confirmed by extraction.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine Mathématiques, Sciences et Technologie — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Math domain may have the richest internal structure but extraction pending.',
  },
  {
    subjectCode: 'SCIENCE',
    subjectNameAr: 'النشاط العلمي',
    subjectNameFr: 'Activité Scientifique',
    domainCode: 'MATH_SCIENCE_TECH',
    sourceOrganization: 'Grade sections within Math/Science/Technology domain. Named "Scientific Activity" — activity-based pedagogy. Within-grade organization: not yet extracted. May organize around scientific activities/explorations rather than traditional topics.',
    sourceStructuralTerminology: 'Activité Scientifique / النشاط العلمي. Activity-based naming suggests internal organization around scientific activities, not traditional units. Not confirmed.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Activity-based approach may differ structurally from other subjects.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine Mathématiques, Sciences et Technologie — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Activity-based naming is a structural signal but not yet confirmed.',
  },
  {
    subjectCode: 'ISLAMIC_EDUCATION',
    subjectNameAr: 'التربية الإسلامية',
    subjectNameFr: 'Enseignement Islamique',
    domainCode: 'SOCIALIZATION',
    sourceOrganization: 'Grade sections within Socialization domain. Within-grade organization: not yet extracted. Expected to organize around Islamic education components (Quran, Hadith, Aqeedah, etc.) but not confirmed.',
    sourceStructuralTerminology: 'Enseignement Islamique / التربية الإسلامية. Potential components: القرآن الكريم, الحديث الشريف, العقيدة. Not confirmed by extraction.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine de la Socialisation — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Internal structure requires extraction.',
  },
  {
    subjectCode: 'CIVIC_EDUCATION',
    subjectNameAr: 'التربية المدنية',
    subjectNameFr: 'Éducation Civique',
    domainCode: 'SOCIALIZATION',
    sourceOrganization: 'Grade sections within Socialization domain. Within-grade organization: not yet extracted. May be among the less richly structured subjects based on typical curriculum patterns.',
    sourceStructuralTerminology: 'Éducation Civique / التربية المدنية. Internal organization unknown — may be less structured than language/math subjects.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine de la Socialisation — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Especially vulnerable to hallucination — sparse source structure.',
  },
  {
    subjectCode: 'SPORT',
    subjectNameAr: 'التربية البدنية',
    subjectNameFr: 'Éducation Physique',
    domainCode: 'SOCIALIZATION',
    sourceOrganization: 'Grade sections within Socialization domain. Within-grade organization: not yet extracted. Physical education may organize around motor skills, games, and physical activities.',
    sourceStructuralTerminology: 'Éducation Physique / التربية البدنية. Internal organization likely activity-based. Not confirmed.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine de la Socialisation — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Sparse structure — extract only what artifact supports.',
  },
  {
    subjectCode: 'ART',
    subjectNameAr: 'التربية التشكيلية',
    subjectNameFr: 'Arts Plastiques',
    domainCode: 'SOCIALIZATION',
    sourceOrganization: 'Grade sections within Socialization domain. Within-grade organization: not yet extracted. Visual arts may organize around art activities, techniques, and expression.',
    sourceStructuralTerminology: 'Arts Plastiques / التربية التشكيلية. Internal organization likely activity-based. Not confirmed.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine de la Socialisation — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Sparse structure — extract only what artifact supports.',
  },
  {
    subjectCode: 'MUSIC',
    subjectNameAr: 'التربية الموسيقية',
    subjectNameFr: 'Musique',
    domainCode: 'SOCIALIZATION',
    sourceOrganization: 'Grade sections within Socialization domain. Within-grade organization: not yet extracted. Music education may organize around musical activities, listening, and expression.',
    sourceStructuralTerminology: 'Musique / التربية الموسيقية. Internal organization likely activity-based. Not confirmed.',
    gradeDifferentiation: 'Present in all 6 grades (P1-P6). Each grade has a separate section.',
    denominatorCandidateType: 'NONE_IDENTIFIED',
    locatorRange: 'Domaine de la Socialisation — P1 through P6',
    hierarchyDepth: 'SURFACE',
    reviewStatus: 'Denominator unknown. Sparse structure — extract only what artifact supports.',
  },
];

// ── PROFILE LOOKUP ───────────────────────────────────────────

export function getSubjectProfile(subjectCode: string): SubjectStructuralProfile | undefined {
  return SUBJECT_STRUCTURAL_PROFILES.find((p) => p.subjectCode === subjectCode);
}

// ============================================================
// GRADE COMPLETENESS PROFILES (Gate 07C.5 §27)
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

    return {
      gradeCode,
      subjects: subjectCodes,
      totalCells: gradeCells.length,
      denominatorReadyCells: gradeCells.filter((c) => c.denominatorConfidence !== 'UNKNOWN').length,
      partialCells: gradeCells.filter((c) => c.denominatorConfidence === 'PARTIAL').length,
      blockedCells: gradeCells.filter((c) => c.knownGapCount > 0).length,
      reviewQueueCount: gradeCells.filter((c) => c.reviewRequiredCount > 0).length,
      cellStatuses,
      notes: `Grade ${gradeCode}: ${gradeCells.length} cells, all DENOMINATOR_UNKNOWN. Internal structure requires extraction.`,
    };
  });

export function getGradeProfile(gradeCode: string): GradeCompletenessProfile | undefined {
  return GRADE_COMPLETENESS_PROFILES.find((p) => p.gradeCode === gradeCode);
}

// ── PROFILE NOTES ────────────────────────────────────────────

export const PROFILE_NOTES = {
  subjectProfiles: '9 subject profiles. All have SURFACE hierarchy depth. All have NONE_IDENTIFIED denominator candidate. Profiles describe source-derived structure only — no fabrication.',
  gradeProfiles: '6 grade profiles (P1-P6). Each has 9 cells. All cells are UNKNOWN. No grade claims completeness.',
  antiFabrication: 'No internal organization invented for any subject. All profiles document what the artifact establishes AND what it does not.',
  sourceBacking: 'All profiles trace to src-primary-curriculum-2021 v1.0.0. Source locator precision: SECTION_ONLY for all grade×subject cells.',
  denominatorReadiness: '0 of 54 cells have a determined denominator. This is the honest state — internal structure extraction is required before denominators can be established.',
} as const;
