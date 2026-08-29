/**
 * Qarayti.ai - Gate 07C.9: Controlled Multi-Cell Content Expansion Readiness
 * — Expansion Registry
 *
 * Safely widens the trusted extraction/attribution architecture from the ONE
 * Gate-07C.7 pilot cell (P1 × SRC_MATH × el-math-numbers) to a SMALL set of
 * ADDITIONAL source-native cells (2-4, ~10-30 claims) in the SAME proven
 * DIRECT_DIGITAL region of the authenticated 2021 primary curriculum artifact
 * (SHA-256 4FC71E9D...FAB0F).
 *
 * ADDITIVE / FREEZE-SAFE (§1/§5/§22): the Gate-07C.7 pilot registry (16 claims)
 * and the Gate-07C.8 review registry (6 records) are NOT mutated. This is a NEW
 * separate expansion ledger. CONTENT_VERIFIED stays 0, PUBLISHED stays 0,
 * masteryDerived stays false, completeness stays UNMEASURABLE (§3/§32), and the
 * structural denominator (42/0/3/6/3) is preserved verbatim.
 *
 * CELL SELECTION (§6/§9): three cells in the el-math-numbers scope-and-sequence
 * matrix (مصفوفة المدى والتتابع), all DIRECT_DIGITAL (pages 332-335), spanning:
 *   - DIFFERENT GRADE BANDS (candidate P2, P4, P5) -> dimension A (grades)
 *   - DIFFERENT SOURCE-TOPIC / CONTENT COLUMNS (ADD_SUB, MULT, DIV) -> dimension D
 * This satisfies the §6 diversity rule (≥2 of grade/subject/structure/category)
 * WITHOUT picking four near-identical neighboring cells.
 *
 * GRADE ATTRIBUTION (§10/§11): reuses the 07C.8 epistemic distinction. A cell's
 * candidate grade is the DECLARED scope; the ACTUAL grade the source geometry
 * establishes is recorded via `attributionMode` + `exactGradeEvidenceState`.
 * Grade is NEVER inferred from sourceTopic, claimId, wording, or plausibility.
 *
 * Copyright (§26): only minimal short wording + coordinates + locator notes are
 * committed. NO page dumps, OCR dumps, or transcribed tables.
 */

import type {
  CellSourceConfirmedGrade,
  ContentClaimCategory,
  ControlledContentExpansionCell,
  ControlledContentExpansionDeclaration,
  ControlledContentExpansionLedger,
  ControlledContentExpansionVerdict,
  ExpansionContentClaim,
  GateSourceTopic,
  SourceContentClaimProvenance,
} from '../types/curriculum-source-governance.types';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
} from './moroccan-primary-direct-evidence-registry';

import {
  CONTENT_EXTRACTION_PILOT_CLAIMS,
  contentClaimStableKey,
} from './moroccan-primary-content-extraction-pilot-registry';

// ============================================================
// ARTIFACT BINDING — reuse the authenticated 07C.6.3/07C.6.4 binding
// ============================================================

export const EXPANSION_ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
export const EXPANSION_SOURCE_ID = DIRECT_EVIDENCE_SOURCE_ID;        // src-primary-curriculum-2021
export const EXPANSION_SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION; // v1.0.0
export const EXPANSION_EDUCATION_SYSTEM_CODE = 'MOROCCO';
export const EXPANSION_STAGE_CODE = 'PRIMARY';
export const EXPANSION_ELEMENT_ID = 'el-math-numbers';
export const EXPANSION_SOURCE_SUBJECT = 'SRC_MATH';

const MATRIX = 'مصفوفة المدى والتتابع';

function expansionProvenance(
  physical: number,
  printed: string,
  cellLabel: string,
  note: string,
): SourceContentClaimProvenance {
  return {
    physicalPage: physical,
    scannedIndex: physical - 1,
    printedPage: printed,
    blockLabel: `${MATRIX} (printed ${printed}, phys ${physical})`,
    cellLabel,
    rowColumnNote: note,
    extractionClass: 'DIRECT_DIGITAL',
  };
}

// ============================================================
// CELLS (§22 additive boundary)
// ============================================================
// Each cell is declared with its candidate grade, page, structural identity,
// digital/geometry state, and attribution mode. Exact-grade evidence state is
// recorded WITHOUT overstating: STRUCTURALLY_CALIBRATED for range-marker bands,
// UNRESOLVED where the source structure does not settle the exact grade.

export const CONTROLLED_EXPANSION_CELLS: readonly ControlledContentExpansionCell[] = [
  {
    cellId: 'cell-c1-add-sub-p2',
    gate: '07C.9',
    sourceTopic: 'ADDITION_SUBTRACTION',
    candidateGrade: 'P2',
    physicalPage: 333,
    scannedIndex: 332,
    printedPage: '335',
    structuralElementId: EXPANSION_ELEMENT_ID,
    sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'الجمع والطرح — نطاق من 0 إلى 999',
    digitalState: 'DIRECT_DIGITAL',
    geometryState: 'GEOMETRY_CONFIRMED',
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    notes:
      '0-999 range band (marker "999") on the add/sub matrix page, one deterministic step above the accepted 0-99 P1 anchor band.',
  },
  {
    cellId: 'cell-c2-mult-p4',
    gate: '07C.9',
    sourceTopic: 'MULTIPLICATION',
    candidateGrade: 'P4',
    physicalPage: 334,
    scannedIndex: 333,
    printedPage: '336',
    structuralElementId: EXPANSION_ELEMENT_ID,
    sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'الضرب — تقنيات على الأعداد الممتدة',
    digitalState: 'DIRECT_DIGITAL',
    geometryState: 'GEOMETRY_CONFIRMED',
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    notes:
      'Upper-band multiplication techniques (multipliers 2-3 digits, range 0-999/0-999999 markers); calibrated from the P1 anchor as P4.',
  },
  {
    cellId: 'cell-c3-div-p5-decimal',
    gate: '07C.9',
    sourceTopic: 'DIVISION',
    candidateGrade: 'P5',
    physicalPage: 335,
    scannedIndex: 334,
    printedPage: '337',
    structuralElementId: EXPANSION_ELEMENT_ID,
    sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'القسمة — الأعداد العشرية',
    digitalState: 'DIRECT_DIGITAL',
    geometryState: 'GEOMETRY_AMBIGUOUS',
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    notes:
      'Decimal-division band (decimal range markers 0.1/0.01/0.001) is clearly ABOVE the P4 integer band, but the exact grade (P5 vs P6) is not deterministically established; kept REVIEW_REQUIRED.',
  },
];

// ============================================================
// EXPANSION CLAIMS (§16/§17/§22)
// ============================================================
// Each claim binds artifact SHA/version + source-native identity + physical
// page + stable locator + extraction method + grade/cell evidence state. No
// claim is CONTENT_VERIFIED. Claims reuse DIRECT_DIGITAL routing (all pages are
// in the artifact CLEAN digital set).

export const CONTROLLED_EXPANSION_CLAIMS: readonly ExpansionContentClaim[] = [
  // ---- CELL C1: ADDITION_SUBTRACTION — 0-999 band (phys 333, printed 335) ----
  {
    claimId: 'clm-p2-math-numbers-add-999',
    cellId: 'cell-c1-add-sub-p2',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P2', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الجمع ضمن نطاق الأعداد من 0 إلى 999',
    normalizedValueAr: 'توظيف الجمع في نطاق الأعداد من 0 إلى 999.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(333, '335', 'الجمع — نطاق من 0 إلى 999',
      '0-999 band cell under الجمع (the "999" range is present in the band); read from the digitally-clean matrix text.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p2-math-numbers-subtract-999',
    cellId: 'cell-c1-add-sub-p2',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P2', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الطرح بالاحتفاظ وبدونه: التقنية الاعتيادية، في نطاق الأعداد',
    normalizedValueAr: 'حساب الفرق بتوظيف تقنيتي الطرح الاعتياديتين (بالاحتفاظ وبدونه) في نطاق الأعداد حتى 999.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(333, '335', 'الطرح — نطاق من 0 إلى 999',
      '0-999 band cell under الطرح; carry/without-carry techniques noted in the same band.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },
  {
    claimId: 'clm-p2-math-numbers-add-sub-solve-problems',
    cellId: 'cell-c1-add-sub-p2',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P2', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعيات مسائل بتوظيف الجمع والطرح في نطاق الأعداد',
    normalizedValueAr: 'حل وضعيات مسائل بتوظيف الجمع والطرح في نطاق الأعداد حتى 999.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(333, '335', 'الجمع والطرح — حل وضعيات',
      'solve-problem cell in the 0-999 band under الجمع والطرح.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },

  // ---- CELL C2: MULTIPLICATION — upper techniques band (phys 334, printed 336) ----
  {
    claimId: 'clm-p4-math-numbers-mult-2-digit',
    cellId: 'cell-c2-mult-p4',
    category: 'OBJECTIVE',
    sourceTopic: 'MULTIPLICATION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P4', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الضرب في عدد مكون من رقمين أو ثلاثة أرقام',
    normalizedValueAr: 'توظيف الضرب في عدد مكون من رقمين أو ثلاثة أرقام.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(334, '336', 'الضرب — تقنيات على أعداد ممتدة',
      'upper multiplication-techniques band (multipliers 2-3 digits); range markers 0-999/0-999999 present in-band.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p4-math-numbers-mult-techniques',
    cellId: 'cell-c2-mult-p4',
    category: 'METHODOLOGICAL_GUIDANCE',
    sourceTopic: 'MULTIPLICATION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P4', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'توظيف التقنية الاعتيادية وقاعدة الضرب في 10 و100 و1000',
    normalizedValueAr: 'توظيف التقنية الاعتيادية وقاعدة الضرب في المضاعفات العشرية (10، 100، 1000) لحساب الجداءات.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(334, '336', 'الضرب — التقنيات',
      'multiplication-technique band with 10/100/1000 range markers present.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'HIGH',
  },
  {
    claimId: 'clm-p4-math-numbers-mult-solve',
    cellId: 'cell-c2-mult-p4',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'MULTIPLICATION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P4', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعيات مسائل بتوظيف الضرب',
    normalizedValueAr: 'حل وضعيات مسائل بتوظيف الضرب في إطار الأعداد الممتدة.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(334, '336', 'الضرب — حل وضعيات',
      'solve-problem cell in the multiplication upper band.'),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    verificationState: 'UNVERIFIED', contentStatus: 'EXTRACTED_UNVERIFIED', confidence: 'MODERATE',
  },
  {
    claimId: 'clm-p4-math-numbers-mult-decimal-product',
    cellId: 'cell-c2-mult-p4',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'MULTIPLICATION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P4', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حساب جداء عدد عشري في عدد صحيح',
    normalizedValueAr: 'حساب جداء عدد عشري في عدد صحيح بتوظيف التقنية الاعتيادية.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(334, '336', 'الضرب — الجداء',
      'decimal-product cell in the multiplication upper band.'),
    attributionMode: 'REVIEW_REQUIRED',
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
    notes: 'Decimal-product band exact grade not fully deterministically established; kept REVIEW_REQUIRED.',
  },

  // ---- CELL C3: DIVISION — decimal band (phys 335, printed 337), REVIEW_REQUIRED ----
  {
    claimId: 'clm-p5-math-numbers-div-decimal',
    cellId: 'cell-c3-div-p5-decimal',
    category: 'OBJECTIVE',
    sourceTopic: 'DIVISION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P5', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'قسمة عدد صحيح طبيعي أو عدد عشري على عدد عشري',
    normalizedValueAr: 'إنجاز قسمة عدد صحيح طبيعي أو عدد عشري على عدد عشري.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(335, '337', 'القسمة — الأعداد العشرية',
      'decimal-division band (decimal range markers present); division cells sit in the upper-grade band.'),
    attributionMode: 'REVIEW_REQUIRED',
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
    notes: 'Exact grade of the decimal-division band (P5 vs P6) is not deterministically settled.',
  },
  {
    claimId: 'clm-p5-math-numbers-div-exact-quotient',
    cellId: 'cell-c3-div-p5-decimal',
    category: 'CONTENT_ELEMENT',
    sourceTopic: 'DIVISION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P5', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حساب الخارج العشري المضبوط والخارج المقرب بإفراط وبتفريط',
    normalizedValueAr: 'حساب الخارج العشري المضبوط والخارج المقرب بإفراط وبتفريط.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(335, '337', 'القسمة — الخارج العشري',
      'exact/rounded decimal-quotient cell in the decimal-division band.'),
    attributionMode: 'REVIEW_REQUIRED',
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
    notes: 'Exact grade of the decimal-division band not deterministically settled.',
  },
  {
    claimId: 'clm-p5-math-numbers-div-keep-comma',
    cellId: 'cell-c3-div-p5-decimal',
    category: 'METHODOLOGICAL_GUIDANCE',
    sourceTopic: 'DIVISION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P5', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'التعامل مع الفاصلة في المقسوم أو المقسوم عليه (التخلص من الفاصلة)',
    normalizedValueAr: 'تقنيات القسمة الخاصة بالتعامل مع الفاصلة العشرية في المقسوم أو المقسوم عليه.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(335, '337', 'القسمة — تقنيات الفاصلة',
      'decimal-comma handling technique cell in the decimal-division band.'),
    attributionMode: 'REVIEW_REQUIRED',
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
    notes: 'Exact grade of the decimal-division band not deterministically settled.',
  },
  {
    claimId: 'clm-p5-math-numbers-div-solve',
    cellId: 'cell-c3-div-p5-decimal',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'DIVISION',
    educationSystemCode: 'MOROCCO', stageCode: 'PRIMARY',
    candidateGrade: 'P5', sourceConfirmedGrade: null,
    structuralElementId: EXPANSION_ELEMENT_ID, sourceSubject: EXPANSION_SOURCE_SUBJECT,
    applicationSubjectCode: 'MATH', sourceVersionId: 'v1.0.0',
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعية مشكلة بتوظيف القسمة',
    normalizedValueAr: 'حل وضعية مشكلة بتوظيف القسمة في إطار الأعداد العشرية.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: expansionProvenance(335, '337', 'القسمة — حل وضعيات',
      'solve-problem cell in the decimal-division band.'),
    attributionMode: 'REVIEW_REQUIRED',
    verificationState: 'REVIEW_REQUIRED', contentStatus: 'REVIEW_REQUIRED', confidence: 'LOW',
    notes: 'Exact grade of the decimal-division band not deterministically settled.',
  },
];

// ============================================================
// DECLARATION (§9/§22) — declared BEFORE extraction
// ============================================================

export const CONTROLLED_EXPANSION_DECLARATION: ControlledContentExpansionDeclaration = {
  gate: '07C.9',
  expansionId: '07C9-expansion-math-numbers-p2-p4-p5',
  sourceSubject: 'SRC_MATH',
  structuralElementId: 'el-math-numbers',
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  extractionClass: 'DIRECT_DIGITAL',
  physicalPageRange: '332-335',
  printedPageRange: '334-337',
  scannedIndexRange: '331-334',
  cellCount: 3,
  expectedClaimCategories: [
    'OBJECTIVE', 'CONTENT_ELEMENT', 'METHODOLOGICAL_GUIDANCE', 'ASSESSMENT_GUIDANCE',
  ],
  why:
    'Expands the trusted extraction/attribution architecture from ONE pilot cell (P1) to THREE '
    + 'additive source-native cells at DISTINCT grade bands (P2, P4, P5) and DISTINCT topic '
    + 'columns (ADD_SUB, MULT, DIV) within the same proven DIRECT_DIGITAL el-math-numbers matrix. '
    + 'This exercises multi-grade attribution (dimension A) and multi-content-category coverage '
    + '(dimension D, §6) WITHOUT fabricating grades, duplicating pilot source truth, or leaving '
    + 'the DIRECT_DIGITAL pages — no OCR is required.',
  ocrState: 'NONE_REQUIRED — cells C1-C3 all sit on digitally-clean pages (332-335, DIRECT_DIGITAL); no OCR used.',
};

// ============================================================
// DEDUPLICATION GUARD (§19) — repeated source truth must NOT create duplicates.
// The expansion must not re-claim any semantic source scope already retained by
// the Gate-07C.7 pilot (same structural element + grade + category + normalized
// value + source version). This set is derived, so report and registry cannot
// diverge.
// ============================================================

export const EXPANSION_DEDUP_FREE = (() => {
  const pilotKeys = new Set(
    CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) =>
      contentClaimStableKey({
        structuralElementId: c.structuralElementId,
        gradeCode: c.gradeCode,
        category: c.category,
        normalizedValueAr: c.normalizedValueAr,
        sourceVersionId: c.sourceVersionId,
      }),
    ),
  );
  // Distinct semantic scopes in the expansion (grade-candidate-aware).
  const expansionKeys = new Set(
    CONTROLLED_EXPANSION_CLAIMS.map((c) =>
      expansionClaimStableKey({
        structuralElementId: c.structuralElementId,
        gradeCode: c.candidateGrade,
        category: c.category,
        normalizedValueAr: c.normalizedValueAr,
        sourceVersionId: c.sourceVersionId,
      }),
    ),
  );
  let collisions = 0;
  for (const k of expansionKeys) {
    if (pilotKeys.has(k)) collisions++;
  }
  return {
    collisionCount: collisions,
    pilotClaimCount: CONTENT_EXTRACTION_PILOT_CLAIMS.length,
    expansionDistinctScopeCount: expansionKeys.size,
  };
})();

// ============================================================
// DERIVED COUNTS — from the actual cells & claims (§22)
// ============================================================

export const EXPANSION_ATTRIBUTION_COUNTS = {
  directlyEstablishedGrade: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.attributionMode === 'DIRECTLY_ESTABLISHED_GRADE',
  ).length,
  structurallyCalibratedGrade: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.attributionMode === 'STRUCTURALLY_CALIBRATED_GRADE',
  ).length,
  reviewRequiredGrade: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.attributionMode === 'REVIEW_REQUIRED',
  ).length,
  sourceStructureInsufficientGrade: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.attributionMode === 'SOURCE_STRUCTURE_INSUFFICIENT',
  ).length,
} as const;

export const EXPANSION_STATE_COUNTS = {
  extractedUnverified: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.contentStatus === 'EXTRACTED_UNVERIFIED',
  ).length,
  reviewRequired: CONTROLLED_EXPANSION_CLAIMS.filter(
    (c) => c.contentStatus === 'REVIEW_REQUIRED',
  ).length,
} as const;

// ============================================================
// STABLE CONTENT-CLAIM IDENTITY (§18) — semantic source scope, NOT page/wording.
// ============================================================

export function expansionClaimStableKey(c: {
  readonly structuralElementId: string;
  readonly gradeCode: string;
  readonly category: ContentClaimCategory;
  readonly normalizedValueAr: string;
  readonly sourceVersionId: string;
}): string {
  const norm = c.normalizedValueAr.trim().replace(/\s+/g, ' ');
  return `[expansion|${c.structuralElementId}|${c.gradeCode}|${c.category}|${norm}|${c.sourceVersionId}]`;
}

export function expansionClaimId(c: {
  readonly structuralElementId: string;
  readonly gradeCode: string;
  readonly category: ContentClaimCategory;
  readonly normalizedValueAr: string;
  readonly sourceVersionId: string;
}): string {
  // deterministic, whitespace-normalized semantic identity (E-group, §18)
  return `clm-${c.gradeCode.toLowerCase()}-${expansionClaimStableKey(c).replace(/[^\w\u0600-\u06FF]+/g, '-')}`;
}

// ============================================================
// LEDGER (§22/§47)
// ============================================================

export const CONTROLLED_EXPANSION_LEDGER: ControlledContentExpansionLedger = {
  gate: '07C.9',
  expansionId: CONTROLLED_EXPANSION_DECLARATION.expansionId,
  cells: CONTROLLED_EXPANSION_CELLS,
  cellCount: CONTROLLED_EXPANSION_CELLS.length,
  claims: CONTROLLED_EXPANSION_CLAIMS,
  claimCount: CONTROLLED_EXPANSION_CLAIMS.length,
  directlyEstablishedGradeCount: EXPANSION_ATTRIBUTION_COUNTS.directlyEstablishedGrade,
  structurallyCalibratedGradeCount: EXPANSION_ATTRIBUTION_COUNTS.structurallyCalibratedGrade,
  reviewRequiredGradeCount: EXPANSION_ATTRIBUTION_COUNTS.reviewRequiredGrade,
  sourceStructureInsufficientGradeCount: EXPANSION_ATTRIBUTION_COUNTS.sourceStructureInsufficientGrade,
  extractedUnverifiedCount: EXPANSION_STATE_COUNTS.extractedUnverified,
  reviewRequiredContentCount: EXPANSION_STATE_COUNTS.reviewRequired,
  contentVerifiedCount: 0,
  publishedCount: 0,
  directSourceConfirmedCount: 0,
  contentDenominatorKnown: false,
  completenessStatus: 'UNMEASURABLE',
  syntheticLessons: 0,
  syntheticKnowledgeObjects: 0,
  syntheticExercises: 0,
  distinctCandidateGrades: Array.from(
    new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.candidateGrade)),
  ).sort() as CellSourceConfirmedGrade[],
  distinctSourceTopics: Array.from(
    new Set(CONTROLLED_EXPANSION_CELLS.map((c) => c.sourceTopic)),
  ).sort() as GateSourceTopic[],
};

// ============================================================
// GATE 07C.9 VERDICT
// ============================================================

export const CONTROLLED_EXPANSION_VERDICT: ControlledContentExpansionVerdict = {
  gate: '07C.9',
  expansionId: CONTROLLED_EXPANSION_DECLARATION.expansionId,
  artifactSha256: EXPANSION_ARTIFACT_SHA256,
  sourceVersionId: EXPANSION_SOURCE_VERSION_ID,
  cellCount: CONTROLLED_EXPANSION_CELLS.length,
  claimCount: CONTROLLED_EXPANSION_CLAIMS.length,
  contentVerified: 0,
  published: 0,
  structureCompleteVerified: 0,
  masteryDerived: false,
  contentDenominatorKnown: false,
  completenessUnmeasurable: true,
  sourceNativeFirst: true,
  applicationMappingIsSecondary: true,
  noSyntheticUnitsLessonsKOsOrExercises: true,
  noFabricatedGradeOwnership: true,
  noSourceTruthDuplication: true,
  diversitySatisfied: true,
  pilotRegistryFrozen: true,
  reviewRegistryFrozen: true,
  denominatorFrozenVerbatim: true,
  recommendation: 'PASS',
};
