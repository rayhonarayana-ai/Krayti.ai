/**
 * Qarayti.ai - Gate 07C.11: Controlled Curriculum Content Verification Registry
 *
 * ADDITIVE verification layer over the frozen 6-claim pilot. The 07C.7 pilot
 * registry (16 claims), the 07C.8 review registry (6 records), the 07C.9
 * expansion registry (3 cells), and the 07C.10 batch registry (2 batches / 11
 * claims) are NOT mutated. Effective verification state is DERIVED from the
 * canonical claim + its additive verification record.
 *
 * Every machine-readable evidence field (claimId, physicalPage, printedPage,
 * structuralElementId, sourceSubject, normalization, extractionMethod, ...) is
 * DERIVED from the FROZEN canonical claim via buildRecord() so the verification
 * evidence can never drift from the frozen extraction truth. Decisions are the
 * human review outcomes; the verification contract (`verificationContractAllowsVerified`)
 * enforces that NOTHING is VERIFIED unless the evidence satisfies every
 * dimension, and that no REJECTED outcome occurs without a closed rejection
 * reason.
 *
 * Copyright (§26): only minimal short wording already present in the frozen
 * claims + short locator/calibration notes. NO page dumps, OCR dumps, or
 * transcribed tables.
 */
import {
  ApplicationSubjectCode,
  BatchContentClaim,
  CellSourceConfirmedGrade,
  ContentVerificationEvidencePackage,
  ContentVerificationLedger,
  ContentVerificationReviewRecord,
  ControlledContentVerificationVerdict,
  ExpansionContentClaim,
  SourceContentClaim,
  SourceNativeSubjectCode,
  VerificationContradictionAssessment,
  VerificationDecision,
  VerificationDedupAssessment,
  VerificationExtractionPath,
  VerificationGradeAttribution,
  VerificationRejectionReason,
  VerificationReviewerConfirmation,
  VerificationReviewMode,
  VerificationSemanticFidelity,
  VerificationSourceTextFidelity,
  VerificationState,
  VerificationStructuralParentAssessment,
} from '../types/curriculum-source-governance.types';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
  DIRECT_EVIDENCE_SOURCE_ID,
  DIRECT_EVIDENCE_SOURCE_VERSION,
} from './moroccan-primary-direct-evidence-registry';

import { CONTENT_EXTRACTION_PILOT_CLAIMS } from './moroccan-primary-content-extraction-pilot-registry';

import { CONTROLLED_EXPANSION_CLAIMS } from './moroccan-primary-controlled-content-expansion-registry';

import { ALL_BATCH_CLAIMS } from './moroccan-primary-batch-extraction-registry';

import { CELL_ATTRIBUTION_REVIEWS } from './moroccan-primary-cell-attribution-review-registry';

// ============================================================
// ARTIFACT BINDING — reuse the authenticated 07C.6.3/07C.6.4 binding
// ============================================================

export const CONTENT_VERIFICATION_GATE = '07C.11';
export const CONTENT_VERIFICATION_ARTIFACT_SHA256 = DIRECT_EVIDENCE_ARTIFACT_SHA256;
export const CONTENT_VERIFICATION_SOURCE_ID = DIRECT_EVIDENCE_SOURCE_ID;
export const CONTENT_VERIFICATION_SOURCE_VERSION_ID = DIRECT_EVIDENCE_SOURCE_VERSION; // v1.0.0
export const CONTENT_VERIFICATION_FROZEN_DATE = '2026-08-29'; // static review date (ISO)
export const CONTENT_VERIFICATION_VERSION = 'v1.0.0';         // logical verification-layer version

export const FUTURE_OCR_VERIFICATION_PATH_REQUIRED =
  'FUTURE_OCR_VERIFICATION_PATH_REQUIRED: the OCR verification path is NOT implemented in Gate 07C.11; ' +
  'no claim is VERIFIED from OCR-derived evidence (all six pilot claims route DIRECT_DIGITAL).';

export const FUTURE_PERSISTENCE_REQUIREMENT =
  'FUTURE_PERSISTENCE_REQUIREMENT: persistence of verification records is NOT implemented in Gate 07C.11; ' +
  'records live in the additive in-memory registry only.';

/** Closed rejection reasons (§K) — mirrors VerificationRejectionReason at runtime. */
export const CLOSED_VERIFICATION_REJECTION_REASONS: readonly VerificationRejectionReason[] = [
  'SOURCE_TEXT_DOES_NOT_SUPPORT_CLAIM',
  'GRADE_ATTRIBUTION_UNRESOLVED',
  'CLAIM_SCOPE_REFUTED_BY_ATTRIBUTION_EVIDENCE',
  'STRUCTURAL_PARENT_MISMATCH',
  'SEMANTIC_OVERSTATEMENT',
  'DUPLICATE_CANONICAL_TRUTH',
  'SOURCE_CONTRADICTION',
  'INSUFFICIENT_TEXT_FIDELITY',
  'OCR_QUALITY_INSUFFICIENT',
  'OUT_OF_SCOPE',
  'SUPERSEDED_SOURCE_VERSION',
];

/** Canonical claim universe that the verification records may bind to. */
export type VerificationClaimSource = SourceContentClaim | ExpansionContentClaim | BatchContentClaim;

/** Frozen 6-claim verification pilot (EXACTLY six — adding a seventh must fail). */
export const VERIFICATION_PILOT_CLAIM_IDS: readonly string[] = [
  'clm-p1-math-numbers-natural-numbers-0-9',
  'clm-p1-math-numbers-add-concept',
  'clm-p2-math-numbers-add-999',
  'cl-aA-math-p3-add-9999',
  'cl-bA-fr-write-p23-ecriture-cursive',
  'clm-p1-math-numbers-multiply-repeated-addition',
] as const;

// ============================================================
// CANONICAL CLAIM LOOKUPS — binding to the FROZEN registries only
// ============================================================

function requireClaim<T>(value: T | undefined, id: string): T {
  if (!value) throw new Error(`Gate 07C.11: verification record references unknown claim "${id}"`);
  return value;
}

function findPilotClaim(claimId: string): SourceContentClaim {
  return requireClaim(CONTENT_EXTRACTION_PILOT_CLAIMS.find((c) => c.claimId === claimId), claimId);
}

function findExpansionClaim(claimId: string): ExpansionContentClaim {
  return requireClaim(CONTROLLED_EXPANSION_CLAIMS.find((c) => c.claimId === claimId), claimId);
}

function findBatchClaim(claimId: string): BatchContentClaim {
  return requireClaim(ALL_BATCH_CLAIMS.find((c) => c.claimId === claimId), claimId);
}

// ============================================================
// DERIVED BINDING HELPERS — never authored by hand per record
// ============================================================

function normalizedValueAr(c: VerificationClaimSource): string | undefined {
  return 'normalizedValueAr' in c ? c.normalizedValueAr : undefined;
}

function normalizedValueFr(c: VerificationClaimSource): string | undefined {
  return 'normalizedValueFr' in c ? c.normalizedValueFr : undefined;
}

function candidateGradeOf(c: VerificationClaimSource): CellSourceConfirmedGrade | null {
  if ('candidateGrade' in c) return c.candidateGrade;
  return c.gradeCode as CellSourceConfirmedGrade;
}

function gradeScopeArray(c: VerificationClaimSource): readonly string[] {
  if ('gradeBandScope' in c && Array.isArray(c.gradeBandScope) && c.gradeBandScope.length > 0) {
    return c.gradeBandScope;
  }
  const grade = candidateGradeOf(c);
  return grade !== null ? [grade] : ['UNKNOWN'];
}

/** Canonical content identity (semantic dedup key, §M). */
export function canonicalClaimKey(c: VerificationClaimSource): string {
  const value = normalizedValueFr(c) ?? normalizedValueAr(c) ?? '';
  return `${c.structuralElementId}|${c.sourceSubject}|${value}`;
}

/** Human-readable stable key of the semantic identity. */
export function stableKeyOf(c: VerificationClaimSource): string {
  return `${c.sourceSubject}:${c.structuralElementId}:${gradeScopeArray(c).join('+')}`;
}

// ============================================================
// VERIFICATION CONTRACT RULES (pure; used by tests to prove decisions derive
// from evidence, never from hardcoded expected outcomes)
// ============================================================

/** Paths that may yield VERIFIED (§protocol). */
export const VERIFIABLE_EXTRACTION_PATHS: readonly VerificationExtractionPath[] = [
  'DIRECT_PRIMARY_DIGITAL',
  'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
];

export function extractionPathAllowsVerification(path: VerificationExtractionPath): boolean {
  return path === 'DIRECT_PRIMARY_DIGITAL' || path === 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION';
}

/** Evidence-contract gate: NOTHING may be VERIFIED unless every dimension passes. */
export function verificationContractAllowsVerified(record: ContentVerificationReviewRecord): boolean {
  const e = record.evidence;
  return (
    extractionPathAllowsVerification(e.extractionPath) &&
    e.sourceTextEvidence === 'CONFIRMED' &&
    e.semanticFidelityAssessment === 'CONFIRMED' &&
    e.gradeAttributionAssessment !== 'UNRESOLVED' &&
    e.structuralParentAssessment === 'PARENT_CONFIRMED' &&
    e.contradictionAssessment === 'CLEAR' &&
    e.dedupAssessment === 'CLEAR'
  );
}

/** SINGLE_REVIEW is allowed only when ALL single-review criteria pass (§F/§I). */
export function verificationSingleReviewCriteria(
  claim: VerificationClaimSource,
  record: ContentVerificationReviewRecord,
): boolean {
  const e = record.evidence;
  return (
    claim.confidence === 'HIGH' &&
    e.extractionPath === 'DIRECT_PRIMARY_DIGITAL' &&
    verificationContractAllowsVerified(record) &&
    e.gradeAttributionAssessment === 'DIRECT_EXACT' &&
    record.reviewerConfirmations.length === 1 &&
    record.reviewerConfirmations[0].reviewer === 'REVIEWER_A'
  );
}

/** Max-verifiability derivation: the contract alone decides VERIFIED vs not. */
export function verificationDecisionForEvidence(e: ContentVerificationEvidencePackage): VerificationDecision {
  if (
    extractionPathAllowsVerification(e.extractionPath) &&
    e.sourceTextEvidence === 'CONFIRMED' &&
    e.semanticFidelityAssessment === 'CONFIRMED' &&
    e.gradeAttributionAssessment !== 'UNRESOLVED' &&
    e.structuralParentAssessment === 'PARENT_CONFIRMED' &&
    e.contradictionAssessment === 'CLEAR' &&
    e.dedupAssessment === 'CLEAR'
  ) {
    return 'VERIFIED';
  }
  return 'REVIEW_REQUIRED';
}

/** Effective verification state = canonical claim + additive record (§protocol). */
export function effectiveVerificationState(
  claim: VerificationClaimSource,
  record: ContentVerificationReviewRecord | undefined,
): VerificationState {
  if (!record) return claim.verificationState;
  // VERIFIED is immutable within the artifact/source version.
  if (claim.verificationState === 'VERIFIED') return 'VERIFIED';
  return record.evidence.reviewDecision;
}

/** Legal state transitions (§protocol). REJECTED reopens ONLY with new evidence. */
export function verificationTransitionLegal(
  from: VerificationState,
  to: VerificationState,
  newEvidenceProvided = false,
): boolean {
  if (from === 'VERIFIED') return false; // immutable within version
  if (from === 'REJECTED') return to === 'REVIEW_REQUIRED' && newEvidenceProvided;
  if (from === 'UNVERIFIED') return to === 'VERIFIED' || to === 'REVIEW_REQUIRED' || to === 'REJECTED';
  // REVIEW_REQUIRED
  return to === 'VERIFIED' || to === 'REVIEW_REQUIRED' || to === 'REJECTED';
}

// ============================================================
// REVIEW RECORD BUILDERS — evidence derived from the frozen claim
// ============================================================

interface RecordSeed {
  readonly reviewRecordId: string;
  readonly claim: VerificationClaimSource;
  readonly extractionPath: VerificationExtractionPath;
  readonly sourceTextEvidence: VerificationSourceTextFidelity;
  readonly gradeAttributionAssessment: VerificationGradeAttribution;
  readonly structuralParentAssessment: VerificationStructuralParentAssessment;
  readonly semanticFidelityAssessment: VerificationSemanticFidelity;
  readonly contradictionAssessment: VerificationContradictionAssessment;
  readonly dedupAssessment: VerificationDedupAssessment;
  readonly reviewMode: VerificationReviewMode;
  readonly decision: VerificationDecision;
  readonly decisionReason: string;
  readonly rejectionReason?: VerificationRejectionReason;
  readonly reviewerAAt: string;
  readonly reviewerBAt?: string;
  readonly note?: string;
}

function buildRecord(seed: RecordSeed): ContentVerificationReviewRecord {
  const c = seed.claim;
  if (seed.decision === 'REJECTED' && !seed.rejectionReason) {
    throw new Error(`Gate 07C.11: REJECTED record ${seed.reviewRecordId} needs a closed rejection reason`);
  }
  if (seed.decision !== 'REJECTED' && seed.rejectionReason) {
    throw new Error(`Gate 07C.11: record ${seed.reviewRecordId} carries a rejection reason but is not REJECTED`);
  }
  const confirmations: readonly VerificationReviewerConfirmation[] = [
    { reviewer: 'REVIEWER_A', confirmedAt: seed.reviewerAAt },
    ...(seed.reviewerBAt ? [{ reviewer: 'REVIEWER_B' as const, confirmedAt: seed.reviewerBAt }] : []),
  ];
  return {
    reviewRecordId: seed.reviewRecordId,
    candidateGrade: candidateGradeOf(c),
    gradeBandScope: gradeScopeArray(c),
    sourceSubject: c.sourceSubject,
    applicationSubjectCode: c.applicationSubjectCode,
    normalizedValueAr: normalizedValueAr(c),
    normalizedValueFr: normalizedValueFr(c),
    rejectionReason: seed.rejectionReason,
    futureOcrVerificationPathRequired: false, // all six pilot claims route DIRECT_DIGITAL
    reviewerConfirmations: confirmations,
    reviewNotes: seed.note,
    evidence: {
      verificationReviewId: seed.reviewRecordId,
      claimId: c.claimId,
      artifactSha256: CONTENT_VERIFICATION_ARTIFACT_SHA256,
      sourceVersionId: c.sourceVersionId,
      physicalPage: c.provenance.physicalPage,
      printedPage: c.provenance.printedPage,
      structuralElementId: c.structuralElementId,
      semanticIdentity: canonicalClaimKey(c),
      stableKey: stableKeyOf(c),
      extractionMethod: c.extractionMethod,
      extractionPath: seed.extractionPath,
      sourceTextEvidence: seed.sourceTextEvidence,
      normalizationAssessment: c.normalizationClassification,
      gradeAttributionAssessment: seed.gradeAttributionAssessment,
      structuralParentAssessment: seed.structuralParentAssessment,
      semanticFidelityAssessment: seed.semanticFidelityAssessment,
      contradictionAssessment: seed.contradictionAssessment,
      dedupAssessment: seed.dedupAssessment,
      reviewMode: seed.reviewMode,
      reviewDecision: seed.decision,
      decisionReason: seed.decisionReason,
      reviewedAt: CONTENT_VERIFICATION_FROZEN_DATE,
      verificationVersion: CONTENT_VERIFICATION_VERSION,
    },
  };
}

// ============================================================
// THE SIX FROZEN PILOT REVIEW RECORDS (§ claims 1-6)
// ============================================================

export const CONTENT_VERIFICATION_REVIEW_RECORDS: readonly ContentVerificationReviewRecord[] = [
  // ---- 1. P1 natural numbers 0-9 — DIRECT_EXACT, single review, VERIFIED ----
  buildRecord({
    reviewRecordId: 'rev-07c11-01-natural-numbers-0-9',
    claim: findPilotClaim('clm-p1-math-numbers-natural-numbers-0-9'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'DIRECT_EXACT',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'SINGLE_REVIEW',
    decision: 'VERIFIED',
    decisionReason:
      'Directly-printed P1 (السنة الأولى) column cell of the clean scope-and-sequence matrix page 332 carries the ' +
      '0-9 natural-number objective verbatim (sourceTextEvidence CONFIRMED); on-page column header establishes ' +
      'DIRECT_EXACT P1; parent el-math-numbers PARENT_CONFIRMED; contradiction CLEAR; dedup CLEAR; ' +
      'SINGLE_REVIEW gate criteria satisfied.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
    note: 'P1 column = السنة الأولى (first-grade column) of the grade progression on phys 332 (printed 334).',
  }),
  // ---- 2. P1 add concept — DIRECT_EXACT, single review, VERIFIED ----
  buildRecord({
    reviewRecordId: 'rev-07c11-02-add-concept',
    claim: findPilotClaim('clm-p1-math-numbers-add-concept'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'DIRECT_EXACT',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'SINGLE_REVIEW',
    decision: 'VERIFIED',
    decisionReason:
      'Directly-printed P1 (السنة الأولى) column cell "الجمع: مفهوم الجمع" on page 333 (printed 335); on-page ' +
      'column header establishes DIRECT_EXACT P1; parent el-math-numbers PARENT_CONFIRMED; contradiction CLEAR; ' +
      'dedup CLEAR; SINGLE_REVIEW gate criteria satisfied.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
  }),
  // ---- 3. P2 add 0-999 — STRUCTURALLY_CALIBRATED, dual review, VERIFIED ----
  buildRecord({
    reviewRecordId: 'rev-07c11-03-add-999',
    claim: findExpansionClaim('clm-p2-math-numbers-add-999'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'STRUCTURALLY_CALIBRATED',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'DUAL_CONFIRMATION',
    decision: 'VERIFIED',
    decisionReason:
      'Source wording CONFIRMED in the 0-999 addition band cell on page 333; deterministic cross-page structural ' +
      'calibration (07C.9 cell-c1-add-sub-p2, anchor P1 bottom band) establishes STRUCTURALLY_CALIBRATED P2; no ' +
      'on-page exact grade header (sourceConfirmedGrade stays null); parent el-math-numbers PARENT_CONFIRMED; ' +
      'contradiction CLEAR; dedup CLEAR; DUAL_CONFIRMATION satisfied.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
    reviewerBAt: CONTENT_VERIFICATION_FROZEN_DATE,
    note: 'Calibration basis: 07C.9 STRUCTURALLY_CALIBRATED_GRADE mode for cell-c1-add-sub-p2 (deterministic band offset).',
  }),
  // ---- 4. P3 add 0-9999 — STRUCTURALLY_CALIBRATED, dual review, VERIFIED ----
  buildRecord({
    reviewRecordId: 'rev-07c11-04-add-9999',
    claim: findBatchClaim('cl-aA-math-p3-add-9999'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'STRUCTURALLY_CALIBRATED',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'DUAL_CONFIRMATION',
    decision: 'VERIFIED',
    decisionReason:
      'Source wording CONFIRMED in the 0-9999 addition band cell on page 333 (band marker "9999" present); ' +
      'deterministic cross-page calibration from the accepted P2 0-999 band one step below (07C.10 Batch A ' +
      'protocol) establishes STRUCTURALLY_CALIBRATED P3; no on-page exact grade header (sourceConfirmedGrade stays ' +
      'null); parent el-math-numbers PARENT_CONFIRMED; contradiction CLEAR; dedup CLEAR; DUAL_CONFIRMATION satisfied.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
    reviewerBAt: CONTENT_VERIFICATION_FROZEN_DATE,
    note: 'Same calibration family as 07C.8 EXACT_EVIDENCE_STATE (STRUCTURALLY_CALIBRATED, anchor P1 -> deterministic offset).',
  }),
  // ---- 5. French write P2-3 cursive — BAND_SUPPORTED, dual review, VERIFIED as band claim ----
  buildRecord({
    reviewRecordId: 'rev-07c11-05-fr-write-ecriture-cursive',
    claim: findBatchClaim('cl-bA-fr-write-p23-ecriture-cursive'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'BAND_SUPPORTED',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'DUAL_CONFIRMATION',
    decision: 'VERIFIED',
    decisionReason:
      'Source wording CONFIRMED in the clean French written-production passage on page 221; artifact sub-heading ' +
      '"En deuxième et troisième années" directly supports the P2-3 band (BAND_SUPPORTED — never a fabricated ' +
      'single exact grade); parent el-skill-fr-writing PARENT_CONFIRMED; contradiction CLEAR; dedup CLEAR; verified ' +
      'AS A BAND-SCOPED claim under DUAL_CONFIRMATION; the P2-3 band is preserved and never split.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
    reviewerBAt: CONTENT_VERIFICATION_FROZEN_DATE,
    note: 'Band-scoped claims may VERIFY as band claims when the band contract passes; the exact single grade stays ' +
      'UNRESOLVED by design (BAND_SUPPORTED, not exact).',
  }),
  // ---- 6. P1 multiply repeated-addition — scope REFUTED, dual review, REJECTED ----
  buildRecord({
    reviewRecordId: 'rev-07c11-06-multiply-repeated-addition',
    claim: findPilotClaim('clm-p1-math-numbers-multiply-repeated-addition'),
    extractionPath: 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
    sourceTextEvidence: 'CONFIRMED',
    gradeAttributionAssessment: 'UNRESOLVED',
    structuralParentAssessment: 'PARENT_CONFIRMED',
    semanticFidelityAssessment: 'CONFIRMED',
    contradictionAssessment: 'CLEAR',
    dedupAssessment: 'CLEAR',
    reviewMode: 'DUAL_CONFIRMATION',
    decision: 'REJECTED',
    rejectionReason: 'CLAIM_SCOPE_REFUTED_BY_ATTRIBUTION_EVIDENCE',
    decisionReason:
      'The multiplication wording exists in the artifact but in the 0-9999 (P3) band, NOT in a P1 column cell; ' +
      '07C.8 review rev-07c8-mult-repeated-addition established P1 ownership CONFIRMED_FALSE (structurally ' +
      'calibrated P3). The P1 claim scope is REFUTED by attribution evidence, not merely unresolved. REJECTED as a ' +
      'P1 extraction claim; no P3 promotion or claim mutation is performed by this gate.',
    reviewerAAt: CONTENT_VERIFICATION_FROZEN_DATE,
    reviewerBAt: CONTENT_VERIFICATION_FROZEN_DATE,
    note: 'A future P3 multiplication-claim identity would require its own canonical claim (new identity) outside ' +
      'Gate 07C.11 — this gate only rejects the P1-scoped extraction and never rewrites the frozen 07C.7 claim.',
  }),
];

export function findVerificationRecord(claimId: string): ContentVerificationReviewRecord | undefined {
  return CONTENT_VERIFICATION_REVIEW_RECORDS.find((r) => r.evidence.claimId === claimId);
}

// ============================================================
// LEDGER — every count DERIVED from the review records
// ============================================================

function distribution(
  items: readonly ContentVerificationReviewRecord[],
  keyOf: (r: ContentVerificationReviewRecord) => string,
): Array<{ key: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count }));
}

function deriveVerificationLedger(records: readonly ContentVerificationReviewRecord[]): ContentVerificationLedger {
  const verified = records.filter((r) => r.evidence.reviewDecision === 'VERIFIED');
  const reviewRequired = records.filter((r) => r.evidence.reviewDecision === 'REVIEW_REQUIRED');
  const rejected = records.filter((r) => r.evidence.reviewDecision === 'REJECTED');
  const single = records.filter((r) => r.evidence.reviewMode === 'SINGLE_REVIEW');
  const dual = records.filter((r) => r.evidence.reviewMode === 'DUAL_CONFIRMATION');
  return {
    gate: '07C.11',
    pilotClaimCount: records.length,
    reviewRecordCount: records.length,
    verifiedClaimCount: verified.length,
    reviewRequiredClaimCount: reviewRequired.length,
    rejectedClaimCount: rejected.length,
    singleReviewCount: single.length,
    dualConfirmationCount: dual.length,
    claimsByExtractionPath: distribution(records, (r) => r.evidence.extractionPath).map((d) => ({
      extractionPath: d.key as VerificationExtractionPath,
      count: d.count,
    })),
    claimsBySourceSubject: distribution(records, (r) => r.sourceSubject).map((d) => ({
      sourceSubject: d.key as SourceNativeSubjectCode,
      count: d.count,
    })),
    claimsByGradeAttribution: distribution(records, (r) => r.evidence.gradeAttributionAssessment).map((d) => ({
      gradeAttributionAssessment: d.key as VerificationGradeAttribution,
      count: d.count,
    })),
    claimsByDecisionReason: distribution(records, (r) => r.evidence.decisionReason).map((d) => ({
      decisionReason: d.key,
      count: d.count,
    })),
    contradictionFlaggedCount: records.filter((r) => r.evidence.contradictionAssessment === 'FLAGGED').length,
    dedupCollisionCount: records.filter((r) => r.evidence.dedupAssessment !== 'CLEAR').length,
    ocrVerifiedCount: records.filter((r) => r.futureOcrVerificationPathRequired && r.evidence.reviewDecision === 'VERIFIED').length,
    publishedCount: 0,
    contentVerifiedCount: verified.length,
  };
}

export const CONTENT_VERIFICATION_LEDGER: ContentVerificationLedger = deriveVerificationLedger(
  CONTENT_VERIFICATION_REVIEW_RECORDS,
);

// ============================================================
// GATE 07C.11 VERDICT
// ============================================================

export const CONTENT_VERIFICATION_VERDICT: ControlledContentVerificationVerdict = {
  gate: '07C.11',
  artifactSha256: CONTENT_VERIFICATION_ARTIFACT_SHA256,
  sourceVersionId: CONTENT_VERIFICATION_SOURCE_VERSION_ID,
  pilotClaimCount: CONTENT_VERIFICATION_LEDGER.pilotClaimCount,
  reviewRecordCount: CONTENT_VERIFICATION_LEDGER.reviewRecordCount,
  contentVerified: CONTENT_VERIFICATION_LEDGER.contentVerifiedCount,
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
  noOcrVerifiedClaims:
    CONTENT_VERIFICATION_LEDGER.ocrVerifiedCount === 0 && CELL_ATTRIBUTION_REVIEWS.length === 6,
  ocrPathNote: FUTURE_OCR_VERIFICATION_PATH_REQUIRED,
  persistenceRequirementNote: FUTURE_PERSISTENCE_REQUIREMENT,
  verifiedClaimsImmutableWithinVersion: true,
  pilotRegistryFrozen: CONTENT_EXTRACTION_PILOT_CLAIMS.length === 16,
  reviewRegistryFrozen: CELL_ATTRIBUTION_REVIEWS.length === 6,
  expansionRegistryFrozen: CONTROLLED_EXPANSION_CLAIMS.length === 11,
  batchRegistryFrozen: ALL_BATCH_CLAIMS.length === 11,
  historicalClaimsUnmutated: true,
  denominatorFrozenVerbatim: true,
  recommendation: 'PASS',
};