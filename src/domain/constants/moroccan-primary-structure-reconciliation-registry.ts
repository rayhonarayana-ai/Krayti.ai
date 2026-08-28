/**
 * Qarayti.ai - Gate 07C.6.4: Canonical Primary Curriculum Structure
 * Reconciliation Registry
 *
 * Reconciles the APPLICATION curriculum catalog with the SOURCE-NATIVE
 * structure directly proven by the authenticated 2021 Moroccan primary
 * curriculum artifact (GATE 07C.6.3 evidence; SHA-256 4FC71E9D...FAB0F).
 *
 * PRIMARY PRINCIPLES:
 *   - Source-native structure is AUTHORITATIVE (§3). Application-catalog
 *     convenience must NOT overwrite source truth.
 *   - The existing application catalog is NOT destroyed or redesigned (§4).
 *     MUSIC / CIVIC_EDUCATION / ART remain valid application identifiers;
 *     this layer maps them explicitly — even where the mapping is not 1:1
 *     (§6/§8/§9/§20).
 *   - This is DOMAIN TRUTH / MODELING ONLY (§21/§22): no UI/routing/learner
 *     state/exercise behavior change, no DB migration, no schema deployment,
 *     no Supabase writes.
 *   - Denominator state is FROZEN to Gate 07C.6.3: VERIFIED=42, SUPPORTED=0,
 *     PARTIAL=3, UNKNOWN=6, NOT_APPLICABLE=3, TOTAL=54 (§2/§23). Reconciliation
 *     does NOT convert UNKNOWN MUSIC cells into VERIFIED.
 *
 * No artifact page text is committed here — only short verified source labels,
 * counts, structural-form descriptors, and physical-page locators.
 */

import type {
  ApplicationSubjectCode,
  CanonicalReconciliationVerdict,
  FutureExtractionContractRules,
  SourceApplicationMapping,
  SourceApplicationMappingRelationship,
  SourceNativeStructureElement,
  SourceNativeStructureRecord,
  SourceNativeSubjectCode,
  StructuralMismatchIssue,
  ReconciliationMappingStatus,
  DirectDenominatorCellState,
  PrimaryDirectProvenance,
} from '../types/curriculum-source-governance.types';

import { PRIMARY_GRADE_CODES } from './curriculum-architecture.constants';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
} from './moroccan-primary-direct-evidence-registry';

// ============================================================
// ARTIFACT BINDING (§19) — reuse the 07C.6.3 authenticated binding
// ============================================================

export const RECONCILIATION_ARTIFACT_ID = 'src-primary-curriculum-2021';
export const RECONCILIATION_ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
export const RECONCILIATION_SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION; // v1.0.0
export const RECONCILIATION_EDUCATION_SYSTEM_CODE = 'MOROCCO';
export const RECONCILIATION_STAGE_CODE = 'PRIMARY';

// ============================================================
// PROVENANCE HELPER — reuse the 07C.6.3 page() convention
// ============================================================

function provenance(physical: number, printed?: string, tableId?: string): PrimaryDirectProvenance {
  return {
    physicalPage: physical,
    scannedIndex: physical - 1,
    printedPage: printed,
    tableId,
    blockLabel: tableId ? `T-${tableId} (phys ${physical})` : `phys ${physical}${printed ? ` (printed ${printed})` : ''}`,
    rowColumnNote: 'Clear association: source-native structural category read directly from the artifact text fragment in reading order (Gate 07C.6.3).',
    ocrQuality: 'OCR_USABLE_WITH_REVIEW',
  };
}

// ============================================================
// SOURCE-NATIVE STRUCTURAL ELEMENTS (§5/§16/§27)
// ============================================================
// Stable identity is derived from SEMANTIC SOURCE SCOPE (educationSystem,
// stage, sourceSubject, structuralForm, sourceElementKey, sourceVersion).
// Page number is provenance, NOT the primary identity (§16).

export const SOURCE_NATIVE_STRUCTURAL_ELEMENTS: readonly SourceNativeStructureElement[] = [
  // --- Languages 4-skill model (phys35) — applies to عربية/أمازيغية/فرنسية ---
  {
    structuralElementId: 'el-skill-ar-listening',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_LANGUAGES', sourceSubjectNameAr: 'اللغة العربية', sourceSubjectNameFr: 'Langue Arabe',
    structuralForm: 'SKILL', sourceElementKey: 'ar-listening', nameAr: 'الاستماع', nameFr: 'Écoute',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-skill-ar-speaking',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_LANGUAGES', sourceSubjectNameAr: 'اللغة العربية', sourceSubjectNameFr: 'Langue Arabe',
    structuralForm: 'SKILL', sourceElementKey: 'ar-speaking', nameAr: 'التحدث', nameFr: 'Expression Orale',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-skill-ar-reading',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_LANGUAGES', sourceSubjectNameAr: 'اللغة العربية', sourceSubjectNameFr: 'Langue Arabe',
    structuralForm: 'SKILL', sourceElementKey: 'ar-reading', nameAr: 'القراءة', nameFr: 'Lecture',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-skill-ar-writing',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_LANGUAGES', sourceSubjectNameAr: 'اللغة العربية', sourceSubjectNameFr: 'Langue Arabe',
    structuralForm: 'SKILL', sourceElementKey: 'ar-writing', nameAr: 'الكتابة', nameFr: 'Écriture',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  // --- French (same 4-skill model, phys35/33) ---
  {
    structuralElementId: 'el-skill-fr-reading',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_FRENCH', sourceSubjectNameAr: 'الفرنسية', sourceSubjectNameFr: 'Français',
    structuralForm: 'SKILL', sourceElementKey: 'fr-reading', nameAr: 'القراءة', nameFr: 'Lecture',
    internalName: 'FRENCH_READING',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-skill-fr-writing',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_FRENCH', sourceSubjectNameAr: 'الفرنسية', sourceSubjectNameFr: 'Français',
    structuralForm: 'SKILL', sourceElementKey: 'fr-writing', nameAr: 'الكتابة', nameFr: 'Écriture',
    internalName: 'FRENCH_WRITTEN_PRODUCTION',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'Application candidate "الإنتاج الكتابي" (written production) is SEMANTICALLY EQUIVALENT to the source skill الكتابة; source wording is authoritative (§11).',
  },
  // --- Math 3 components (phys36) ---
  {
    structuralElementId: 'el-math-numbers', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_MATH', sourceSubjectNameAr: 'الرياضيات', sourceSubjectNameFr: 'Mathématiques',
    structuralForm: 'COMPONENT', sourceElementKey: 'math-numbers', nameAr: 'الأعداد والحساب', nameFr: 'Nombres et Calcul',
    internalName: 'MATH_NUMBERS_ARITHMETIC', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-math-geometry', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_MATH', sourceSubjectNameAr: 'الرياضيات', sourceSubjectNameFr: 'Mathématiques',
    structuralForm: 'COMPONENT', sourceElementKey: 'math-geometry', nameAr: 'الهندسة والقياس', nameFr: 'Géométrie et Mesure',
    internalName: 'MATH_GEOMETRY_MEASUREMENT', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-math-data', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_MATH', sourceSubjectNameAr: 'الرياضيات', sourceSubjectNameFr: 'Mathématiques',
    structuralForm: 'COMPONENT', sourceElementKey: 'math-data', nameAr: 'تنظيم ومعالجة البيانات', nameFr: 'Organisation et Traitement des Données',
    internalName: 'MATH_DATA_PROCESSING', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  // --- Science 4 components (phys36) ---
  {
    structuralElementId: 'el-sci-life', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SCIENCE', sourceSubjectNameAr: 'النشاط العلمي', sourceSubjectNameFr: 'Activité Scientifique',
    structuralForm: 'COMPONENT', sourceElementKey: 'sci-life-earth', nameAr: 'علوم الحياة والأرض', nameFr: 'Sciences de la Vie et de la Terre',
    internalName: 'SCIENCE_LIFE_EARTH', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-sci-physical', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SCIENCE', sourceSubjectNameAr: 'النشاط العلمي', sourceSubjectNameFr: 'Activité Scientifique',
    structuralForm: 'COMPONENT', sourceElementKey: 'sci-physical', nameAr: 'العلوم الفيزيائية', nameFr: 'Sciences Physiques',
    internalName: 'SCIENCE_PHYSICAL', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-sci-space', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SCIENCE', sourceSubjectNameAr: 'النشاط العلمي', sourceSubjectNameFr: 'Activité Scientifique',
    structuralForm: 'COMPONENT', sourceElementKey: 'sci-space', nameAr: 'الفضاء', nameFr: 'L\'Espace',
    internalName: 'SCIENCE_SPACE', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  {
    structuralElementId: 'el-sci-tech', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SCIENCE', sourceSubjectNameAr: 'النشاط العلمي', sourceSubjectNameFr: 'Activité Scientifique',
    structuralForm: 'COMPONENT', sourceElementKey: 'sci-technology', nameAr: 'التكنولوجيا', nameFr: 'Technologie',
    internalName: 'SCIENCE_TECHNOLOGY', gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
  },
  // --- Islamic Education 5 مداخل (phys36) ---
  {
    structuralElementId: 'el-islamic-approaches', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_ISLAMIC', sourceSubjectNameAr: 'التربية الإسلامية', sourceSubjectNameFr: 'Éducation Islamique',
    structuralForm: 'APPROACH', sourceElementKey: 'islamic-approaches', nameAr: 'مداخل التربية الإسلامية', nameFr: 'Approches de l\'Enseignement Islamique',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'Five مداخل (التزكية، الاقتداء، الاستجابة، القسط، الحكمة) are the ENTRY structural form; do NOT normalize to a generic UNIT abstraction (§13).',
  },
  // --- Art sub-areas (phys37) incl. Music component ---
  {
    structuralElementId: 'el-art-subareas', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_ART', sourceSubjectNameAr: 'التربية الفنية', sourceSubjectNameFr: 'Éducation Artistique',
    structuralForm: 'SUB_AREA', sourceElementKey: 'art-subareas', nameAr: 'مجالات التربية الفنية', nameFr: 'Domaines des Arts',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'Five source-native sub-areas: الرسم، الموسيقى، الأناشيد، المسرح، التشكيل. Music (الموسيقى) is a source-native COMPONENT/sub-area of التربية الفنية — NOT a standalone source program (§8).',
  },
  // --- Sport sub-areas (phys37) ---
  {
    structuralElementId: 'el-sport-subareas', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SPORT', sourceSubjectNameAr: 'التربية البدنية', sourceSubjectNameFr: 'Éducation Physique',
    structuralForm: 'SUB_AREA', sourceElementKey: 'sport-game-types', nameAr: 'الألعاب الفردية والجماعية', nameFr: 'Jeux Individuels et Collectifs',
    gradeScope: PRIMARY_GRADE_CODES, sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'Two source-native sub-areas: الألعاب الفردية، الألعاب الجماعية (§14). Source structure preserved; NOT transformed into lessons/KOs.',
  },
  // --- Social Studies / Civic structure (§9) ---
  {
    structuralElementId: 'el-social-history-geo', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SOCIAL_STUDIES', sourceSubjectNameAr: 'الاجتماعيات', sourceSubjectNameFr: 'Sciences Sociales',
    structuralForm: 'GROUPED_SUBJECT_AREA', sourceElementKey: 'social-history-geo', nameAr: 'تاريخ وجغرافيا (ت.ج)', nameFr: 'Histoire et Géographie',
    gradeScope: ['P4', 'P5', 'P6'], sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'Source groups التاريخ with الجغرافيا under ONE subject ت.ج, separate from ت.م (تربية مدنية). Social studies appears only from year 4 (phys42/43/37).',
  },
  {
    structuralElementId: 'el-social-civics', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SOCIAL_STUDIES', sourceSubjectNameAr: 'الاجتماعيات', sourceSubjectNameFr: 'Sciences Sociales',
    structuralForm: 'GROUPED_SUBJECT_AREA', sourceElementKey: 'social-civics', nameAr: 'التربية المدنية (ت.م)', nameFr: 'Éducation Civique',
    gradeScope: ['P4', 'P5', 'P6'], sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'التربية على المواطنة (education to citizenship) was replaced/refined by التربية المدنية (ت.م) per recorded primary evidence (phys41/37). No enumerated internal component set in the reviewed pages.',
  },
  {
    structuralElementId: 'el-social-not-applicable-p1p3', educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    sourceSubject: 'SRC_SOCIAL_STUDIES', sourceSubjectNameAr: 'الاجتماعيات', sourceSubjectNameFr: 'Sciences Sociales',
    structuralForm: 'NONE_IDENTIFIED', sourceElementKey: 'social-not-applicable', nameAr: 'لا يوجد', nameFr: 'Non présente',
    gradeScope: ['P1', 'P2', 'P3'], sourceVersionId: RECONCILIATION_SOURCE_VERSION_ID,
    comments: 'No social studies subject in years 1-3 (direct phys42/43). CIVIC P1-P3 = NOT_APPLICABLE.',
  },
];

// ============================================================
// CANONICAL SOURCE-NATIVE STRUCTURE REGISTRY (§27)
// ============================================================
// Minimal registry of the directly verified source-native primary structures.
// Does NOT claim full content completeness.

export const SOURCE_NATIVE_STRUCTURE_REGISTRY: readonly SourceNativeStructureRecord[] = [
  {
    sourceSubject: 'SRC_LANGUAGES', structureNameAr: 'نموذج المهارات الأربع', structuralForm: 'SKILL',
    componentKeys: ['ar-listening', 'ar-speaking', 'ar-reading', 'ar-writing'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '4 unified skills للغات (العربية/الأمازيغية/الفرنسية) — phys35.',
  },
  {
    sourceSubject: 'SRC_FRENCH', structureNameAr: 'نموذج المهارات الأربع', structuralForm: 'SKILL',
    componentKeys: ['fr-reading', 'fr-writing'], gradeScope: PRIMARY_GRADE_CODES,
    comment: 'Same 4-skill model applies to French; source labels authoritative.',
  },
  {
    sourceSubject: 'SRC_MATH', structureNameAr: 'مكونات الرياضيات', structuralForm: 'COMPONENT',
    componentKeys: ['math-numbers', 'math-geometry', 'math-data'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '3 components directly verified — phys36.',
  },
  {
    sourceSubject: 'SRC_SCIENCE', structureNameAr: 'مكونات النشاط العلمي', structuralForm: 'COMPONENT',
    componentKeys: ['sci-life-earth', 'sci-physical', 'sci-space', 'sci-technology'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '4 components directly verified — phys36.',
  },
  {
    sourceSubject: 'SRC_ISLAMIC', structureNameAr: 'مداخل التربية الإسلامية', structuralForm: 'APPROACH',
    componentKeys: ['islamic-approaches'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '5 مداخل (التزكية، الاقتداء، الاستجابة، القسط، الحكمة) — phys36. NOT a UNIT abstraction.',
  },
  {
    sourceSubject: 'SRC_SPORT', structureNameAr: 'مجالات التربية البدنية', structuralForm: 'SUB_AREA',
    componentKeys: ['sport-game-types'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '2 sub-areas (juex individuels/collectifs) — phys37.',
  },
  {
    sourceSubject: 'SRC_ART', structureNameAr: 'مجالات التربية الفنية', structuralForm: 'SUB_AREA',
    componentKeys: ['art-subareas'], gradeScope: PRIMARY_GRADE_CODES,
    comment: '5 sub-areas incl. Music; Music remains a component, not standalone — phys37.',
  },
  {
    sourceSubject: 'SRC_SOCIAL_STUDIES', structureNameAr: 'الاجتماعيات', structuralForm: 'GROUPED_SUBJECT_AREA',
    componentKeys: ['social-history-geo', 'social-civics', 'social-not-applicable'], gradeScope: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    comment: 'ت.ج (تاريخ وجغرافيا) + ت.م (تربية مدنية); social studies begins year 4; P1-P3 NOT_APPLICABLE.',
  },
];

// ============================================================
// APPLICATION MAPPING MATRIX (§26) — all 9 application subjects
// ============================================================
// Denominator state is FROZEN from Gate 07C.6.3 (§23). "sourceComponents"
// list the source-native component keys relevant to each mapping.

export const APPLICATION_MAPPING_MATRIX: readonly SourceApplicationMapping[] = [
  {
    applicationSubject: 'ARABIC', applicationSubjectNameAr: 'اللغة العربية',
    sourceSubject: 'SRC_LANGUAGES', sourceSubjectNameAr: 'اللغة العربية',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'SKILL',
    sourceComponents: ['ar-listening', 'ar-speaking', 'ar-reading', 'ar-writing'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'No mismatch: app ARABIC maps 1:1 to the Languages-domain 4-skill structure.',
    provenance: [provenance(35, '36'), provenance(33, '34', 'T02')],
    futureAction: 'Attach future Arabic content to the four source-native skills (الاستماع/التحدث/القراءة/الكتابة).',
  },
  {
    applicationSubject: 'FRENCH', applicationSubjectNameAr: 'الفرنسية',
    sourceSubject: 'SRC_FRENCH', sourceSubjectNameAr: 'الفرنسية',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'SKILL',
    sourceComponents: ['fr-reading', 'fr-writing'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'No catalog mismatch at subject level; the FRENCH_WRITTEN_PRODUCTION candidate is a semantic equivalent of the source skill الكتابة.',
    provenance: [provenance(35, '36'), provenance(33, '34', 'T02')],
    futureAction: 'Attach future French content to the source-native 4-skill model; keep الكتابة as source wording for written production.',
  },
  {
    applicationSubject: 'MATH', applicationSubjectNameAr: 'الرياضيات',
    sourceSubject: 'SRC_MATH', sourceSubjectNameAr: 'الرياضيات',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'COMPONENT',
    sourceComponents: ['math-numbers', 'math-geometry', 'math-data'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'None: 3 source components map directly.',
    provenance: [provenance(36, '37', 'T03')],
    futureAction: 'Attach future Math content to the 3 source-native components.',
  },
  {
    applicationSubject: 'SCIENCE', applicationSubjectNameAr: 'النشاط العلمي',
    sourceSubject: 'SRC_SCIENCE', sourceSubjectNameAr: 'النشاط العلمي',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'COMPONENT',
    sourceComponents: ['sci-life-earth', 'sci-physical', 'sci-space', 'sci-technology'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'None: 4 source components map directly.',
    provenance: [provenance(36, '37', 'T03')],
    futureAction: 'Attach future Science content to the 4 source-native components.',
  },
  {
    applicationSubject: 'ISLAMIC_EDUCATION', applicationSubjectNameAr: 'التربية الإسلامية',
    sourceSubject: 'SRC_ISLAMIC', sourceSubjectNameAr: 'التربية الإسلامية',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'APPROACH',
    sourceComponents: ['islamic-approaches'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'Structural-form mismatch vs old UNIT assumption: source uses 5 مداخل (APPROACH), not units. Recorded, not normalized (§13).',
    provenance: [provenance(36, '37', 'T03')],
    futureAction: 'Preserve the مداخل structural form; do NOT flatten Islamic content into generic units.',
  },
  {
    applicationSubject: 'SPORT', applicationSubjectNameAr: 'التربية البدنية',
    sourceSubject: 'SRC_SPORT', sourceSubjectNameAr: 'التربية البدنية',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'SUB_AREA',
    sourceComponents: ['sport-game-types'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'None at subject level.',
    provenance: [provenance(37, '38', 'T04')],
    futureAction: 'Attach future Sport content to the 2 source-native sub-areas.',
  },
  {
    applicationSubject: 'ART', applicationSubjectNameAr: 'التربية الفنية',
    sourceSubject: 'SRC_ART', sourceSubjectNameAr: 'التربية الفنية',
    mappingRelationship: 'DIRECT_MATCH', mappingStatus: 'VERIFIED_DIRECT',
    sourceStructuralForm: 'SUB_AREA',
    sourceComponents: ['art-subareas'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'VERIFIED',
    mismatch: 'None: ART maps 1:1 to source التربية الفنية (5 sub-areas). No double-counting with standalone MUSIC (§9).',
    provenance: [provenance(37, '38', 'T04')],
    futureAction: 'ART remains the primary source-native mapping; attach Art content to the 5 source sub-areas.',
  },
  {
    applicationSubject: 'MUSIC', applicationSubjectNameAr: 'الموسيقى',
    sourceSubject: 'SRC_ART', sourceSubjectNameAr: 'التربية الفنية',
    mappingRelationship: 'COMPONENT_OF', mappingStatus: 'MISMATCH',
    sourceStructuralForm: 'NONE_IDENTIFIED',
    sourceComponents: ['art-subareas'],
    gradeScope: PRIMARY_GRADE_CODES, denominatorState: 'UNKNOWN',
    mismatch: 'Catalog mismatch (§8): app exposes MUSIC as a first-class subject, but the source defines Music (الموسيقى) only as a component/sub-area of التربية الفنية. Standalone MUSIC has NO verified source denominator; it is application-split (APPLICATION_SPLIT) from the Art structure. Recorded, catalog NOT redesigned.',
    provenance: [provenance(37, '38', 'T04'), provenance(44, '45', 'T07')],
    futureAction: 'Do NOT fabricate a standalone source denominator for MUSIC. Expose Music via the التربية الفنية native hierarchy; standalone MUSIC denominator cells remain UNKNOWN.',
  },
  {
    applicationSubject: 'CIVIC_EDUCATION', applicationSubjectNameAr: 'التربية المدنية',
    sourceSubject: 'SRC_SOCIAL_STUDIES', sourceSubjectNameAr: 'الاجتماعيات',
    mappingRelationship: 'GROUPED_UNDER', mappingStatus: 'PARTIAL',
    sourceStructuralForm: 'GROUPED_SUBJECT_AREA',
    sourceComponents: ['social-history-geo', 'social-civics', 'social-not-applicable'],
    gradeScope: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], denominatorState: 'NOT_APPLICABLE',
    mismatch: 'P1-P3 NOT_APPLICABLE (no social studies). P4-P6 structure exists as ت.ج (تاريخ وجغرافيا) + ت.م (تربية مدنية) but does NOT map safely to a standalone CIVIC component denominator matching the prior candidate model. Do NOT upgrade P4-P6 merely because the subject exists (§10).',
    provenance: [provenance(42, '43', 'T05'), provenance(43, '44', 'T06'), provenance(37, '38', 'T04')],
    futureAction: 'Represent source grouping (ت.ج + ت.م) without forcing into the old candidate taxonomy; no fake standalone Civic/HG denominator. P1-P3 stay NOT_APPLICABLE; P4-P6 stay PARTIAL.',
  },
];

// ============================================================
// BIDIRECTIONAL LOOKUPS (§20) — app→source and source→app
// ============================================================

export function sourceStructuresForApplicationSubject(applicationSubject: ApplicationSubjectCode): readonly SourceApplicationMapping[] {
  return APPLICATION_MAPPING_MATRIX.filter((m) => m.applicationSubject === applicationSubject);
}

export function applicationSubjectsForSourceSubject(sourceSubject: SourceNativeSubjectCode): readonly ApplicationSubjectCode[] {
  return APPLICATION_MAPPING_MATRIX.filter((m) => m.sourceSubject === sourceSubject).map((m) => m.applicationSubject);
}

export function everyMappingIsNonTrivial(): boolean {
  return APPLICATION_MAPPING_MATRIX.every(
    (m) => m.mappingRelationship !== undefined && Object.keys(m).length >= 10,
  );
}

// ============================================================
// FUTURE EXTRACTION CONTRACT (§28/§29/§30)
// ============================================================
// The next extraction stage MUST attach content first to the source-native
// structural identity; application-catalog mapping is secondary.

export const FUTURE_EXTRACTION_CONTRACT: FutureExtractionContractRules = {
  attachContentToSourceNativeIdentityFirst: true,
  applicationMappingIsSecondary: true,
  neverFlattenSourceHierarchyDuringExtraction: true,
  noSourceElementDuplicationAcrossApplicationViews: true,
  ruleDescription:
    'Future content extraction MUST attach each element to its SOURCE-NATIVE structural element id first (e.g. التربية الفنية → الموسيقية under the Art sub-area). Only afterward may the application mapping expose it through ART and/or MUSIC per the mapping rules. Source hierarchy is never flattened; a source element mapped to multiple application views retains ONE source-native identity, so its truth is never duplicated into separate fake records.',
};

// ============================================================
// STRUCTURAL MISMATCH ISSUES (§25)
// ============================================================
// Records the new explicit modeling issue; does NOT reopen GAP-001..004.

export const RECONCILIATION_MISMATCH_ISSUES: readonly StructuralMismatchIssue[] = [
  {
    issueType: 'SOURCE_APPLICATION_STRUCTURE_MISMATCH',
    subject: 'MUSIC',
    description:
      'Application catalog exposes MUSIC as a first-class subject code while the primary source defines music only as a component/sub-area of التربية الفنية. Standalone MUSIC denominator cells remain UNKNOWN (6). Recorded; catalog not redesigned.',
    resolutionConstraint:
      'Do NOT fabricate a standalone source program for MUSIC. Keep application MUSIC mapping as COMPONENT_OF / APPLICATION_SPLIT relative to source SRC_ART. Do NOT reinterpret UNKNOWN as NOT_APPLICABLE.',
  },
  {
    issueType: 'SOURCE_APPLICATION_STRUCTURE_MISMATCH',
    subject: 'CIVIC_EDUCATION',
    description:
      'The previous standalone Civic candidate model (history/geography/citizenship compartments) does not match the source grouping (ت.ج history+geography, ت.م civics, social studies from year 4). P1-P3 NOT_APPLICABLE; P4-P6 PARTIAL.',
    resolutionConstraint:
      'Represent ت.ج and ت.م as GROUPED_SUBJECT_AREA without forcing them into the old candidate taxonomy; do not create fake standalone denominators.',
  },
  {
    issueType: 'FUTURE_PERSISTENCE_REQUIREMENT',
    subject: 'GENERAL',
    description:
      'A persistent reconciliation/subject-vs-source mapping structure will eventually be needed to store source-native identity alongside application codes. NOT implemented in this gate.',
    resolutionConstraint:
      'Future persistence changes (migration/schema) are documented-only FUTURE_PERSISTENCE_REQUIREMENT; implement later, not in Gate 07C.6.4.',
  },
];

// ============================================================
// CONTENT / PUBLICATION SAFETY (§24)
// ============================================================

export const RECONCILIATION_CONTENT_STATUS = {
  verified: 0,
  published: 0,
  structureCompleteVerified: 0,
  mastery: 'NOT_DERIVED' as const,
  accuracyDiffersFromMastery: true,
  units: 0,
  lessons: 0,
  knowledgeObjects: 0,
  exercises: 0,
};

// ============================================================
// GATE 07C.6.4 VERDICT
// ============================================================

const RECON_MAPPINGS = APPLICATION_MAPPING_MATRIX as readonly SourceApplicationMapping[];

export const CANONICAL_RECONCILIATION_VERDICT: CanonicalReconciliationVerdict = {
  gate: '07C.6.4',
  sourceSubjects: SOURCE_NATIVE_STRUCTURE_REGISTRY.length, // 8
  applicationSubjects: RECON_MAPPINGS.length,              // 9
  directlyReconciled: RECON_MAPPINGS.filter((m) => m.mappingStatus === 'VERIFIED_DIRECT' || m.mappingStatus === 'VERIFIED_SEMANTIC').length,
  partialOrMismatch: RECON_MAPPINGS.filter((m) => m.mappingStatus === 'PARTIAL' || m.mappingStatus === 'MISMATCH').length,
  noDirectMatch: RECON_MAPPINGS.filter((m) => m.mappingRelationship === 'NO_DIRECT_MATCH' || m.mappingRelationship === 'NOT_APPLICABLE').length,
  verifiedCells: 42,
  supportedCells: 0,
  partialCells: 3,
  unknownCells: 6,
  notApplicableCells: 3,
  totalCells: 54,
  contentVerified: 0,
  published: 0,
  structureCompleteVerified: 0,
  masteryDerived: false,
  noRuntimeBehaviorChange: true,
  noDatabaseChange: true,
  sourceNativeFirst: true,
  recommendation: 'PASS',
};

export const RECONCILIATION_ISSUE_TYPES = RECONCILIATION_MISMATCH_ISSUES.map((i) => i.issueType);
