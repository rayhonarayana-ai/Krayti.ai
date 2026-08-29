/**
 * Qarayti.ai - Gate 07C.8: Primary Curriculum Cell Attribution & Review
 * Resolution — Review Registry
 *
 * Resolves the six Gate-07C.7 REVIEW_REQUIRED cell-attribution claims
 * (3 MULTIPLICATION + 3 DIVISION) using ONLY the primary artifact's table
 * geometry (§13 forensic core). Grade truth is established from the matrix
 * geometry/ranges/row alignment — NOT from semantic plausibility, claimId,
 * wording, application taxonomy, or curriculum knowledge.
 *
 * ADDITIVE (freeze-safe, §1/§55): the Gate-07C.7 pilot claims array is NOT
 * mutated. This registry records a resolved attribution decision per review
 * claim. 07C.7 stays 92/92 (REVIEW=6 / REJECTED=0), claim count stays 16 (§23).
 *
 * GRADE-SCOPE DISTINCTION (§16): `candidateGrade` = pilot candidate scope (P1,
 * the ministerial pilot grade). `sourceConfirmedGrade` = the grade the matrix
 * geometry actually establishes. NEVER conflated.
 *
 * EPISTEMIC CAVEAT (surfaced explicitly): the exact source grade NUMBER (P3 vs
 * P4) is derived by cross-page geometric calibration from the accepted P1
 * anchor (bottom "من 0 إلى 99" band on the addition/subtraction matrix page),
 * because the multiplication and division matrix pages do not print per-row
 * grade headings. "NOT P1" is the strongly-grounded conclusion for all six;
 * the specific other grade is calibration-derived and recorded as such.
 *
 * Copyright (§26): only minimal short wording + coordinates + locator notes are
 * committed. NO page dumps, OCR dumps, or transcribed tables.
 */

import type {
  CellAttributionReview,
  CellAttributionReviewLedger,
  CellAttributionReviewVerdict,
  GateSourceTopic,
  CellSourceConfirmedGrade,
  AttributionDecisionBasis,
  ContentCellAttributionDecision,
  CellP1OwnershipState,
  ExactGradeEvidenceState,
  CrossPageCalibrationEvidence,
} from '../types/curriculum-source-governance.types';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
} from './moroccan-primary-direct-evidence-registry';

// ============================================================
// GATE BINDING
// ============================================================

const ARTIFACT_ID = DIRECT_EVIDENCE_SOURCE_ID;              // src-primary-curriculum-2021
const SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION;   // v1.0.0
const ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
const REVIEWED_AT = '2026-08-28';
const ELEMENT = 'el-math-numbers';
const MATRIX_LOCATOR = 'مصفوفة المدى والتتابع — مجال الأعداد والحساب';

// Closed decision: all six reviewed cells establish an OTHER grade (not P1).
// Per §5 this means "confirmed to belong OUTSIDE P1" — it does NOT claim the
// exact other grade was directly printed by the source.
const DECISION: ContentCellAttributionDecision = 'CONFIRMED_OTHER_GRADE';

// NEGATIVE attribution result (§6): for all six, source geometry establishes
// the claim is NOT owned by the P1 cell/band.
const P1_OWNERSHIP: CellP1OwnershipState = 'CONFIRMED_FALSE';

// POSITIVE exact-grade epistemic state (§3): MULT/DIV matrix pages print per-
// band NUMERIC range markers but NO per-row grade headings. The exact grade
// number (P3/P4) is derived by deterministic CROSS-PAGE STRUCTURAL calibration
// from the accepted P1 anchor (bottom "من 0 إلى 99" band on the add/sub matrix
// page). Therefore all six are STRUCTURALLY_CALIBRATED — NONE is
// DIRECTLY_ESTABLISHED, and none is UNRESOLVED.
const EXACT_EVIDENCE_STATE: ExactGradeEvidenceState = 'STRUCTURALLY_CALIBRATED';

// Exactly-source-confirmed grade: `null` for every record because no exact
// P3/P4 is directly printed by the source (never overstate, §4).
const CONFIRMED_GRADE: CellSourceConfirmedGrade | null = null;

// Calibrated band -> grade mapping used consistently across MULT/DIV review
// records (from the accepted P1 anchor at the matrix bottom band).
const GRADE_P3: CellSourceConfirmedGrade = 'P3'; // range "من 0 إلى 9999"
const GRADE_P4: CellSourceConfirmedGrade = 'P4'; // range "من 0 إلى 999999"

// Shared cross-page calibration evidence (§7) satisfying the calibration
// contract: same artifact/version, same continuous matrix table, stable
// band ordering, explicit anchor grade, deterministic positional offset, no
// contradictory header/boundary — and NO semantic curriculum assumptions.
const CALIBRATION: CrossPageCalibrationEvidence = {
  anchorGrade: 'P1',
  anchorLocator: 'مصفوفة المدى والتتابع — الصف السفلي (نطاق من 0 إلى 99، x≈428)',
  tableContinuityNote: 'نفس مصفوفة المدى والتتابع (مجال الأعداد والحساب) في نفس المصدر والنسخة',
  bandOrderingStableNote: 'ترتيب النطاقات ثابت من الأسفل (P1) صعودا عبر الحدود العددية 99/999/9999/999999',
  deterministicOffsetNote: 'إزاحة كاملة حتمية من قبل نطاق P1 السفلي إلى النطاق المعني دون أي قفزة',
  noContradictoryBoundaryNote: 'لا يوجد رأس/حد متناقض ضمن المصفوفة بالنسبة لتلك الصفوف',
};

// ============================================================
// REVIEW RECORDS (§14)
// ============================================================

export const CELL_ATTRIBUTION_REVIEWS: readonly CellAttributionReview[] = [
  // ---- MULTIPLICATION (phys 334, printed 336): cells in the 0-9999 band -> P3 ----
  {
    reviewId: 'rev-07c8-mult-repeated-addition',
    claimId: 'clm-p1-math-numbers-multiply-repeated-addition',
    sourceTopic: 'MULTIPLICATION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 334,
    printedPage: '336',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P3',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P3,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة الضرب — خلية تعريف الضرب',
    gradeHeaderLocator: 'calibrated band 0-9999 (P3); cross-page from P1 anchor; no on-page grade heading',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'band carries range من 0 إلى 9999',
      rowColumnAlignmentNote:
        'row/band aligned with الضرب techniques cell (0-9999); not in the P1 bottom band',
      continuationNote: 'band label continued from labelled مصفوفة الضرب header',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['TABLE_ROW_COLUMN_ALIGNMENT', 'CONTINUATION_FROM_LABELED_HEADER', 'DIGITAL_GEOMETRY_CONFIRMATION'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },
  {
    reviewId: 'rev-07c8-mult-techniques',
    claimId: 'clm-p1-math-numbers-multiply-techniques',
    sourceTopic: 'MULTIPLICATION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 334,
    printedPage: '336',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P3',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P3,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة الضرب — خلية التقنيات',
    gradeHeaderLocator: 'direct range من 0 إلى 9999 in-cell (P3); not in the P1 bottom band',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'direct in-cell range من 0 إلى 9999',
      rowColumnAlignmentNote:
        'in-cell range constrains to 0-9999 (P3); no P1 (0-99) constraint',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['DIGITAL_GEOMETRY_CONFIRMATION', 'TABLE_ROW_COLUMN_ALIGNMENT'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },
  {
    reviewId: 'rev-07c8-mult-tables',
    claimId: 'clm-p1-math-numbers-multiply-tables',
    sourceTopic: 'MULTIPLICATION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 334,
    printedPage: '336',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P3',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P3,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة الضرب — خلية جدول الضرب وخاصياته',
    gradeHeaderLocator: 'calibrated band 0-9999 (P3); cross-page from P1 anchor; no on-page grade heading',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'band carries range من 0 إلى 9999',
      rowColumnAlignmentNote:
        'row/band aligned with الضرب techniques cell (0-9999); not in the P1 bottom band',
      continuationNote: 'band label continued from labelled مصفوفة الضرب header',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['TABLE_ROW_COLUMN_ALIGNMENT', 'CONTINUATION_FROM_LABELED_HEADER', 'DIGITAL_GEOMETRY_CONFIRMATION'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },

  // ---- DIVISION (phys 335, printed 337): concept & 2-digit -> Row D (P3); solve -> Row C (P4) ----
  {
    reviewId: 'rev-07c8-div-concept',
    claimId: 'clm-p1-math-numbers-divide-concept',
    sourceTopic: 'DIVISION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 335,
    printedPage: '337',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P3',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P3,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة القسمة — خلية تعريف مفهوم القسمة',
    gradeHeaderLocator: 'Row D (0-9999, P3) via calibrated band; not in P1/P2 rows (empty)',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'row band corresponds to range من 0 إلى 9999 (P3)',
      rowColumnAlignmentNote:
        'concept cell sits in upper band Row D; P1/P2 rows are empty',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['TABLE_ROW_COLUMN_ALIGNMENT', 'DIGITAL_GEOMETRY_CONFIRMATION'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },
  {
    reviewId: 'rev-07c8-div-2-digit-by-1-digit',
    claimId: 'clm-p1-math-numbers-divide-2-digit-by-1-digit',
    sourceTopic: 'DIVISION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 335,
    printedPage: '337',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P3',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P3,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة القسمة — خلية قسمة عدد من رقمين على عدد من رقم واحد',
    gradeHeaderLocator: 'Row D (0-9999, P3) via calibrated band; not in P1/P2 rows (empty)',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'row band corresponds to range من 0 إلى 9999 (P3)',
      rowColumnAlignmentNote:
        '2-digit cell sits in upper band Row D; P1/P2 rows are empty',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['TABLE_ROW_COLUMN_ALIGNMENT', 'DIGITAL_GEOMETRY_CONFIRMATION'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },
  {
    reviewId: 'rev-07c8-div-solve-problems',
    claimId: 'clm-p1-math-numbers-divide-solve-problems',
    sourceTopic: 'DIVISION',
    artifactId: ARTIFACT_ID,
    sourceVersionId: SOURCE_VERSION_ID,
    physicalPage: 335,
    printedPage: '337',
    structuralElementId: ELEMENT,
    candidateGrade: 'P1',
    p1Ownership: P1_OWNERSHIP,
    exactGradeCandidate: 'P4',
    exactGradeEvidenceState: EXACT_EVIDENCE_STATE,
    sourceConfirmedGrade: CONFIRMED_GRADE,
    structurallyCalibratedGrade: GRADE_P4,
    tableLocator: MATRIX_LOCATOR,
    cellLocator: 'مصفوفة القسمة — خلية حل وضعية مشكلة بالقسمة',
    gradeHeaderLocator: 'Row C (0-999999, P4) via calibrated band; not in P1/P2 rows (empty)',
    geometryEvidence: {
      elementLabel: MATRIX_LOCATOR,
      headerOrRangeNote: 'row band corresponds to range من 0 إلى 999999 (P4)',
      rowColumnAlignmentNote:
        'solve cell sits in upper band Row C (above Row D); P1/P2 rows are empty; P4 is calibration-derived',
      crossPageCalibration: CALIBRATION,
    },
    attributionDecision: DECISION,
    decisionBasis: ['TABLE_ROW_COLUMN_ALIGNMENT', 'DIGITAL_GEOMETRY_CONFIRMATION'],
    reviewState: 'RESOLVED',
    reviewRequirement: 'REVIEW_REQUIRED',
    reviewedAt: REVIEWED_AT,
    reviewMethod: 'DIRECT_DIGITAL',
  },
];

// ============================================================
// GATE 07C.8 LIVE-FROZEN LEDGER — derived from the review records so report
// counts and this registry can never diverge.
// ============================================================

function deriveLedger(reviews: readonly CellAttributionReview[]): CellAttributionReviewLedger {
  const decisions = reviews.map((r) => r.attributionDecision);
  const confirmedP1 = decisions.filter((d) => d === 'CONFIRMED_P1').length;
  const confirmedOther = decisions.filter((d) => d === 'CONFIRMED_OTHER_GRADE').length;
  const ambiguous = decisions.filter((d) => d === 'STILL_AMBIGUOUS').length;
  const insufficient = decisions.filter((d) => d === 'SOURCE_STRUCTURE_INSUFFICIENT').length;
  const rejected = decisions.filter((d) => d === 'REJECTED_AS_P1').length;

  // Negative attribution (P1 ownership).
  const confirmedNotP1 = reviews.filter((r) => r.p1Ownership === 'CONFIRMED_FALSE').length;
  const notProvenNotP1 = reviews.filter((r) => r.p1Ownership === 'NOT_PROVEN_FALSE').length;

  // Positive exact-grade evidence level.
  const directlyEstablished = reviews.filter(
    (r) => r.exactGradeEvidenceState === 'DIRECTLY_ESTABLISHED',
  ).length;
  const structurallyCalibrated = reviews.filter(
    (r) => r.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED',
  ).length;
  const unresolvedExact = reviews.filter(
    (r) => r.exactGradeEvidenceState === 'UNRESOLVED',
  ).length;

  // Distinct source-confirmed (direct-only) and structurally-calibrated grades.
  const confirmedGrades = Array.from(
    new Set(
      reviews
        .map((r) => r.sourceConfirmedGrade)
        .filter((g): g is CellSourceConfirmedGrade => g !== null),
    ),
  ).sort() as CellSourceConfirmedGrade[];

  const calibratedGrades = Array.from(
    new Set(
      reviews
        .map((r) => r.structurallyCalibratedGrade)
        .filter((g): g is CellSourceConfirmedGrade => g !== null),
    ),
  ).sort() as CellSourceConfirmedGrade[];

  const topics = Array.from(new Set(reviews.map((r) => r.sourceTopic))).sort() as GateSourceTopic[];

  return {
    gate: '07C.8',
    reviewRequestCount: reviews.length,
    resolvedReviewCount: reviews.length,
    confirmedNotP1Count: confirmedNotP1,
    notProvenNotP1Count: notProvenNotP1,
    confirmedP1Count: confirmedP1,
    confirmedOtherGradeCount: confirmedOther,
    stillAmbiguousCount: ambiguous,
    sourceStructureInsufficientCount: insufficient,
    rejectedAsP1Count: rejected,
    directlyEstablishedGradeCount: directlyEstablished,
    structurallyCalibratedGradeCount: structurallyCalibrated,
    unresolvedExactGradeCount: unresolvedExact,
    distinctSourceConfirmedGrades: confirmedGrades,
    distinctStructurallyCalibratedGrades: calibratedGrades,
    sourceTopicsReviewed: topics,
    frozenPilotReviewCount: 6,
  };
}

export const CELL_ATTRIBUTION_REVIEW_LEDGER: CellAttributionReviewLedger = deriveLedger(
  CELL_ATTRIBUTION_REVIEWS,
);

// ============================================================
// GATE 07C.8 VERDICT
// ============================================================

export const CELL_ATTRIBUTION_REVIEW_VERDICT: CellAttributionReviewVerdict = {
  gate: '07C.8',
  pilotId: '07C7-pilot-p1-math-numbers',
  artifactSha256: ARTIFACT_SHA256,
  sourceVersionId: SOURCE_VERSION_ID,
  reviewRequestCount: CELL_ATTRIBUTION_REVIEW_LEDGER.reviewRequestCount,
  resolvedReviewCount: CELL_ATTRIBUTION_REVIEW_LEDGER.resolvedReviewCount,
  confirmedP1Count: CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedP1Count,
  confirmedOtherGradeCount: CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedOtherGradeCount,
  confirmedNotP1Count: CELL_ATTRIBUTION_REVIEW_LEDGER.confirmedNotP1Count,
  directlyEstablishedGradeCount: CELL_ATTRIBUTION_REVIEW_LEDGER.directlyEstablishedGradeCount,
  structurallyCalibratedGradeCount: CELL_ATTRIBUTION_REVIEW_LEDGER.structurallyCalibratedGradeCount,
  unresolvedExactGradeCount: CELL_ATTRIBUTION_REVIEW_LEDGER.unresolvedExactGradeCount,
  claimsMasqueradingAsP1: false,
  sourceConfirmedOnlyDirect: true,
  pilotClaimCountFrozen: true,
  contentVerifiedStaysZero: true,
  publishedStaysZero: true,
  gradeScopeDistinct: true,
  sevenC7SuitePreserved: true,
  recommendation: 'PASS',
};
