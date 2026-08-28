/**
 * Qarayti.ai - Gate 07C.6.3: Direct Primary Artifact Evidence Verification Registry
 *
 * Verifies DIRECT primary source evidence for:
 *   (A) the 15 provisional component candidates,
 *   (B) the 54 grade × subject denominator cells,
 *   (C) source-confirmed subject/component/program structure,
 *   (D) direct source-page provenance.
 *
 * ALL structural evidence is bound to the authenticated 2021 primary
 * curriculum artifact (SHA-256 4FC71E9D...FAB0F) via the OCR-recovered
 * required pages (physical {32,33,36,37,42,43,44}). No artifact text is
 * committed here — only short verified labels, enumerable structure
 * descriptions, counts, and physical-page locators.
 *
 * EVIDENCE DISCIPLINE (§4/§10/§16/§18):
 *   - No guessing / no reconstruction from expected curriculum knowledge.
 *   - VERIFIED requires directly source-defined, clearly-visible structure.
 *   - Ambiguous row/column/cell association -> HUMAN_REVIEW_REQUIRED,
 *     never VERIFIED.
 *   - Catalog structure from the artifact DIFFERS from the retained
 *     9-subject grid; mismatches are recorded, NOT silently corrected.
 */

import type {
  CrossReferenceComparisonStatus,
  DirectEvidenceVerdict,
  DirectStructuralCategoryType,
  DirectDenominatorCellState,
  PrimaryDirectProvenance,
  PrimaryDirectComponent,
  DirectCandidateVerification,
  DirectDenominatorCell,
  RequiredTableInspection,
  DirectGapEvaluation,
  DirectEvidenceGateVerdict,
  DenominatorType,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';

// ============================================================
// ARTIFACT BINDING (§3)
// ============================================================

export const DIRECT_EVIDENCE_ARTIFACT_SHA256 =
  '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F';
export const DIRECT_EVIDENCE_SOURCE_ID = 'src-primary-curriculum-2021';
export const DIRECT_EVIDENCE_SOURCE_VERSION = 'v1.0.0';
export const DIRECT_EVIDENCE_REQUIRED_PAGES: readonly number[] = [32, 33, 36, 37, 42, 43, 44];

// Expanded evidence pages beyond the base required set, opened only where a
// component/denominator was NOT decidable from the base 7 (§9 expansion):
//   - phys35: Languages 4-skill structure (الاستماع، التحدث، القراءة، الكتابة)
//   - phys41: civics (التربية على المواطنة -> التربية المدنية) replacement note
// Both were already OCR-recovered in the 07C.6.2 pipeline. Recorded explicitly.
export const DIRECT_EVIDENCE_EXPANDED_PAGES: readonly number[] = [35, 41];
export const DIRECT_EVIDENCE_ALLOWED_EVIDENCE_PAGES: readonly number[] = [
  ...DIRECT_EVIDENCE_REQUIRED_PAGES,
  ...DIRECT_EVIDENCE_EXPANDED_PAGES,
];

// ============================================================
// REQUIRED-TABLE INSPECTION (T01..T07, §9/§10)
// ============================================================
// Each required table was read from its OCR-recovered physical page.
// Table geometry is retained for human review. Where a numeric value
// (e.g. per-year competency counts on T02) cannot be safely associated
// to its row/column, the cells are treated as HUMAN_REVIEW_REQUIRED and
// are NOT used as VERIFIED denominators.

export const REQUIRED_TABLE_INSPECTIONS: readonly RequiredTableInspection[] = [
  {
    tableId: 'T01',
    description: 'Competency dimensions structure (framework)',
    physicalPages: [32],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: false,
    note: 'Strategic/communicative/methodological/cultural/technological competency dimensions; general framework, not a subject component denominator.',
  },
  {
    tableId: 'T02',
    description: 'Subject-to-grade competency matrix (candidate denominator)',
    physicalPages: [33],
    evidenceRead: true,
    associationClear: 'AMBIGUOUS',
    usableForDenominators: false,
    note: 'The artifact catalog (3 domains, 10 subjects) is clearly legible, but the right-column per-year competency numbers (10,10,5,4,3,2,1,9...) are OCR-garbled and cannot be safely associated to their rows => values NOT verifiable as exact counts. HUMAN_REVIEW_REQUIRED for exact per-year competency counts.',
  },
  {
    tableId: 'T03',
    description: 'Three-domain + components structure',
    physicalPages: [36],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: true,
    note: 'Domains enumerated: Languages; Math/Sci/Tech; Socialization. Math components (الأعداد والحساب، الهندسة والقياس، تنظيم ومعالجة البيانات) = 3; Science components (علوم الحياة والأرض، العلوم الفيزيائية، الفضاء، التكنولوجيا) = 4; Islamic Education 5 مداخل (التزكية، الاقتداء، الاستجابة، القسط، الحكمة).',
  },
  {
    tableId: 'T04',
    description: 'Component / subject boundaries (Music as Artistic-Ed component)',
    physicalPages: [37],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: true,
    note: 'التربية الفنية تضم الرسم والموسيقى والأناشيد والمسرح والتشكيل (5 sub-areas incl. Music). التربية البدنية تضم الألعاب الفردية والجماعية (2). الاجتماعيات تتشكل من التاريخ والجغرافيا والتربية المدنية. المهارات الحياتية: السلامة الطرقية، التربية المالية، المقاولاتية، استكشاف المهن، المشروع الشخصي (5).',
  },
  {
    tableId: 'T05',
    description: 'Grade-by-grade class-hour allocations',
    physicalPages: [42],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: true,
    note: 'Confirms subject presence per grade and that Social Studies (ت.ج/ت.م) appears only from السنة الرابعة (year 4).',
  },
  {
    tableId: 'T06',
    description: 'Weekly class-hour summary by level + subject codes',
    physicalPages: [43],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: true,
    note: 'Subject codes: ع=عربية، ف=فرنسية، ر=رياضيات، ن.ع=نشاط علمي، ت.إ=تربية إسلامية، ت.ج=تاريخ وجغرافيا، ت.م=تربية مدنية، ت.ف=تربية فنية، ت.ب=تربية بدنية، م.ح=مهارات حياتية. Years 1-3 have NO ت.ج/ت.م; years 4-6 have both.',
  },
  {
    tableId: 'T07',
    description: 'Time distribution by grade/subject (full year grid)',
    physicalPages: [44],
    evidenceRead: true,
    associationClear: 'CLEAR',
    usableForDenominators: true,
    note: 'Full subject catalog confirmed for all 6 grades (العربية، الأمازيغية، الفرنسية، الإنجليزية، الرياضيات، النشاط العلمي، التربية الإسلامية، الاجتماعيات، التربية الفنية، التربية البدنية، المهارات الحياتية). Confirms cross-grade presence for every non-social-studies subject.',
  },
];

// ============================================================
// DIRECT SOURCE STRUCTURE (§15/§16/§18)
// ============================================================
// Clearly-visible, enumerable structural categories observed directly in
// the artifact. These are the source-denominated structures used both as
// per-grade denominators and as the 15-candidate reconciliation basis.
// A "(safe) short verified label + physical page + table" is recorded for
// each; full-page text is never committed.

function page(physical: number, printed?: string, tableId?: string): PrimaryDirectProvenance {
  return {
    physicalPage: physical,
    scannedIndex: physical - 1,
    printedPage: printed,
    tableId,
    blockLabel: tableId ? `T-${tableId} (phys ${physical})` : `phys ${physical}${printed ? ` (printed ${printed})` : ''}`,
    rowColumnNote: 'Clear association: structural category list read directly from the artifact text fragment in reading order.',
    ocrQuality: 'OCR_USABLE_WITH_REVIEW',
  };
}

export const DIRECT_SOURCE_COMPONENTS: readonly PrimaryDirectComponent[] = [
  // Languages domain (phys35): 4 unified skills apply to عربية/أمازيغية/فرنسية
  {
    componentCode: 'SKILL_LISTENING',
    nameAr: 'الاستماع',
    nameFr: 'Écoute',
    categoryType: 'UNIFIED_SKILL',
    grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(35, '36'), { ...page(33, '34', 'T02'), rowColumnNote: 'Languages domain subjects legible; 4-skill structure on phys35.', sourceWordingAr: 'الاستماع' }],
  },
  {
    componentCode: 'SKILL_SPEAKING',
    nameAr: 'التحدث',
    nameFr: 'Expression Orale',
    categoryType: 'UNIFIED_SKILL',
    grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(35, '36')],
  },
  {
    componentCode: 'SKILL_READING',
    nameAr: 'القراءة',
    nameFr: 'Lecture',
    categoryType: 'UNIFIED_SKILL',
    grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(35, '36')],
  },
  {
    componentCode: 'SKILL_WRITING',
    nameAr: 'الكتابة',
    nameFr: 'Écriture',
    categoryType: 'UNIFIED_SKILL',
    grades: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(35, '36')],
  },
  // Math (phys36): 3 components
  {
    componentCode: 'MATH_NUMBERS_ARITHMETIC',
    nameAr: 'الأعداد والحساب',
    nameFr: 'Nombres et Calcul',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  {
    componentCode: 'MATH_GEOMETRY_MEASUREMENT',
    nameAr: 'الهندسة والقياس',
    nameFr: 'Géométrie et Mesure',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  {
    componentCode: 'MATH_DATA_PROCESSING',
    nameAr: 'تنظيم ومعالجة البيانات',
    nameFr: 'Organisation et Traitement des Données',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  // Science / النشاط العلمي (phys36): 4 components
  {
    componentCode: 'SCIENCE_LIFE_EARTH',
    nameAr: 'علوم الحياة والأرض',
    nameFr: 'Sciences de la Vie et de la Terre',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  {
    componentCode: 'SCIENCE_PHYSICAL',
    nameAr: 'العلوم الفيزيائية',
    nameFr: 'Sciences Physiques',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  {
    componentCode: 'SCIENCE_SPACE',
    nameAr: 'الفضاء',
    nameFr: 'L\'Espace',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  {
    componentCode: 'SCIENCE_TECHNOLOGY',
    nameAr: 'التكنولوجيا',
    nameFr: 'Technologie',
    categoryType: 'COMPONENT',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  // Socialization domain (phys36/37): Islamic Education 5 مداخل
  {
    componentCode: 'ISLAMIC_APPROACHES',
    nameAr: 'مداخل التربية الإسلامية',
    nameFr: 'Approches de l\'Enseignement Islamique',
    categoryType: 'APPROACH',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(36, '37', 'T03')],
  },
  // Art / التربية الفنية (phys37): 5 sub-areas incl. Music
  {
    componentCode: 'ART_SUB_AREAS',
    nameAr: 'مجالات التربية الفنية',
    nameFr: 'Domaines des Arts',
    categoryType: 'SUB_AREA',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(37, '38', 'T04')],
  },
  // Sport / التربية البدنية (phys37): 2 sub-areas
  {
    componentCode: 'SPORT_GAME_TYPES',
    nameAr: 'الألعاب الفردية والجماعية',
    nameFr: 'Jeux Individuels et Collectifs',
    categoryType: 'SUB_AREA',
    grades: PRIMARY_GRADE_CODES,
    evidenceStatus: 'DIRECTLY_VERIFIED',
    provenance: [page(37, '38', 'T04')],
  },
];

// ============================================================
// 15-CANDIDATE RECONCILIATION (§16)
// ============================================================
// Each of the 15 provisional candidates is compared against the direct
// artifact structure. DIFFERENT_STRUCTURE / mismatches are recorded, never
// silently corrected.

export const DIRECT_CANDIDATE_VERIFICATIONS: readonly DirectCandidateVerification[] = [
  {
    candidateCode: 'ARABIC_LISTENING_SPEAKING',
    subjectCode: 'ARABIC',
    candidateNameAr: 'الاستماع والتحدث',
    comparisonStatus: 'PARTIAL_MATCH',
    verdict: 'PARTIALLY_CONFIRMED',
    sourceEquivalentNameAr: 'الاستماع / التحدث (مهارتان منظمة)',
    evidencePage: 35,
    evidenceNote: 'Artifact splits the combined candidate into two UNIFIED_SKILLS of a 4-skill model (الاستماع، التحدث، القراءة، الكتابة) applying to all Languages-domain subjects. The combined 1-component candidate is not a source unit; source uses 4 separate skills.',
  },
  {
    candidateCode: 'ARABIC_READING',
    subjectCode: 'ARABIC',
    candidateNameAr: 'القراءة',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'القراءة',
    evidencePage: 35,
    evidenceNote: 'القراءة (reading) is directly one of the 4 unified skills of the Languages domain.',
  },
  {
    candidateCode: 'ARABIC_WRITING',
    subjectCode: 'ARABIC',
    candidateNameAr: 'الكتابة',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'الكتابة',
    evidencePage: 35,
    evidenceNote: 'الكتابة (writing) is directly one of the 4 unified skills of the Languages domain.',
  },
  {
    candidateCode: 'FRENCH_READING',
    subjectCode: 'FRENCH',
    candidateNameAr: 'القراءة',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'القراءة',
    evidencePage: 35,
    evidenceNote: 'The 4 unified skills apply to all three Languages-domain subjects including French (الفرنسية).',
  },
  {
    candidateCode: 'FRENCH_WRITTEN_PRODUCTION',
    subjectCode: 'FRENCH',
    candidateNameAr: 'الإنتاج الكتابي',
    comparisonStatus: 'SEMANTIC_MATCH',
    verdict: 'DIRECTLY_VERIFIED_EQUIVALENT',
    sourceEquivalentNameAr: 'الكتابة',
    evidencePage: 35,
    evidenceNote: 'Artifact uses الكتابة (writing) as the Languages-domain skill; the candidate "الإنتاج الكتابي" (written production) is semantically equivalent to الكتابة for French.',
  },
  {
    candidateCode: 'MATH_NUMBERS_ARITHMETIC',
    subjectCode: 'MATH',
    candidateNameAr: 'الأعداد والحساب',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'الأعداد والحساب',
    evidencePage: 36,
    evidenceNote: 'MATH component #1 of 3 listed directly for الرياضيات.',
  },
  {
    candidateCode: 'MATH_GEOMETRY_MEASUREMENT',
    subjectCode: 'MATH',
    candidateNameAr: 'الهندسة والقياس',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'الهندسة والقياس',
    evidencePage: 36,
    evidenceNote: 'MATH component #2 of 3 listed directly for الرياضيات.',
  },
  {
    candidateCode: 'MATH_DATA_PROCESSING',
    subjectCode: 'MATH',
    candidateNameAr: 'تنظيم ومعالجة البيانات',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'تنظيم ومعالجة البيانات',
    evidencePage: 36,
    evidenceNote: 'MATH component #3 of 3 listed directly for الرياضيات.',
  },
  {
    candidateCode: 'SCIENCE_LIFE_EARTH',
    subjectCode: 'SCIENCE',
    candidateNameAr: 'علوم الحياة والأرض',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'علوم الحياة والأرض',
    evidencePage: 36,
    evidenceNote: 'Science component #1 of 4 listed directly for النشاط العلمي.',
  },
  {
    candidateCode: 'SCIENCE_PHYSICAL',
    subjectCode: 'SCIENCE',
    candidateNameAr: 'العلوم الفيزيائية',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'العلوم الفيزيائية',
    evidencePage: 36,
    evidenceNote: 'Science component #2 of 4 listed directly for النشاط العلمي.',
  },
  {
    candidateCode: 'SCIENCE_SPACE',
    subjectCode: 'SCIENCE',
    candidateNameAr: 'الفضاء',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'الفضاء',
    evidencePage: 36,
    evidenceNote: 'Science component #3 of 4 listed directly for النشاط العلمي.',
  },
  {
    candidateCode: 'SCIENCE_TECHNOLOGY',
    subjectCode: 'SCIENCE',
    candidateNameAr: 'التكنولوجيا',
    comparisonStatus: 'MATCH',
    verdict: 'DIRECTLY_VERIFIED',
    sourceEquivalentNameAr: 'التكنولوجيا',
    evidencePage: 36,
    evidenceNote: 'Science component #4 of 4 listed directly for النشاط العلمي.',
  },
  {
    candidateCode: 'SOCIAL_HISTORY',
    subjectCode: 'CIVIC_EDUCATION',
    candidateNameAr: 'التاريخ',
    comparisonStatus: 'PRIMARY_SOURCE_USES_DIFFERENT_STRUCTURE',
    verdict: 'PARTIALLY_CONFIRMED',
    sourceEquivalentCode: 'SOCIAL_HISTORY_GEO',
    sourceEquivalentNameAr: 'التاريخ والجغرافيا (ت.ج)',
    evidencePage: 37,
    evidenceNote: 'Artifact groups التاريخ مع الجغرافيا under ONE subject ت.ج (تاريخ وجغرافيا), separate from ت.م (تربية مدنية). History is not a standalone component of civics; it is grouped with geography. Structure differs from the 3-compartment civic candidate.',
  },
  {
    candidateCode: 'SOCIAL_GEOGRAPHY',
    subjectCode: 'CIVIC_EDUCATION',
    candidateNameAr: 'الجغرافيا',
    comparisonStatus: 'PRIMARY_SOURCE_USES_DIFFERENT_STRUCTURE',
    verdict: 'PARTIALLY_CONFIRMED',
    sourceEquivalentCode: 'SOCIAL_HISTORY_GEO',
    sourceEquivalentNameAr: 'التاريخ والجغرافيا (ت.ج)',
    evidencePage: 37,
    evidenceNote: 'Artifact groups الجغرافيا مع التاريخ under ONE subject ت.ج (تاريخ وجغرافيا). Geography is not a standalone civics component; it is grouped with history.',
  },
  {
    candidateCode: 'SOCIAL_CITIZENSHIP',
    subjectCode: 'CIVIC_EDUCATION',
    candidateNameAr: 'التربية على المواطنة',
    comparisonStatus: 'SEMANTIC_MATCH',
    verdict: 'PARTIALLY_CONFIRMED',
    sourceEquivalentCode: 'CIVIC_EDUCATION',
    sourceEquivalentNameAr: 'التربية المدنية (ت.م)',
    evidencePage: 41,
    evidenceNote: 'Artifact phys41 notes that التربية على المواطنة (education to citizenship) was REPLACED by التربية المدنية (Education civique / ت.م). The civics subject exists; it is a separate subject from history/geography and has no enumerated internal components in the reviewed pages.',
  },
];

export const TOTAL_CANDIDATES = DIRECT_CANDIDATE_VERIFICATIONS.length; // 15

// ============================================================
// 54-CELL DENOMINATOR MATRIX (§12/§13/§20/§21)
// ============================================================
// Total = 9 subjects × 6 grades = 54. Every cell is explicit.
//
// DENOMINATOR BASIS BY SUBJECT (all directly source-defined, §12):
//   - ARABIC:     4 unified skills (الاستماع، التحدث، القراءة، الكتابة) — phys35
//   - FRENCH:     4 unified skills — phys35
//   - MATH:       3 components — phys36
//   - SCIENCE:    4 components — phys36
//   - ISLAMIC:    5 مداخل (التزكية، الاقتداء، الاستجابة، القسط، الحكمة) — phys36
//   - SPORT:      2 sub-areas (ألعاب فردية / جماعية) — phys37
//   - ART:        5 sub-areas (الرسم، الموسيقى، الأناشيد، المسرح، التشكيل) — phys37
//   - CIVIC:      P1-P3 no social studies (NOT_APPLICABLE); P4-P6 social studies
//                 present as ت.ج+ت.م but no enumerated civics component set -> PARTIAL
//                 (structure differs from 3-compartment candidate)
//   - MUSIC:      NOT a standalone subject; component of التربية الفنية -> UNKNOWN
//                 standalone denominator (mismatch recorded; catalog not redesigned).

const FOUR_SKILLS = '4 unified skills (الاستماع، التحدث، القراءة، الكتابة)';

type CellSeed = {
  subject: string;
  state: DirectDenominatorCellState;
  type: DenominatorType;
  count: number | undefined;
  desc: string;
  pages: readonly number[];
  mismatch: boolean;
  note: string;
};

function makeCells(seed: CellSeed): DirectDenominatorCell[] {
  return PRIMARY_GRADE_CODES.map((g) => ({
    gradeCode: g,
    subjectCode: seed.subject,
    state: seed.state,
    denominatorType: seed.type,
    sourceCount: seed.count,
    sourceCountDescription: seed.desc,
    provable: seed.state === 'VERIFIED',
    provenancePages: seed.pages,
    mismatchRecorded: seed.mismatch,
    note: seed.note,
  }));
}

const seedSpecs: readonly CellSeed[] = [
  {
    subject: 'ARABIC',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 4,
    desc: FOUR_SKILLS,
    pages: [35, 33],
    mismatch: false,
    note: 'Direct: Languages domain = 4 unified skills applying to Arabic across P1-P6.',
  },
  {
    subject: 'FRENCH',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 4,
    desc: FOUR_SKILLS,
    pages: [35, 33],
    mismatch: false,
    note: 'Direct: same 4 unified skills apply to French across P1-P6.',
  },
  {
    subject: 'MATH',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 3,
    desc: '3 components (الأعداد والحساب، الهندسة والقياس، تنظيم ومعالجة البيانات)',
    pages: [36],
    mismatch: false,
    note: 'Direct: الرياضيات تضم 3 مكونات across P1-P6.',
  },
  {
    subject: 'SCIENCE',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 4,
    desc: '4 components (علوم الحياة والأرض، العلوم الفيزيائية، الفضاء، التكنولوجيا)',
    pages: [36],
    mismatch: false,
    note: 'Direct: النشاط العلمي يضم 4 مكونات across P1-P6.',
  },
  {
    subject: 'ISLAMIC_EDUCATION',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 5,
    desc: '5 مداخل (التزكية، الاقتداء، الاستجابة، القسط، الحكمة)',
    pages: [36],
    mismatch: false,
    note: 'Direct: التربية الإسلامية لها 5 مداخل across P1-P6.',
  },
  {
    subject: 'SPORT',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 2,
    desc: '2 sub-areas (الألعاب الفردية، الألعاب الجماعية)',
    pages: [37],
    mismatch: false,
    note: 'Direct: التربية البدنية تضم الألعاب الفردية والجماعية across P1-P6.',
  },
  {
    subject: 'ART',
    state: 'VERIFIED',
    type: 'COMPONENT',
    count: 5,
    desc: '5 sub-areas (الرسم، الموسيقى، الأناشيد، المسرح، التشكيل)',
    pages: [37],
    mismatch: false,
    note: 'Direct: التربية الفنية تضم الرسم والموسيقى والأناشيد والمسرح والتشكيل across P1-P6.',
  },
  {
    subject: 'MUSIC',
    state: 'UNKNOWN',
    type: 'NONE_IDENTIFIED',
    count: undefined,
    desc: 'No standalone denominator (component of التربية الفنية)',
    pages: [37, 44],
    mismatch: true,
    note: 'Direct: Music is one of the 5 sub-areas of التربية الفنية (§15), not a standalone top-level subject. Mismatch recorded; catalog not redesigned. Standalone MUSIC denominator = UNKNOWN.',
  },
];

const CIVIC_P1P3_SEED = {
  state: 'NOT_APPLICABLE' as DirectDenominatorCellState,
  type: 'NONE_IDENTIFIED' as DenominatorType,
  count: undefined as number | undefined,
  desc: 'No social studies subject in this grade',
  pages: [42, 43] as readonly number[],
  mismatch: true,
  note: 'Direct: social studies (ت.ج/ت.م) NOT present in years 1-3 (phys42/43); P1-P3 have no social studies subject.',
};
const CIVIC_P4P6_SEED = {
  state: 'PARTIAL' as DirectDenominatorCellState,
  type: 'NONE_IDENTIFIED' as DenominatorType,
  count: undefined as number | undefined,
  desc: 'Social studies present; civics structure differs (ت.م separate from ت.ج)',
  pages: [42, 43, 37] as readonly number[],
  mismatch: true,
  note: 'Direct: years 4-6 have both ت.ج (تاريخ وجغرافيا) and ت.م (تربية مدنية). Civics has no enumerated component set in reviewed pages; structure differs from the 3-compartment candidate. PARTIAL.',
};

const FINAL_DIRECT_CELLS: DirectDenominatorCell[] = [];

const builtSubjects = new Set<string>();

for (const seed of seedSpecs) {
  if (seed.subject === 'CIVIC_EDUCATION') continue;
  builtSubjects.add(seed.subject);
  FINAL_DIRECT_CELLS.push(...makeCells(seed));
}
builtSubjects.add('CIVIC_EDUCATION');

// Civic cells are grade-scoped and added explicitly (they do not come from seedSpecs).
for (const g of PRIMARY_GRADE_CODES) {
  const civicSeed = ['P1', 'P2', 'P3'].includes(g) ? CIVIC_P1P3_SEED : CIVIC_P4P6_SEED;
  FINAL_DIRECT_CELLS.push({
    gradeCode: g,
    subjectCode: 'CIVIC_EDUCATION',
    state: civicSeed.state,
    denominatorType: civicSeed.type,
    sourceCount: civicSeed.count,
    sourceCountDescription: civicSeed.desc,
    provable: civicSeed.state === 'VERIFIED',
    provenancePages: civicSeed.pages,
    mismatchRecorded: civicSeed.mismatch,
    note: civicSeed.note,
  });
}

export const DIRECT_DENOMINATOR_CELLS: readonly DirectDenominatorCell[] = FINAL_DIRECT_CELLS;

export const DIRECT_CELL_TOTALS = (() => {
  const byState: Record<DirectDenominatorCellState, number> = {
    VERIFIED: 0,
    PARTIAL: 0,
    UNKNOWN: 0,
    NOT_APPLICABLE: 0,
  };
  for (const c of FINAL_DIRECT_CELLS) {
    byState[c.state] += 1;
  }
  return byState;
})();

// ============================================================
// GAP-STATE RE-EVALUATION (§25)
// ============================================================

export const DIRECT_GAP_EVALUATIONS: readonly DirectGapEvaluation[] = [
  {
    gapId: 'GAP-001',
    afterState: 'PARTIALLY_RESOLVED',
    directEvidenceDescription:
      'Direct evidence now VERIFIED component denominators for ARABIC(4)/FRENCH(4)/MATH(3)/SCIENCE(4)/ISLAMIC(5)/SPORT(2)/ART(5). CIVIC P4-P6 remains PARTIAL (structure differs); MUSIC standalone remains UNKNOWN; CIVIC P1-P3 NOT_APPLICABLE. 42/54 cells VERIFIED.',
    unchangedFromPrior: false,
  },
  {
    gapId: 'GAP-002',
    afterState: 'RESOLVED',
    directEvidenceDescription:
      'Direct evidence confirms the source uses COMPONENTS / UNIFIED_SKILLS / مداخل / sub-areas (not course "units") for subject organization. Terminology directly confirmed from phys35/36/37.',
    unchangedFromPrior: false,
  },
  {
    gapId: 'GAP-003',
    afterState: 'PARTIALLY_RESOLVED',
    directEvidenceDescription:
      'Competency structure (annual competency + per-grade counts) is NOT enumerable from the required pages: T02 per-year competency numbers are OCR-garbled and cannot be safely associated to rows (HUMAN_REVIEW_REQUIRED). Not verified as exact counts.',
    unchangedFromPrior: true,
  },
  {
    gapId: 'GAP-004',
    afterState: 'NOT_APPLICABLE',
    directEvidenceDescription:
      'Lesson-denominator applicability unchanged by this gate; not part of direct structural verification scope.',
    unchangedFromPrior: true,
  },
];

// ============================================================
// CONTENT / PUBLICATION SAFETY (§26/§31)
// ============================================================

export const DIRECT_CONTENT_STATUS = {
  verified: 0,
  published: 0,
  structureCompleteVerified: 0,
  mastery: 'NOT_DERIVED' as const,
  accuracyDiffersFromMastery: true,
  lessons: 0,
  knowledgeObjects: 0,
  exercises: 0,
};

// ============================================================
// GATE 07C.6.3 VERDICT (§41)
// ============================================================

export const DIRECT_EVIDENCE_VERDICT: DirectEvidenceGateVerdict = {
  gate: '07C.6.3',
  verifiedCells: DIRECT_CELL_TOTALS.VERIFIED,
  partialCells: DIRECT_CELL_TOTALS.PARTIAL,
  unknownCells: DIRECT_CELL_TOTALS.UNKNOWN,
  notApplicableCells: DIRECT_CELL_TOTALS.NOT_APPLICABLE,
  totalCells: FINAL_DIRECT_CELLS.length,
  verifiedCandidates: DIRECT_CANDIDATE_VERIFICATIONS.filter(
    (c) => c.verdict === 'DIRECTLY_VERIFIED' || c.verdict === 'DIRECTLY_VERIFIED_EQUIVALENT',
  ).length,
  totalCandidates: TOTAL_CANDIDATES,
  contentVerified: 0,
  published: 0,
  structureCompleteVerified: 0,
  masteryDerived: false,
  recommendation: 'PASS',
};
