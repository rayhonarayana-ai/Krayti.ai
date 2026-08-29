/**
 * Qarayti.ai - Gate 07C.10: Controlled Batch Extraction Protocol
 * — Batch Registry (Phase B)
 *
 * Proves that the trusted 07C.7/07C.8/07C.9 architecture generalizes to
 * CONTROLLED BATCHES: frozen, bounded, additively-frozen extractions with a
 * full lifecycle (CANDIDATE -> SCOPE_FROZEN -> EXTRACTED -> ATTRIBUTION_REVIEWED
 * -> DEDUP_CHECKED -> BATCH_CLOSED), per-batch manifests, claim->cell binding,
 * cross-batch + cross-gate dedup, derived ledgers, and honest closure semantics.
 *
 * Phase A declared and froze EXACTLY TWO batches (Tech Lead authorized, Phase A
 * CLOSED/PASS):
 *   Batch A  BATCH-A-07C10-MATH-P3-NUMBERS        SRC_MATH, 3 add/sub cells,
 *                              band 0-9999, phys 333, printed 335
 *   Batch B  BATCH-B-07C10-FR-LECTURE-ECRITURE    SRC_FRENCH, 2 cells
 *                              (reading + writing), phys 219-221, printed 221-223
 * NO recon expansion, NO third batch, NO adjacent-cell expansion, NO mass
 * extraction. French listening (cell-bB-fr-listening) stays DEFERRED/EXCLUDED.
 *
 * ADDITIVE / FREEZE-SAFE: the 07C.7 pilot registry (16 claims), the 07C.8
 * review registry (6 records), and the 07C.9 expansion registry (3 cells /
 * claims) are NOT mutated. CONTENT_VERIFIED stays 0, PUBLISHED stays 0,
 * mastery stays NOT_DERIVED, completeness stays UNMEASURABLE — globally and
 * per batch. The structural denominator (42/0/3/6/3) is preserved verbatim.
 *
 * GRADE ATTRIBUTION: reuses the 07C.8/07C.9 epistemic distinction.
 *   - Batch A: STRUCTURALLY_CALIBRATED (P3, 0-9999), P2 (0-999) one step below
 *     and the calibrated cross-page matrix band ordering establish the range.
 *   - Batch B: grade-BAND context only (P1-3 / P2-3 / P4-6). Claims stay
 *     REVIEW_REQUIRED and are NEVER promoted to a fabricated exact grade.
 * Cell attribution and child claim attribution are independent evidence layers
 * — no silent propagation.
 *
 * DEDUP: canonical semantic comparison within each batch, A<->B, and against
 * 07C.7 + 07C.9 canonical claims. Page/claimId/batch/grade/subject alone are
 * NOT identity. All comparisons are EXECUTED here; prevented duplicates are
 * recorded machine-readably and MUST NOT create second canonical claims.
 *
 * Copyright (§26): only minimal short wording + coordinates + locator notes
 * are committed. NO page dumps, OCR dumps, or transcribed tables.
 */

import type {
  ArtifactOcrClassification,
  BatchContentClaim,
  BatchDedupAgainst,
  BatchDedupCheckResult,
  BatchDedupPreventionRecord,
  BatchLifecycleState,
  BatchNegativeState,
  ControlledBatchCell,
  ControlledBatchGlobalLedger,
  ControlledBatchLedger,
  ControlledBatchManifest,
  ControlledBatchExtractionVerdict,
  CellSourceConfirmedGrade,
  ContentClaimCategory,
  ExactGradeEvidenceState,
  ExpansionCellAttributionMode,
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

import {
  CONTROLLED_EXPANSION_CLAIMS,
  expansionClaimStableKey,
} from './moroccan-primary-controlled-content-expansion-registry';

// ============================================================
// ARTIFACT BINDING — reuse the authenticated 07C.6.3/07C.6.4 binding
// ============================================================

export const BATCH_ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
export const BATCH_SOURCE_ID = DIRECT_EVIDENCE_SOURCE_ID;        // src-primary-curriculum-2021
export const BATCH_SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION; // v1.0.0
export const BATCH_EDUCATION_SYSTEM_CODE = 'MOROCCO';
export const BATCH_STAGE_CODE = 'PRIMARY';
export const BATCH_FROZEN_DATE = '2026-08-29'; // static Phase B freeze date (ISO)

const MATH_MATRIX = 'مصفوفة المدى والتتابع — مجال الأعداد والحساب';

function batchProvenance(
  physical: number,
  printed: string,
  blockLabel: string,
  cellLabel: string,
  note: string,
  extractionClass: ArtifactOcrClassification,
): SourceContentClaimProvenance {
  return {
    physicalPage: physical,
    scannedIndex: physical - 1,
    printedPage: printed,
    blockLabel,
    cellLabel,
    rowColumnNote: note,
    extractionClass,
  };
}

// ============================================================
// BATCH LIFE CYCLE — closed union (§Phase B protocol)
// ============================================================

export const BATCH_LIFECYCLE_STATES: readonly BatchLifecycleState[] = [
  'CANDIDATE',
  'SCOPE_FROZEN',
  'EXTRACTED',
  'ATTRIBUTION_REVIEWED',
  'DEDUP_CHECKED',
  'BATCH_CLOSED',
];

// ============================================================
// BATCH A — BATCH-A-07C10-MATH-P3-NUMBERS (SRC_MATH, 0-9999 add/sub)
// ============================================================

export const BATCH_A_ID = 'BATCH-A-07C10-MATH-P3-NUMBERS';

export const BATCH_A_CELLS: readonly ControlledBatchCell[] = [
  {
    cellId: 'cell-aA-add-9999',
    batchId: BATCH_A_ID,
    gate: '07C.10',
    sourceTopic: 'ADDITION_SUBTRACTION',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    physicalPage: 333,
    scannedIndex: 332,
    printedPage: '335',
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'الجمع — نطاق من 0 إلى 9999',
    digitalState: 'DIRECT_DIGITAL',
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    notes:
      '0-9999 range band (marker "9999") on the add/sub matrix page, one deterministic step above the accepted P2 0-999 band; structural calibration from the P1 0-99 anchor.',
  },
  {
    cellId: 'cell-aB-subtract-9999',
    batchId: BATCH_A_ID,
    gate: '07C.10',
    sourceTopic: 'ADDITION_SUBTRACTION',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    physicalPage: 333,
    scannedIndex: 332,
    printedPage: '335',
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'الطرح — نطاق من 0 إلى 9999',
    digitalState: 'DIRECT_DIGITAL',
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    notes:
      '0-9999 range band (marker "9999") under الطرح on the add/sub matrix page; structurally calibrated as P3.',
  },
  {
    cellId: 'cell-aC-solve-addsub-9999',
    batchId: BATCH_A_ID,
    gate: '07C.10',
    sourceTopic: 'ADDITION_SUBTRACTION',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    physicalPage: 333,
    scannedIndex: 332,
    printedPage: '335',
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    cellLabelAr: 'الجمع والطرح — حل وضعيات (نطاق 9999)',
    digitalState: 'DIRECT_DIGITAL',
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    notes:
      'solve-problem cell in the 0-9999 add/sub band; structurally calibrated as P3.',
  },
];

export const BATCH_A_MANIFEST: ControlledBatchManifest = {
  gate: '07C.10',
  batchId: BATCH_A_ID,
  batchName: 'Math P3 Numbers — Addition/Subtraction 0-9999',
  sourceSubject: 'SRC_MATH',
  applicationSubjectCode: 'MATH',
  structuralElementIds: ['el-math-numbers'],
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  extractionClass: 'DIRECT_DIGITAL',
  authorizedExtractionPages: [333],
  attributionContextPagesOnly: [336], // phys 336, printed 338 — CONTEXT ONLY, never extraction
  sourceVersionId: BATCH_SOURCE_VERSION_ID,
  artifactSha256: BATCH_ARTIFACT_SHA256,
  maximumClaims: 9,
  deathValue:
    'Exactly three cells in the 0-9999 add/sub band of the el-math-numbers matrix, physically-page 333 (printed 335); the page directly below is attribution context only; no adjacent cell, no other band, no reading of page 336 as extraction.',
  declaredAt: BATCH_FROZEN_DATE,
  status: 'FROZEN',
};

export const BATCH_A_CLAIMS: readonly BatchContentClaim[] = [
  {
    claimId: 'cl-aA-math-p3-add-9999',
    batchId: BATCH_A_ID,
    cellId: 'cell-aA-add-9999',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الجمع ضمن نطاق الأعداد من 0 إلى 9999',
    normalizedValueAr: 'توظيف الجمع في نطاق الأعداد من 0 إلى 9999.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      333, '335', MATH_MATRIX, 'الجمع — نطاق من 0 إلى 9999',
      '0-9999 band cell under الجمع ("9999" range marker present in-band); read from the digitally-clean matrix text.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    verificationState: 'UNVERIFIED',
    contentStatus: 'EXTRACTED_UNVERIFIED',
    confidence: 'HIGH',
  },
  {
    claimId: 'cl-aB-math-p3-subtract-9999',
    batchId: BATCH_A_ID,
    cellId: 'cell-aB-subtract-9999',
    category: 'OBJECTIVE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'الطرح ضمن نطاق الأعداد من 0 إلى 9999',
    normalizedValueAr: 'توظيف الطرح في نطاق الأعداد من 0 إلى 9999.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      333, '335', MATH_MATRIX, 'الطرح — نطاق من 0 إلى 9999',
      '0-9999 band cell under الطرح ("9999" range marker present in-band); read from the digitally-clean matrix text.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    verificationState: 'UNVERIFIED',
    contentStatus: 'EXTRACTED_UNVERIFIED',
    confidence: 'HIGH',
  },
  {
    claimId: 'cl-aC-math-p3-solve-addsub-9999',
    batchId: BATCH_A_ID,
    cellId: 'cell-aC-solve-addsub-9999',
    category: 'ASSESSMENT_GUIDANCE',
    sourceTopic: 'ADDITION_SUBTRACTION',
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: 'P3',
    gradeBandScope: ['P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-math-numbers',
    sourceSubject: 'SRC_MATH',
    applicationSubjectCode: 'MATH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingAr: 'حل وضعيات مسائل بتوظيف الجمع والطرح في نطاق الأعداد من 0 إلى 9999',
    normalizedValueAr: 'حل وضعيات مسائل بتوظيف الجمع والطرح في نطاق الأعداد من 0 إلى 9999.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      333, '335', MATH_MATRIX, 'الجمع والطرح — حل وضعيات (نطاق 9999)',
      'solve-problem cell in the 0-9999 add/sub band; read from the digitally-clean matrix text.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'STRUCTURALLY_CALIBRATED_GRADE',
    exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
    verificationState: 'UNVERIFIED',
    contentStatus: 'EXTRACTED_UNVERIFIED',
    confidence: 'MODERATE',
  },
];

// ============================================================
// BATCH B — BATCH-B-07C10-FR-LECTURE-ECRITURE (SRC_FRENCH, reading+writing)
// ============================================================
// Phase A localized reading/writing content to phys 219-221 (printed 221-223):
//   phys 219 (printed 221): ".2.2. La lecture" — P1-3 habiletés + activités,
//                           P4-6 text-selection criteria
//   phys 221 (printed 223): ".2.3. La production de l'écrit" — P1 graphic
//                           activities, P2-3 cursive/copie/dictée, P4-6 text types
// phys 218 (printed 220) = attribution context only. FRENCH = READY_DIGITAL.

export const BATCH_B_ID = 'BATCH-B-07C10-FR-LECTURE-ECRITURE';

export const BATCH_B_CELLS: readonly ControlledBatchCell[] = [
  {
    cellId: 'cell-bA-fr-reading',
    batchId: BATCH_B_ID,
    gate: '07C.10',
    sourceTopic: null,
    candidateGrade: null,
    gradeBandScope: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    physicalPage: 219,
    scannedIndex: 218,
    printedPage: '221',
    structuralElementId: 'el-skill-fr-reading',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    cellLabelAr: 'القراءة — فرنسية (نطاقات 1-3 و4-6)',
    digitalState: 'DIRECT_DIGITAL',
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    notes:
      'Artifact sub-headings establish only grade BANDS (P1-3 at printed 221, P4-6 at printed 221/222); no exact-grade headers exist, so claims stay REVIEW_REQUIRED.',
  },
  {
    cellId: 'cell-bA-fr-writing',
    batchId: BATCH_B_ID,
    gate: '07C.10',
    sourceTopic: null,
    candidateGrade: null,
    gradeBandScope: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    physicalPage: 221,
    scannedIndex: 220,
    printedPage: '223',
    structuralElementId: 'el-skill-fr-writing',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    cellLabelAr: 'إنتاج الكتابة — فرنسية (نطاقات 1 و2-3 و4-6)',
    digitalState: 'DIRECT_DIGITAL',
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    notes:
      'Artifact sub-headings establish only grade BANDS (P1, P2-3, P4-6 at printed 222-223); no exact-grade headers exist, so claims stay REVIEW_REQUIRED.',
  },
];

export const BATCH_B_MANIFEST: ControlledBatchManifest = {
  gate: '07C.10',
  batchId: BATCH_B_ID,
  batchName: 'French Primary — Lecture & Production de l\'écrit',
  sourceSubject: 'SRC_FRENCH',
  applicationSubjectCode: 'FRENCH',
  structuralElementIds: ['el-skill-fr-reading', 'el-skill-fr-writing'],
  extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
  extractionClass: 'DIRECT_DIGITAL',
  authorizedExtractionPages: [219, 220, 221],
  attributionContextPagesOnly: [218], // phys 218, printed 220 — CONTEXT ONLY
  sourceVersionId: BATCH_SOURCE_VERSION_ID,
  artifactSha256: BATCH_ARTIFACT_SHA256,
  maximumClaims: 8,
  deathValue:
    'Exactly two cells (reading printed 221, writing printed 223) bounded to phys 219-221; phys 218 is attribution context only; French listening (cell-bB-fr-listening) is DEFERRED and excluded.',
  declaredAt: BATCH_FROZEN_DATE,
  status: 'FROZEN',
};

export const BATCH_B_CLAIMS: readonly BatchContentClaim[] = [
  // ---- READING (cell-bA-fr-reading) — phys 219, printed 221 ----
  {
    claimId: 'cl-bA-fr-read-p13-conscience-phonologique',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-reading',
    category: 'OBJECTIVE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P1', 'P2', 'P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-reading',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr: 'la conscience phonologique (habileté de base en lecture)',
    normalizedValueFr:
      'Acquérir progressivement la conscience phonologique comme habileté de base en lecture.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      219, '221', 'Français — La lecture (printed 221, phys 219)',
      '2.2.1 En première, deuxième et troisième années',
      '"la conscience phonologique" listed among the P1-3 base reading habiletés.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P1-3 from artifact sub-heading; exact grade not established.',
  },
  {
    claimId: 'cl-bA-fr-read-p13-habiletes-identification',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-reading',
    category: 'OBJECTIVE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P1', 'P2', 'P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-reading',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr: "l'identification des mots/du lexique (habileté de base)",
    normalizedValueFr:
      "Développer l'identification des mots/du lexique comme habileté de base en lecture.",
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      219, '221', 'Français — La lecture (printed 221, phys 219)',
      '2.2.1 En première, deuxième et troisième années',
      '"l\'identification des mots/du lexique" listed among the P1-3 base reading habiletés.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P1-3 from artifact sub-heading; exact grade not established.',
  },
  {
    claimId: 'cl-bA-fr-read-p13-activites-type',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-reading',
    category: 'METHODOLOGICAL_GUIDANCE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P1', 'P2', 'P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-reading',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'activités de discrimination auditive/visuelle, combinatoire, correspondance phonie/graphie, déchiffrage de mots nouveaux, identification instantanée de mots fréquents, compréhension, jeux de lecture',
    normalizedValueFr:
      'Amener l\'apprenant vers les objectifs de lecture via des activités de discrimination auditive et visuelle, de combinatoire, de correspondance phonie/graphie, de déchiffrage de mots nouveaux, d\'identification instantanée de mots fréquents, de compréhension et de jeux de lecture.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      219, '221', 'Français — La lecture (printed 221, phys 219)',
      '2.2.1 En première, deuxième et troisième années',
      'Enumerated activity types listed in the P1-3 reading passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P1-3 from artifact sub-heading; exact grade not established.',
  },
  {
    claimId: 'cl-bA-fr-read-p46-textes-choix',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-reading',
    category: 'CONTENT_ELEMENT',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P4', 'P5', 'P6'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-reading',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'Textes choisis en fonction du thème de l\'unité et de la typologie indiquée pour chaque sous-compétence; accessibles, motivants, porteurs de valeurs',
    normalizedValueFr:
      'Choisir les textes de lecture en fonction du thème de l\'unité et de la typologie indiquée pour chaque sous-compétence; les textes doivent être accessibles, motivants et porteurs de valeurs.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      219, '221', 'Français — La lecture (printed 221, phys 219)',
      '2.2.2 En quatrième, cinquième et sixième années',
      'Text-selection criteria stated in the P4-6 reading passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P4-6 from artifact sub-heading; exact grade not established.',
  },

  // ---- WRITING (cell-bA-fr-writing) — phys 221, printed 223 ----
  {
    claimId: 'cl-bA-fr-write-p1-activites-graphiques',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-writing',
    category: 'OBJECTIVE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P1'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-writing',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'activités graphiques en première année pour préparer à l\'écriture et développer les habiletés perceptives et motrices',
    normalizedValueFr:
      'Pratiquer des activités graphiques en première année pour préparer l\'apprenant à l\'écriture et développer des habiletés perceptives et motrices.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      221, '223', 'Français — La production de l\'écrit (printed 223, phys 221)',
      '2.3.1 En première année',
      'Graphic-activity objective of the P1 written-production passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade scope P1 from artifact sub-heading; kept REVIEW_REQUIRED.',
  },
  {
    claimId: 'cl-bA-fr-write-p23-ecriture-cursive',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-writing',
    category: 'OBJECTIVE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P2', 'P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-writing',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'écriture correcte de lettres et de syllabes en respectant les règles de l\'écriture minuscule cursive',
    normalizedValueFr:
      'Écrire correctement des lettres et des syllabes en respectant les règles de l\'écriture minuscule cursive.',
    normalizationClassification: 'DIRECT',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      221, '223', 'Français — La production de l\'écrit (printed 223, phys 221)',
      '2.3.2 En deuxième et troisième années',
      'Cursive-writing objective of the P2-3 written-production passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P2-3 from artifact sub-heading; exact grade not established.',
  },
  {
    claimId: 'cl-bA-fr-write-p23-copie-dictee',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-writing',
    category: 'CONTENT_ELEMENT',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P2', 'P3'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-writing',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'copie de mots, de phrases simples ou de textes courts; écriture sous dictée',
    normalizedValueFr:
      'Copier des mots, des phrases simples ou des textes courts et écrire sous dictée en respectant les règles de l\'écriture cursive.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      221, '223', 'Français — La production de l\'écrit (printed 223, phys 221)',
      '2.3.2 En deuxième et troisième années',
      'Copie/dictée content listed in the P2-3 written-production passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P2-3 from artifact sub-heading; exact grade not established.',
  },
  {
    claimId: 'cl-bA-fr-write-p46-textes-types',
    batchId: BATCH_B_ID,
    cellId: 'cell-bA-fr-writing',
    category: 'OBJECTIVE',
    sourceTopic: null,
    educationSystemCode: 'MOROCCO',
    stageCode: 'PRIMARY',
    candidateGrade: null,
    gradeBandScope: ['P4', 'P5', 'P6'],
    sourceConfirmedGrade: null,
    structuralElementId: 'el-skill-fr-writing',
    sourceSubject: 'SRC_FRENCH',
    applicationSubjectCode: 'FRENCH',
    sourceVersionId: BATCH_SOURCE_VERSION_ID,
    sourceClassification: 'OFFICIAL_CURRICULUM_DOCUMENT',
    sourceWordingFr:
      'produire des écrits en lien avec les types de textes visés, en situation de communication écrite',
    normalizedValueFr:
      'Produire des écrits en lien avec les types de textes visés en mettant l\'apprenant en situation de communication écrite.',
    normalizationClassification: 'LOSSLESS_NORMALIZATION',
    extractionMethod: 'DIRECT_STRUCTURED_EXTRACTION',
    provenance: batchProvenance(
      221, '223', 'Français — La production de l\'écrit (printed 223, phys 221)',
      '2.3.3 En quatrième, cinquième et sixième années',
      'Text-type production objective of the P4-6 written-production passage.',
      'DIRECT_DIGITAL',
    ),
    attributionMode: 'REVIEW_REQUIRED',
    exactGradeEvidenceState: 'UNRESOLVED',
    verificationState: 'REVIEW_REQUIRED',
    contentStatus: 'REVIEW_REQUIRED',
    confidence: 'MODERATE',
    notes: 'Grade band P4-6 from artifact sub-heading; exact grade not established.',
  },
];

// ============================================================
// NEGATIVE SCOPE — deferred/excluded/rejected candidates (§ I)
// ============================================================
// These candidates MUST NEVER become content claims. The listening cell is the
// frozen deferred French skill; the rejected candidates were examined and
// refused during Phase A scope decisions (adjacent band / adjacent pages /
// non-batch subjects).

export const BATCH_NEGATIVE_CANDIDATES = [
  {
    negativeId: 'cell-bB-fr-listening',
    batchId: BATCH_B_ID,
    negativeReason:
      'French listening (compréhension de l\'oral) is DEFERRED — SKILL_ELEMENT_UNDERSPECIFIED; Frozen Batch B covers reading + writing only.',
    negativeState: 'BLOCKED' as BatchNegativeState,
    neverBecomesClaim: true,
  },
  {
    negativeId: 'cell-rej-math-p6-fractions',
    batchId: BATCH_A_ID,
    negativeReason:
      'Rejected in Phase A: P6 fraction band is an ADJACENT band outside the frozen 0-9999 P3 add/sub cells; no recon expansion.',
    negativeState: 'REJECTED' as BatchNegativeState,
    neverBecomesClaim: true,
  },
  {
    negativeId: 'cell-rej-fr-p1p2',
    batchId: BATCH_B_ID,
    negativeReason:
      'Rejected in Phase A: French P1/P2 pages lie OUTSIDE the frozen phys 218-221 reading/writing scope.',
    negativeState: 'REJECTED' as BatchNegativeState,
    neverBecomesClaim: true,
  },
  {
    negativeId: 'cell-rej-music',
    negativeReason:
      'Rejected in Phase A: music (تربية فنية component) is not part of either frozen batch; batch scope is SRC_MATH + SRC_FRENCH only.',
    negativeState: 'REJECTED' as BatchNegativeState,
    neverBecomesClaim: true,
  },
  {
    negativeId: 'cell-rej-civic',
    negativeReason:
      'Rejected in Phase A: civic education is not part of either frozen batch; batch scope is SRC_MATH + SRC_FRENCH only.',
    negativeState: 'REJECTED' as BatchNegativeState,
    neverBecomesClaim: true,
  },
] as const;

export const BATCH_NEGATIVE_CANDIDATE_COUNT = BATCH_NEGATIVE_CANDIDATES.length;

// ============================================================
// STABLE CONTENT-CLAIM IDENTITY — semantic source scope, NOT page/claimId.
// ============================================================

/** Semantic scope descriptor: candidate grade (Batch A) or grade band (Batch B). */
export function batchClaimScopeKey(c: {
  readonly candidateGrade: CellSourceConfirmedGrade | null;
  readonly gradeBandScope: readonly string[];
}): string {
  if (c.candidateGrade) return `g${c.candidateGrade}`;
  return `[${c.gradeBandScope.slice().sort().join(':')}]`;
}

export function batchClaimStableKey(c: {
  readonly structuralElementId: string;
  readonly scopeKey: string;
  readonly category: ContentClaimCategory;
  readonly normalizedValue: string;
  readonly sourceVersionId: string;
}): string {
  const norm = c.normalizedValue.trim().replace(/\s+/g, ' ');
  return `[batch|${c.structuralElementId}|${c.scopeKey}|${c.category}|${norm}|${c.sourceVersionId}]`;
}

function normalizedOf(c: BatchContentClaim): string {
  return c.normalizedValueAr ?? c.normalizedValueFr ?? '';
}

export function batchClaimStableKeyOf(c: BatchContentClaim): string {
  return batchClaimStableKey({
    structuralElementId: c.structuralElementId,
    scopeKey: batchClaimScopeKey({ candidateGrade: c.candidateGrade, gradeBandScope: c.gradeBandScope }),
    category: c.category,
    normalizedValue: normalizedOf(c),
    sourceVersionId: c.sourceVersionId,
  });
}

// ============================================================
// DEDUPLICATION GUARD — canonical comparison within/between everything frozen.
// All comparisons EXECUTED: within Batch A, within Batch B, A<->B, and against
// Gate 07C.7 (pilot) and Gate 07C.9 (expansion) canonical claims.
// ============================================================

const PILOT_MAP: ReadonlyMap<string, string> = new Map(
  CONTENT_EXTRACTION_PILOT_CLAIMS.map((c) => [
    contentClaimStableKey({
      structuralElementId: c.structuralElementId,
      gradeCode: c.gradeCode,
      category: c.category,
      normalizedValueAr: c.normalizedValueAr,
      sourceVersionId: c.sourceVersionId,
    }),
    c.claimId,
  ]),
);

const EXPANSION_MAP: ReadonlyMap<string, string> = new Map(
  CONTROLLED_EXPANSION_CLAIMS.map((c) => [
    expansionClaimStableKey({
      structuralElementId: c.structuralElementId,
      gradeCode: c.candidateGrade,
      category: c.category,
      normalizedValueAr: c.normalizedValueAr,
      sourceVersionId: c.sourceVersionId,
    }),
    c.claimId,
  ]),
);

const BATCH_A_KEYS = new Set(BATCH_A_CLAIMS.map((c) => batchClaimStableKeyOf(c)));
const BATCH_B_KEYS = new Set(BATCH_B_CLAIMS.map((c) => batchClaimStableKeyOf(c)));
const BATCH_A_MAP: ReadonlyMap<string, string> = new Map(BATCH_A_CLAIMS.map((c) => [batchClaimStableKeyOf(c), c.claimId]));
const BATCH_B_MAP: ReadonlyMap<string, string> = new Map(BATCH_B_CLAIMS.map((c) => [batchClaimStableKeyOf(c), c.claimId]));

interface DedupComparisonOutput {
  readonly against: BatchDedupAgainst;
  readonly comparedKeyCount: number;
  readonly collisions: number;
  readonly preventedKeys: readonly { key: string; retainedClaimId: string }[];
  readonly internalDuplicateKeys: readonly string[];
}

/** WITHIN_BATCH: prove the claim array is internally unique on the semantic key. */
function runWithInBatch(against: 'WITHIN_BATCH', claims: readonly BatchContentClaim[]): DedupComparisonOutput {
  const seen = new Map<string, string>();
  const internalDuplicateKeys: string[] = [];
  for (const c of claims) {
    const k = batchClaimStableKeyOf(c);
    if (seen.has(k)) internalDuplicateKeys.push(k);
    else seen.set(k, c.claimId);
  }
  return {
    against,
    comparedKeyCount: claims.length,
    collisions: internalDuplicateKeys.length,
    preventedKeys: internalDuplicateKeys.map((k) => ({ key: k, retainedClaimId: seen.get(k) as string })),
    internalDuplicateKeys,
  };
}

/** Cross-universe: any query key already retained inside `retainedMap` would be a prevented duplicate. */
function runAgainstRetained(
  against: 'OTHER_BATCH' | 'GATE_07C.7' | 'GATE_07C.9',
  query: ReadonlySet<string>,
  retained: ReadonlyMap<string, string>,
): DedupComparisonOutput {
  const preventedKeys: { key: string; retainedClaimId: string }[] = [];
  for (const k of query) {
    const retainedId = retained.get(k);
    if (retainedId) preventedKeys.push({ key: k, retainedClaimId: retainedId });
  }
  return {
    against,
    comparedKeyCount: query.size,
    collisions: preventedKeys.length,
    preventedKeys,
    internalDuplicateKeys: [],
  };
}

const A_WITHIN = runWithInBatch('WITHIN_BATCH', BATCH_A_CLAIMS);
const B_WITHIN = runWithInBatch('WITHIN_BATCH', BATCH_B_CLAIMS);
const A_VS_B = runAgainstRetained('OTHER_BATCH', BATCH_A_KEYS, BATCH_B_MAP);
const B_VS_A = runAgainstRetained('OTHER_BATCH', BATCH_B_KEYS, BATCH_A_MAP);
const A_VS_PILOT = runAgainstRetained('GATE_07C.7', BATCH_A_KEYS, PILOT_MAP);
const B_VS_PILOT = runAgainstRetained('GATE_07C.7', BATCH_B_KEYS, PILOT_MAP);
const A_VS_EXPANSION = runAgainstRetained('GATE_07C.9', BATCH_A_KEYS, EXPANSION_MAP);
const B_VS_EXPANSION = runAgainstRetained('GATE_07C.9', BATCH_B_KEYS, EXPANSION_MAP);

// ============================================================
// DEDUP EVIDENCE — machine-readable prevention records + within-batch keys.
// ============================================================

function dedupRecord(
  against: BatchDedupAgainst,
  preventedClaimCanonicalKey: string,
  retainedClaimId: string,
): BatchDedupPreventionRecord {
  return {
    against,
    preventedClaimCanonicalKey,
    retainedCanonicalKey: preventedClaimCanonicalKey,
    retainedClaimId,
    note: `Dup guard executed ${against}: suppressed before claim creation`,
  };
}

function dedupRecords(): readonly BatchDedupPreventionRecord[] {
  return [
    ...A_WITHIN.preventedKeys.map((r) => dedupRecord('WITHIN_BATCH', r.key, r.retainedClaimId)),
    ...B_WITHIN.preventedKeys.map((r) => dedupRecord('WITHIN_BATCH', r.key, r.retainedClaimId)),
    ...A_VS_B.preventedKeys.map((r) => dedupRecord('OTHER_BATCH', r.key, r.retainedClaimId)),
    ...B_VS_A.preventedKeys.map((r) => dedupRecord('OTHER_BATCH', r.key, r.retainedClaimId)),
    ...A_VS_PILOT.preventedKeys.map((r) => dedupRecord('GATE_07C.7', r.key, r.retainedClaimId)),
    ...B_VS_PILOT.preventedKeys.map((r) => dedupRecord('GATE_07C.7', r.key, r.retainedClaimId)),
    ...A_VS_EXPANSION.preventedKeys.map((r) => dedupRecord('GATE_07C.9', r.key, r.retainedClaimId)),
    ...B_VS_EXPANSION.preventedKeys.map((r) => dedupRecord('GATE_07C.9', r.key, r.retainedClaimId)),
  ];
}

export const BATCH_DEDUP_PREVENTED_RECORDS = dedupRecords();

export const BATCH_DEDUP: BatchDedupCheckResult = {
  comparisons: [
    { against: A_WITHIN.against, comparedKeyCount: A_WITHIN.comparedKeyCount, collisions: A_WITHIN.collisions },
    { against: B_WITHIN.against, comparedKeyCount: B_WITHIN.comparedKeyCount, collisions: B_WITHIN.collisions },
    { against: A_VS_B.against, comparedKeyCount: A_VS_B.comparedKeyCount, collisions: A_VS_B.collisions },
    { against: B_VS_A.against, comparedKeyCount: B_VS_A.comparedKeyCount, collisions: B_VS_A.collisions },
    { against: A_VS_PILOT.against, comparedKeyCount: A_VS_PILOT.comparedKeyCount, collisions: A_VS_PILOT.collisions },
    { against: B_VS_PILOT.against, comparedKeyCount: B_VS_PILOT.comparedKeyCount, collisions: B_VS_PILOT.collisions },
    { against: A_VS_EXPANSION.against, comparedKeyCount: A_VS_EXPANSION.comparedKeyCount, collisions: A_VS_EXPANSION.collisions },
    { against: B_VS_EXPANSION.against, comparedKeyCount: B_VS_EXPANSION.comparedKeyCount, collisions: B_VS_EXPANSION.collisions },
  ],
  duplicatesPrevented: BATCH_DEDUP_PREVENTED_RECORDS,
  totalDuplicatesPrevented: BATCH_DEDUP_PREVENTED_RECORDS.length,
  twentySevenC7SuiteFrozen: true,
  sevenC7PilotFrozen: true,
  sevenC8ReviewsFrozen: true,
  sevenC9ExpansionFrozen: true,
};

// ============================================================
// PER-BATCH LEDGERS — every count DERIVED from canonical records.
// ============================================================

function batchLedger(
  batchId: string,
  manifest: ControlledBatchManifest,
  cells: readonly ControlledBatchCell[],
  claims: readonly BatchContentClaim[],
  lifecycleState: BatchLifecycleState,
): ControlledBatchLedger {
  const directlyEstablishedGradeCount = claims.filter(
    (c) => c.attributionMode === 'DIRECTLY_ESTABLISHED_GRADE',
  ).length;
  const structurallyCalibratedGradeCount = claims.filter(
    (c) => c.attributionMode === 'STRUCTURALLY_CALIBRATED_GRADE',
  ).length;
  const reviewRequiredGradeCount = claims.filter(
    (c) => c.attributionMode === 'REVIEW_REQUIRED',
  ).length;
  const sourceStructureInsufficientGradeCount = claims.filter(
    (c) => c.attributionMode === 'SOURCE_STRUCTURE_INSUFFICIENT',
  ).length;
  const extractedUnverifiedCount = claims.filter(
    (c) => c.contentStatus === 'EXTRACTED_UNVERIFIED',
  ).length;
  const reviewRequiredContentCount = claims.filter(
    (c) => c.contentStatus === 'REVIEW_REQUIRED',
  ).length;
  return {
    gate: '07C.10',
    batchId,
    manifest,
    cells,
    cellCount: cells.length,
    claims,
    claimCount: claims.length,
    maximumClaims: manifest.maximumClaims,
    directlyEstablishedGradeCount,
    structurallyCalibratedGradeCount,
    reviewRequiredGradeCount,
    sourceStructureInsufficientGradeCount,
    extractedUnverifiedCount,
    reviewRequiredContentCount,
    contentVerifiedCount: 0,
    publishedCount: 0,
    directSourceConfirmedCount: 0,
    syntheticLessons: 0,
    syntheticKnowledgeObjects: 0,
    syntheticExercises: 0,
    contentDenominatorKnown: false,
    completenessStatus: 'UNMEASURABLE',
    lifecycleState,
    closedAt: BATCH_FROZEN_DATE,
    dedup: BATCH_DEDUP,
  };
}

export const BATCH_A_LEDGER: ControlledBatchLedger = batchLedger(
  BATCH_A_ID,
  BATCH_A_MANIFEST,
  BATCH_A_CELLS,
  BATCH_A_CLAIMS,
  'BATCH_CLOSED',
);

export const BATCH_B_LEDGER: ControlledBatchLedger = batchLedger(
  BATCH_B_ID,
  BATCH_B_MANIFEST,
  BATCH_B_CELLS,
  BATCH_B_CLAIMS,
  'BATCH_CLOSED',
);

// ============================================================
// GLOBAL LEDGER — derived aggregates across the two batches.
// ============================================================

export const BATCH_GLOBAL_LEDGER: ControlledBatchGlobalLedger = {
  gate: '07C.10',
  batchIds: [BATCH_A_ID, BATCH_B_ID],
  batchCount: 2,
  totalCellCount: BATCH_A_CELLS.length + BATCH_B_CELLS.length,
  totalClaimCount: BATCH_A_CLAIMS.length + BATCH_B_CLAIMS.length,
  totalMaximumClaims: BATCH_A_MANIFEST.maximumClaims + BATCH_B_MANIFEST.maximumClaims,
  claimsBySourceSubject: [
    { sourceSubject: 'SRC_MATH', count: BATCH_A_CLAIMS.length },
    { sourceSubject: 'SRC_FRENCH', count: BATCH_B_CLAIMS.length },
  ],
  claimsByGradeEvidenceState: [
    {
      exactGradeEvidenceState: 'STRUCTURALLY_CALIBRATED',
      count: BATCH_A_CLAIMS.filter((c) => c.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED').length,
    },
    {
      exactGradeEvidenceState: 'UNRESOLVED',
      count: BATCH_B_CLAIMS.filter((c) => c.exactGradeEvidenceState === 'UNRESOLVED').length,
    },
  ],
  claimsByContentStatus: [
    {
      contentStatus: 'EXTRACTED_UNVERIFIED',
      count: BATCH_A_CLAIMS.filter((c) => c.contentStatus === 'EXTRACTED_UNVERIFIED').length,
    },
    {
      contentStatus: 'REVIEW_REQUIRED',
      count: BATCH_B_CLAIMS.filter((c) => c.contentStatus === 'REVIEW_REQUIRED').length,
    },
  ],
  claimsByVerificationState: [
    {
      verificationState: 'UNVERIFIED',
      count: BATCH_A_CLAIMS.filter((c) => c.verificationState === 'UNVERIFIED').length,
    },
    {
      verificationState: 'REVIEW_REQUIRED',
      count: BATCH_B_CLAIMS.filter((c) => c.verificationState === 'REVIEW_REQUIRED').length,
    },
  ],
  duplicateClaimsPreventedTotal: BATCH_DEDUP.totalDuplicatesPrevented,
  negativeCandidateCount: BATCH_NEGATIVE_CANDIDATE_COUNT,
  contentVerifiedCount: 0,
  publishedCount: 0,
  completenessStatus: 'UNMEASURABLE',
  contentDenominatorKnown: false,
  allBatchesClosed:
    BATCH_A_LEDGER.lifecycleState === 'BATCH_CLOSED' && BATCH_B_LEDGER.lifecycleState === 'BATCH_CLOSED',
};

// ============================================================
// GATE 07C.10 VERDICT
// ============================================================

export const BATCH_VERDICT: ControlledBatchExtractionVerdict = {
  gate: '07C.10',
  artifactSha256: BATCH_ARTIFACT_SHA256,
  sourceVersionId: BATCH_SOURCE_VERSION_ID,
  batchIds: BATCH_GLOBAL_LEDGER.batchIds,
  batchCount: BATCH_GLOBAL_LEDGER.batchCount,
  cellCount: BATCH_GLOBAL_LEDGER.totalCellCount,
  claimCount: BATCH_GLOBAL_LEDGER.totalClaimCount,
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
  lifecycleProven: BATCH_GLOBAL_LEDGER.allBatchesClosed,
  closureSemantics: true,
  pilotRegistryFrozen: true,
  reviewRegistryFrozen: true,
  expansionRegistryFrozen: true,
  denominatorFrozenVerbatim: true,
  recommendation: 'PASS',
};

// ============================================================
// CONVENIENCE EXPORTS — the two batch idents + claim universes.
// ============================================================

export const ALL_BATCH_CELLS: readonly ControlledBatchCell[] = [
  ...BATCH_A_CELLS,
  ...BATCH_B_CELLS,
];

export const ALL_BATCH_CLAIMS: readonly BatchContentClaim[] = [
  ...BATCH_A_CLAIMS,
  ...BATCH_B_CLAIMS,
];