/**
 * Qarayti.ai - Gate 07C.11: Controlled Curriculum Content Verification Protocol -
 * Phase B Tests
 *
 * Groups for the additive verification registry:
 *   A. BASELINE/FREEZE  A01-A06  exactly 6 frozen pilot claims (no seventh), artifact
 *                                binding unchanged, source version bound
 *   B. LAYER SEPARATION B01-B04  additive: no claim-body mutation, records are NOT
 *                                claims, effective state derived from canonical + record
 *   C. EVIDENCE CONTRACT C01-C04 every evidence field derived from the frozen claim and
 *                                complete (hash, version, page, element, identity, method)
 *   D. FIDELITY         D01-D06  source-text/semantic fidelity rules; OVERSTATED/CONFLICT/
 *                                PARTIAL text forbid VERIFIED
 *   E. ATTRIBUTION      E01-E06  DIRECT_EXACT/STRUCTURALLY_CALIBRATED/BAND_SUPPORTED/
 *                                UNRESOLVED distinct; UNRESOLVED cannot verify;
 *                                calibrated basis referenced; sourceConfirmedGrade null
 *   F. REVIEW MODE      F01-F04  SINGLE_REVIEW A-only vs DUAL A+B; single-review gates
 *   G. PATHS            G01-G05  verifiable paths vs CROSS_REFERENCE (never verifies);
 *                                OCR path NOT implemented
 *   H. FRENCH           H01-H05  band P2-3 preserved, never split; verified AS band claim
 *   I. P1 DIRECT        I01-I04  R1/R2 single review, DIRECT_EXACT, all single criteria
 *   J. CALIBRATED MATH  J01-J05  R3/R4 dual, STRUCTURALLY_CALIBRATED, basis referenced
 *   K. REJECTION PROBE  K01-K08  R6 REJECTED via CLAIM_SCOPE_REFUTED_BY_ATTRIBUTION_EVIDENCE
 *                                (not unresolved/mismatch); 07C.8 CONFIRMED_FALSE linkage;
 *                                no mutation, no P3 promotion
 *   L. CONTRADICTION    L01-L03  CLEAR/FLAGGED; FLAGGED forbids VERIFIED; primary-first
 *   M. DEDUP            M01-M05  semantic keys unique across universes, no new claims
 *   N. STATE MACHINE    N01-N05  legal transitions; VERIFIED immutable; rejected reopen
 *   O. LEDGER           O01-O08  derived counters reconcile, partitions, split-proof
 *   P. GLOBAL FREEZES   P01-P06  42/0/3/6/3/54 denominator, prior gates stay 0, only
 *                                CONTENT_VERIFIED changes (derived)
 *   Q. SECURITY/REPO    Q01-Q06  no abs paths, no dumps, no secrets, no deploy, static
 *
 * The tests validate the additive VERIFICATION registry and its invariants. They do
 * NOT create units/lessons/KOs/exercises and do NOT modify learner/runtime behavior,
 * write to a database, mutate any frozen claim, or deploy anything.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CLOSED_VERIFICATION_REJECTION_REASONS,
  CONTENT_VERIFICATION_ARTIFACT_SHA256,
  CONTENT_VERIFICATION_FROZEN_DATE,
  CONTENT_VERIFICATION_GATE,
  CONTENT_VERIFICATION_LEDGER,
  CONTENT_VERIFICATION_REVIEW_RECORDS,
  CONTENT_VERIFICATION_SOURCE_VERSION_ID,
  CONTENT_VERIFICATION_VERDICT,
  CONTENT_VERIFICATION_VERSION,
  FUTURE_OCR_VERIFICATION_PATH_REQUIRED,
  FUTURE_PERSISTENCE_REQUIREMENT,
  VERIFICATION_PILOT_CLAIM_IDS,
  VERIFIABLE_EXTRACTION_PATHS,
  canonicalClaimKey,
  effectiveVerificationState,
  extractionPathAllowsVerification,
  findVerificationRecord,
  stableKeyOf,
  verificationContractAllowsVerified,
  verificationDecisionForEvidence,
  verificationSingleReviewCriteria,
  verificationTransitionLegal,
} from '../../../domain/constants/moroccan-primary-content-verification-registry';

import type { VerificationClaimSource } from '../../../domain/constants/moroccan-primary-content-verification-registry';

import { CONTENT_EXTRACTION_PILOT_CLAIMS } from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import {
  CONTROLLED_CONTENT_EXTRACTION_VERDICT,
} from '../../../domain/constants/moroccan-primary-content-extraction-pilot-registry';

import { CELL_ATTRIBUTION_REVIEWS, CELL_ATTRIBUTION_REVIEW_VERDICT } from '../../../domain/constants/moroccan-primary-cell-attribution-review-registry';

import {
  CONTROLLED_EXPANSION_CELLS,
  CONTROLLED_EXPANSION_CLAIMS,
  CONTROLLED_EXPANSION_VERDICT,
} from '../../../domain/constants/moroccan-primary-controlled-content-expansion-registry';

import {
  ALL_BATCH_CLAIMS,
  BATCH_A_ID,
  BATCH_B_ID,
  BATCH_VERDICT,
} from '../../../domain/constants/moroccan-primary-batch-extraction-registry';

import {
  CANONICAL_RECONCILIATION_VERDICT,
  SOURCE_NATIVE_STRUCTURAL_ELEMENTS,
} from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';

import {
  DIRECT_EVIDENCE_ARTIFACT_SHA256,
} from '../../../domain/constants/moroccan-primary-direct-evidence-registry';

import type {
  BatchContentClaim,
  ContentVerificationEvidencePackage,
  ContentVerificationReviewRecord,
  ExpansionContentClaim,
  SourceContentClaim,
} from '../../../domain/types/curriculum-source-governance.types';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (e: any) {
    failed++;
    console.log(`[FAIL] ${name}: ${e.message}`);
  }
}

type AnyClaim = SourceContentClaim | ExpansionContentClaim | BatchContentClaim;

function findCanonicalClaim(claimId: string): AnyClaim {
  const inPilot = CONTENT_EXTRACTION_PILOT_CLAIMS.find((c) => c.claimId === claimId);
  if (inPilot) return inPilot;
  const inExpansion = CONTROLLED_EXPANSION_CLAIMS.find((c) => c.claimId === claimId);
  if (inExpansion) return inExpansion;
  const inBatch = ALL_BATCH_CLAIMS.find((c) => c.claimId === claimId);
  if (inBatch) return inBatch;
  throw new Error(`canonical claim not found: ${claimId}`);
}

function candidateGradeOfClaim(c: AnyClaim): string | null {
  if ('candidateGrade' in c) return c.candidateGrade;
  return c.gradeCode;
}

function expectedCandidateGrade(claimId: string): string | null {
  const c = findCanonicalClaim(claimId);
  return candidateGradeOfClaim(c);
}

function sourceConfirmedGradeOf(c: AnyClaim): string | null {
  return 'sourceConfirmedGrade' in c ? c.sourceConfirmedGrade : null;
}

function recordFor(claimId: string): ContentVerificationReviewRecord {
  const r = findVerificationRecord(claimId);
  if (!r) throw new Error(`verification record not found: ${claimId}`);
  return r;
}

// ============================================================
// A. BASELINE / FREEZE (A01-A06)
// ============================================================

test('A01 - the frozen pilot is EXACTLY six claims — no seventh', () => {
  assert.strictEqual(VERIFICATION_PILOT_CLAIM_IDS.length, 6);
  assert.strictEqual(new Set(VERIFICATION_PILOT_CLAIM_IDS).size, 6, 'pilot ids unique');
  assert.strictEqual(CONTENT_VERIFICATION_REVIEW_RECORDS.length, 6, 'one record per pilot claim');
  const covered = new Set(CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => r.evidence.claimId));
  assert.strictEqual(covered.size, 6, 'six distinct claim ids covered');
  for (const id of VERIFICATION_PILOT_CLAIM_IDS) {
    assert.ok(covered.has(id), `record covers ${id}`);
  }
});

test('A02 - the six pilot claim ids are exactly the frozen ones', () => {
  assert.deepStrictEqual(
    [...VERIFICATION_PILOT_CLAIM_IDS].sort(),
    [
      'cl-aA-math-p3-add-9999',
      'cl-bA-fr-write-p23-ecriture-cursive',
      'clm-p1-math-numbers-add-concept',
      'clm-p1-math-numbers-multiply-repeated-addition',
      'clm-p1-math-numbers-natural-numbers-0-9',
      'clm-p2-math-numbers-add-999',
    ].sort(),
  );
});

test('A03 - gate identity and artifact binding are the authenticated ones', () => {
  assert.strictEqual(CONTENT_VERIFICATION_GATE, '07C.11');
  assert.strictEqual(CONTENT_VERIFICATION_ARTIFACT_SHA256, DIRECT_EVIDENCE_ARTIFACT_SHA256);
  assert.strictEqual(
    CONTENT_VERIFICATION_ARTIFACT_SHA256,
    '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F',
  );
  assert.strictEqual(CONTENT_VERIFICATION_SOURCE_VERSION_ID, 'v1.0.0');
  assert.strictEqual(CONTENT_VERIFICATION_VERSION, 'v1.0.0');
});

test('A04 - every pilot claim exists in exactly one frozen universe', () => {
  const ids = new Set<string>();
  for (const c of CONTENT_EXTRACTION_PILOT_CLAIMS) ids.add(c.claimId);
  for (const c of CONTROLLED_EXPANSION_CLAIMS) ids.add(c.claimId);
  for (const c of ALL_BATCH_CLAIMS) ids.add(c.claimId);
  for (const id of VERIFICATION_PILOT_CLAIM_IDS) {
    assert.ok(ids.has(id), `pilot claim ${id} resolves to a frozen canonical claim`);
  }
});

test('A05 - the two batch pilot claims belong to their frozen batches', () => {
  const add9999 = ALL_BATCH_CLAIMS.find((c) => c.claimId === 'cl-aA-math-p3-add-9999');
  const cursive = ALL_BATCH_CLAIMS.find((c) => c.claimId === 'cl-bA-fr-write-p23-ecriture-cursive');
  assert.ok(add9999, 'add-9999 is in the batch universe');
  assert.ok(cursive, 'cursive is in the batch universe');
  assert.strictEqual(add9999!.batchId, BATCH_A_ID);
  assert.strictEqual(cursive!.batchId, BATCH_B_ID);
});

test('A06 - verification seals are bound to the static review date and version', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.evidence.reviewedAt, CONTENT_VERIFICATION_FROZEN_DATE);
    assert.match(r.evidence.reviewedAt, /^\d{4}-\d{2}-\d{2}$/, 'ISO date shape');
    assert.strictEqual(r.evidence.verificationVersion, 'v1.0.0');
  }
});

// ============================================================
// B. LAYER SEPARATION (B01-B04)
// ============================================================

test('B01 - review records are NOT claim bodies (no wording/status fields)', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(!('sourceWordingAr' in r), 'no sourceWordingAr on a record');
    assert.ok(!('sourceWordingFr' in r), 'no sourceWordingFr on a record');
    assert.ok(!('contentStatus' in r), 'no contentStatus on a record');
    assert.ok(!('attributionStatus' in r), 'no attributionStatus on a record');
    assert.ok(!('sourceConfirmedGrade' in r), 'a verification record never fabricates a confirmed grade');
  }
});

test('B02 - frozen registry sizes are untouched by the additive layer', () => {
  assert.strictEqual(CONTENT_EXTRACTION_PILOT_CLAIMS.length, 16, '07C.7 pilot: 16 claims');
  assert.strictEqual(CELL_ATTRIBUTION_REVIEWS.length, 6, '07C.8 reviews: 6 records');
  assert.strictEqual(CONTROLLED_EXPANSION_CELLS.length, 3, '07C.9: 3 expansion cells');
  assert.strictEqual(CONTROLLED_EXPANSION_CLAIMS.length, 11, '07C.9: 11 expansion claims');
  assert.strictEqual(ALL_BATCH_CLAIMS.length, 11, '07C.10: 11 batch claims');
});

test('B03 - historical claim states are preserved verbatim', () => {
  const natural = findCanonicalClaim('clm-p1-math-numbers-natural-numbers-0-9');
  const addConcept = findCanonicalClaim('clm-p1-math-numbers-add-concept');
  const multiply = findCanonicalClaim('clm-p1-math-numbers-multiply-repeated-addition');
  const add9999 = findCanonicalClaim('cl-aA-math-p3-add-9999');
  const cursive = findCanonicalClaim('cl-bA-fr-write-p23-ecriture-cursive');
  assert.strictEqual(natural.verificationState, 'UNVERIFIED');
  assert.strictEqual(addConcept.verificationState, 'UNVERIFIED');
  assert.strictEqual(multiply.verificationState, 'REVIEW_REQUIRED');
  assert.strictEqual(add9999.verificationState, 'UNVERIFIED');
  assert.strictEqual(cursive.verificationState, 'REVIEW_REQUIRED');
});

test('B04 - effective verification state is DERIVED (canonical + record), never stored', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    const c = findCanonicalClaim(r.evidence.claimId);
    assert.strictEqual(effectiveVerificationState(c, r), r.evidence.reviewDecision, r.evidence.claimId);
    assert.strictEqual(effectiveVerificationState(c, undefined), c.verificationState, 'no record => canonical state');
  }
});

// ============================================================
// C. EVIDENCE CONTRACT (C01-C04)
// ============================================================

test('C01 - every evidence package binds its canonical claim fields exactly', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    const c = findCanonicalClaim(r.evidence.claimId);
    assert.strictEqual(r.evidence.claimId, c.claimId);
    assert.strictEqual(r.evidence.physicalPage, c.provenance.physicalPage, r.evidence.claimId);
    assert.strictEqual(r.evidence.printedPage, c.provenance.printedPage, r.evidence.claimId);
    assert.strictEqual(r.evidence.structuralElementId, c.structuralElementId);
    assert.strictEqual(r.evidence.sourceVersionId, c.sourceVersionId);
    assert.strictEqual(r.evidence.extractionMethod, c.extractionMethod);
    assert.strictEqual(r.evidence.normalizationAssessment, c.normalizationClassification);
    assert.strictEqual(r.sourceSubject, c.sourceSubject);
    assert.strictEqual(r.applicationSubjectCode, c.applicationSubjectCode);
    assert.strictEqual(r.candidateGrade, expectedCandidateGrade(r.evidence.claimId));
  }
});

test('C02 - evidence packages carry a stable semantic identity and stable key', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    const c = findCanonicalClaim(r.evidence.claimId);
    assert.ok(r.evidence.semanticIdentity.length > 0, 'semantic identity non-empty');
    assert.ok(r.evidence.stableKey.length > 0, 'stable key non-empty');
    assert.strictEqual(r.evidence.semanticIdentity, canonicalClaimKey(c), 'derived canonical content identity');
    assert.strictEqual(r.evidence.stableKey, stableKeyOf(c), 'derived stable key');
  }
});

test('C03 - structural parents all resolve to source-native elements', () => {
  const elements = new Set(SOURCE_NATIVE_STRUCTURAL_ELEMENTS.map((e) => e.structuralElementId));
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(elements.has(r.evidence.structuralElementId), `element ${r.evidence.structuralElementId} is source-native`);
    assert.strictEqual(r.evidence.structuralParentAssessment, 'PARENT_CONFIRMED');
  }
});

test('C04 - review ids are stable, closed-form, and unique', () => {
  const ids = CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => r.reviewRecordId);
  assert.strictEqual(new Set(ids).size, ids.length, 'review ids unique');
  for (const id of ids) assert.match(id, /^rev-07c11-\d{2}-[a-z0-9-]+$/, `review id shape ${id}`);
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.evidence.verificationReviewId, r.reviewRecordId);
  }
});

// ============================================================
// D. FIDELITY (§D) (D01-D06)
// ============================================================

test('D01 - VERIFIED requires CONFIRMED source-text fidelity (no PARTIAL/FAIL)', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    if (r.evidence.reviewDecision !== 'VERIFIED') continue;
    assert.strictEqual(r.evidence.sourceTextEvidence, 'CONFIRMED');
    assert.strictEqual(r.evidence.semanticFidelityAssessment, 'CONFIRMED');
  }
});

test('D02 - VERIFIED requires the full evidence contract to pass', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    if (r.evidence.reviewDecision !== 'VERIFIED') continue;
    assert.strictEqual(verificationContractAllowsVerified(r), true, r.evidence.claimId);
  }
  const rejected = CONTENT_VERIFICATION_REVIEW_RECORDS.find((r) => r.evidence.reviewDecision === 'REJECTED')!;
  assert.strictEqual(verificationContractAllowsVerified(rejected), false, 'rejected claim never passes the contract');
});

test('D03 - OVERSTATED semantic fidelity can never yield VERIFIED', () => {
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({ ...base, semanticFidelityAssessment: 'OVERSTATED' });
  assert.strictEqual(probe, 'REVIEW_REQUIRED');
});

test('D04 - CONFLICT semantic fidelity can never yield VERIFIED', () => {
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({ ...base, semanticFidelityAssessment: 'CONFLICT' });
  assert.strictEqual(probe, 'REVIEW_REQUIRED');
});

test('D05 - FAIL source-text fidelity can never yield VERIFIED', () => {
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({ ...base, sourceTextEvidence: 'FAIL' });
  assert.strictEqual(probe, 'REVIEW_REQUIRED');
  const partial = verificationDecisionForEvidence({ ...base, sourceTextEvidence: 'PARTIAL' });
  assert.strictEqual(partial, 'REVIEW_REQUIRED', 'PARTIAL is not enough to VERIFY unilaterally');
});

test('D06 - fidelity assessments are drawn from the closed sets', () => {
  const st = new Set(['CONFIRMED', 'PARTIAL', 'FAIL']);
  const sem = new Set(['CONFIRMED', 'OVERSTATED', 'CONFLICT']);
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(st.has(r.evidence.sourceTextEvidence), 'closed source-text fidelity');
    assert.ok(sem.has(r.evidence.semanticFidelityAssessment), 'closed semantic fidelity');
  }
});

// ============================================================
// E. ATTRIBUTION (§E) (E01-E06)
// ============================================================

test('E01 - grade attribution uses the closed distinct set', () => {
  const closed = new Set(['DIRECT_EXACT', 'STRUCTURALLY_CALIBRATED', 'BAND_SUPPORTED', 'UNRESOLVED']);
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(closed.has(r.evidence.gradeAttributionAssessment), r.evidence.claimId);
  }
});

test('E02 - UNRESOLVED grade attribution can never yield VERIFIED', () => {
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({ ...base, gradeAttributionAssessment: 'UNRESOLVED' });
  assert.strictEqual(probe, 'REVIEW_REQUIRED');
});

test('E03 - no VERIFIED claim has UNRESOLVED grade attribution', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    if (r.evidence.reviewDecision !== 'VERIFIED') continue;
    assert.notStrictEqual(r.evidence.gradeAttributionAssessment, 'UNRESOLVED');
  }
});

test('E04 - the frozen claims never carry a fabricated sourceConfirmedGrade', () => {
  const add999 = findCanonicalClaim('clm-p2-math-numbers-add-999');
  const add9999 = findCanonicalClaim('cl-aA-math-p3-add-9999');
  const cursive = findCanonicalClaim('cl-bA-fr-write-p23-ecriture-cursive');
  assert.strictEqual(sourceConfirmedGradeOf(add999), null, 'P2 calibrated stays null');
  assert.strictEqual(sourceConfirmedGradeOf(add9999), null, 'P3 calibrated stays null');
  assert.strictEqual(sourceConfirmedGradeOf(cursive), null, 'band stays null');
});

test('E05 - calibrated reviews reference the accepted 07C.8/07C.9/07C.10 calibration basis', () => {
  const r3 = findVerificationRecord('clm-p2-math-numbers-add-999')!;
  const r4 = findVerificationRecord('cl-aA-math-p3-add-9999')!;
  assert.match(r3.reviewNotes ?? '', /07C\.9/, 'P2 calibration basis referenced');
  assert.match(r4.reviewNotes ?? '', /07C\.8|07C\.10/, 'P3 calibration basis referenced');
  // 07C.8 calibrated-grade family still present (frozen review registry untouched).
  assert.ok(CELL_ATTRIBUTION_REVIEWS.every((rev) => rev.exactGradeEvidenceState === 'STRUCTURALLY_CALIBRATED'));
  const r6Link = CELL_ATTRIBUTION_REVIEWS.find((rev) => rev.reviewId === 'rev-07c8-mult-repeated-addition');
  assert.strictEqual(r6Link?.structurallyCalibratedGrade, 'P3');
});

test('E06 - calibrated P2/P3 claims were verified as CALIBRATED, never as DIRECT', () => {
  const r3 = findVerificationRecord('clm-p2-math-numbers-add-999')!;
  const r4 = findVerificationRecord('cl-aA-math-p3-add-9999')!;
  assert.strictEqual(r3.evidence.gradeAttributionAssessment, 'STRUCTURALLY_CALIBRATED');
  assert.strictEqual(r4.evidence.gradeAttributionAssessment, 'STRUCTURALLY_CALIBRATED');
  assert.match(r3.evidence.decisionReason, /STRUCTURALLY_CALIBRATED/);
  assert.match(r4.evidence.decisionReason, /STRUCTURALLY_CALIBRATED/);
  assert.ok(!r3.evidence.decisionReason.includes('DIRECT_EXACT'), 'no direct-exact wording');
  assert.ok(!r4.evidence.decisionReason.includes('DIRECT_EXACT'), 'no direct-exact wording');
});

// ============================================================
// F. REVIEW MODE (§F) (F01-F04)
// ============================================================

test('F01 - SINGLE_REVIEW uses a single REVIEWER_A slot only', () => {
  const single = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewMode === 'SINGLE_REVIEW');
  assert.strictEqual(single.length, 2, 'exactly the two P1 direct claims');
  for (const r of single) {
    assert.strictEqual(r.reviewerConfirmations.length, 1);
    assert.strictEqual(r.reviewerConfirmations[0].reviewer, 'REVIEWER_A');
  }
});

test('F02 - DUAL_CONFIRMATION uses both REVIEWER_A and REVIEWER_B slots', () => {
  const dual = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewMode === 'DUAL_CONFIRMATION');
  assert.strictEqual(dual.length, 4);
  for (const r of dual) {
    const slots = r.reviewerConfirmations.map((x) => x.reviewer).sort();
    assert.deepStrictEqual(slots, ['REVIEWER_A', 'REVIEWER_B']);
  }
});

test('F03 - the two P1 direct claims satisfy every SINGLE_REVIEW criterion', () => {
  for (const id of ['clm-p1-math-numbers-natural-numbers-0-9', 'clm-p1-math-numbers-add-concept']) {
    const r = findVerificationRecord(id)!;
    const c = findCanonicalClaim(id);
    assert.strictEqual(r.evidence.reviewMode, 'SINGLE_REVIEW');
    assert.strictEqual(verificationSingleReviewCriteria(c, r), true, id);
  }
});

test('F04 - calibrated / band / rejected claims never pass the SINGLE_REVIEW criteria', () => {
  for (const id of ['clm-p2-math-numbers-add-999', 'cl-aA-math-p3-add-9999', 'cl-bA-fr-write-p23-ecriture-cursive', 'clm-p1-math-numbers-multiply-repeated-addition']) {
    const r = findVerificationRecord(id)!;
    const c = findCanonicalClaim(id);
    assert.strictEqual(r.evidence.reviewMode, 'DUAL_CONFIRMATION');
    assert.strictEqual(verificationSingleReviewCriteria(c, r), false, id);
  }
});

// ============================================================
// G. PATHS (§protocol) (G01-G05)
// ============================================================

test('G01 - exactly the two primary-DIGITAL paths may verify', () => {
  assert.deepStrictEqual(VERIFIABLE_EXTRACTION_PATHS, [
    'DIRECT_PRIMARY_DIGITAL',
    'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
  ]);
  assert.strictEqual(extractionPathAllowsVerification('DIRECT_PRIMARY_DIGITAL'), true);
  assert.strictEqual(extractionPathAllowsVerification('DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION'), true);
  assert.strictEqual(extractionPathAllowsVerification('CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED'), false);
});

test('G02 - CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED never yields VERIFIED', () => {
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({
    ...base,
    extractionPath: 'CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED',
  });
  assert.strictEqual(probe, 'REVIEW_REQUIRED');
});

test('G03 - every pilot record routes a verifiable primary path (no weak verification)', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(extractionPathAllowsVerification(r.evidence.extractionPath), true, r.evidence.claimId);
    assert.notStrictEqual(r.evidence.extractionPath, 'CROSS_REFERENCE_SUPPORTED_BUT_NOT_VERIFIED');
  }
});

test('G04 - the OCR verification path is NOT implemented in 07C.11', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.futureOcrVerificationPathRequired, false,
      'all pilot claims are DIRECT_DIGITAL — OCR path is future work');
  }
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.ocrVerifiedCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.noOcrVerifiedClaims, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.ocrPathNote, FUTURE_OCR_VERIFICATION_PATH_REQUIRED);
});

test('G05 - persistence is a future requirement note, never performed', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.persistenceRequirementNote, FUTURE_PERSISTENCE_REQUIREMENT);
});

// ============================================================
// H. FRENCH BAND (§H) (H01-H05)
// ============================================================

test('H01 - the French claim stays a P2-3 band claim, never split', () => {
  const r = findVerificationRecord('cl-bA-fr-write-p23-ecriture-cursive')!;
  const c = findCanonicalClaim('cl-bA-fr-write-p23-ecriture-cursive') as BatchContentClaim;
  assert.strictEqual(r.sourceSubject, 'SRC_FRENCH');
  assert.strictEqual(r.candidateGrade, null, 'no fabricated single exact grade');
  assert.deepStrictEqual([...r.gradeBandScope], ['P2', 'P3']);
  assert.deepStrictEqual([...c.gradeBandScope], ['P2', 'P3']);
  assert.strictEqual(c.candidateGrade, null, 'frozen claim band preserved verbatim');
});

test('H02 - no other record splits the French band into single P2 or P3', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    if (r.sourceSubject !== 'SRC_FRENCH') continue;
    assert.deepStrictEqual([...r.gradeBandScope], ['P2', 'P3']);
    assert.ok(!r.gradeBandScope.includes('P2') || r.gradeBandScope.length !== 1, 'no P2-only split');
    assert.ok(!r.gradeBandScope.includes('P3') || r.gradeBandScope.length !== 1, 'no P3-only split');
  }
});

test('H03 - the French band is BAND_SUPPORTED, never a fabricated exact grade', () => {
  const r = findVerificationRecord('cl-bA-fr-write-p23-ecriture-cursive')!;
  assert.strictEqual(r.evidence.gradeAttributionAssessment, 'BAND_SUPPORTED');
  assert.strictEqual(r.evidence.extractionPath, 'DIRECT_PRIMARY_DIGITAL');
  assert.strictEqual(r.evidence.reviewMode, 'DUAL_CONFIRMATION');
  assert.match(r.evidence.decisionReason, /BAND_SUPPORTED/);
  assert.match(r.evidence.decisionReason, /P2-3/);
});

test('H04 - the band contract passed: verified AS a band-scoped claim', () => {
  const r = findVerificationRecord('cl-bA-fr-write-p23-ecriture-cursive')!;
  assert.strictEqual(r.evidence.reviewDecision, 'VERIFIED');
  assert.match(r.evidence.decisionReason, /BAND-SCOPED/);
  const c = findCanonicalClaim('cl-bA-fr-write-p23-ecriture-cursive') as BatchContentClaim;
  assert.strictEqual(c.exactGradeEvidenceState, 'UNRESOLVED', 'exact grade still unresolved in the frozen claim');
  assert.strictEqual(verificationContractAllowsVerified(r), true, 'band contract satisfied');
});

test('H05 - the frozen French claim keeps its honest REVIEW_REQUIRED historical state', () => {
  const c = findCanonicalClaim('cl-bA-fr-write-p23-ecriture-cursive');
  assert.strictEqual(c.verificationState, 'REVIEW_REQUIRED');
  assert.strictEqual(c.contentStatus, 'REVIEW_REQUIRED');
  assert.strictEqual(c.confidence, 'MODERATE');
});

// ============================================================
// I. P1 DIRECT (§I) (I01-I04)
// ============================================================

test('I01 - P1 direct claims verify via DIRECT_EXACT attribution', () => {
  for (const id of ['clm-p1-math-numbers-natural-numbers-0-9', 'clm-p1-math-numbers-add-concept']) {
    const r = findVerificationRecord(id)!;
    assert.strictEqual(r.candidateGrade, 'P1');
    assert.strictEqual(r.evidence.gradeAttributionAssessment, 'DIRECT_EXACT');
    assert.strictEqual(r.evidence.extractionPath, 'DIRECT_PRIMARY_DIGITAL');
    assert.strictEqual(r.evidence.reviewDecision, 'VERIFIED');
  }
});

test('I02 - no calibration/band dependency appears in the P1 direct reasons', () => {
  for (const id of ['clm-p1-math-numbers-natural-numbers-0-9', 'clm-p1-math-numbers-add-concept']) {
    const r = findVerificationRecord(id)!;
    assert.ok(!r.evidence.decisionReason.includes('STRUCTURALLY_CALIBRATED'));
    assert.ok(!r.evidence.decisionReason.includes('calibrat'));
    assert.match(r.evidence.decisionReason, /DIRECT_EXACT/);
  }
});

test('I03 - the P1 direct claims carried HIGH confidence before review', () => {
  for (const id of ['clm-p1-math-numbers-natural-numbers-0-9', 'clm-p1-math-numbers-add-concept']) {
    const c = findCanonicalClaim(id);
    assert.strictEqual(c.confidence, 'HIGH');
    assert.strictEqual(c.verificationState, 'UNVERIFIED');
  }
});

test('I04 - the P1 direct claims resolve pages on the authorized matrix pages', () => {
  const r1 = findVerificationRecord('clm-p1-math-numbers-natural-numbers-0-9')!;
  const r2 = findVerificationRecord('clm-p1-math-numbers-add-concept')!;
  assert.strictEqual(r1.evidence.physicalPage, 332);
  assert.strictEqual(r1.evidence.printedPage, '334');
  assert.strictEqual(r2.evidence.physicalPage, 333);
  assert.strictEqual(r2.evidence.printedPage, '335');
});

// ============================================================
// J. CALIBRATED MATH (§J) (J01-J05)
// ============================================================

test('J01 - calibrated math claims are DUAL_CONFIRMATION and STRUCTURALLY_CALIBRATED', () => {
  for (const id of ['clm-p2-math-numbers-add-999', 'cl-aA-math-p3-add-9999']) {
    const r = findVerificationRecord(id)!;
    assert.strictEqual(r.evidence.reviewMode, 'DUAL_CONFIRMATION');
    assert.strictEqual(r.evidence.gradeAttributionAssessment, 'STRUCTURALLY_CALIBRATED');
    assert.strictEqual(r.evidence.extractionPath, 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION');
    assert.strictEqual(r.evidence.reviewDecision, 'VERIFIED');
  }
});

test('J02 - the frozen calibrated claims keep their calibrated attribution modes', () => {
  const add999 = findCanonicalClaim('clm-p2-math-numbers-add-999') as ExpansionContentClaim;
  const add9999 = findCanonicalClaim('cl-aA-math-p3-add-9999') as BatchContentClaim;
  assert.strictEqual(add999.attributionMode, 'STRUCTURALLY_CALIBRATED_GRADE');
  assert.strictEqual(add9999.attributionMode, 'STRUCTURALLY_CALIBRATED_GRADE');
  assert.strictEqual(add9999.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED');
  const add999Cell = CONTROLLED_EXPANSION_CELLS.find((x) => x.cellId === add999.cellId)!;
  assert.ok(add999Cell, 'expansion cell exists');
  assert.strictEqual(add999Cell.exactGradeEvidenceState, 'STRUCTURALLY_CALIBRATED');
});

test('J03 - both reviewers independently confirmed every calibrated claim', () => {
  for (const id of ['clm-p2-math-numbers-add-999', 'cl-aA-math-p3-add-9999']) {
    const r = findVerificationRecord(id)!;
    assert.strictEqual(r.reviewerConfirmations.length, 2);
    const distinct = new Set(r.reviewerConfirmations.map((x) => x.reviewer));
    assert.strictEqual(distinct.size, 2);
  }
});

test('J04 - calibration comes from geometry, not from the claim id or wording', () => {
  const r3 = findVerificationRecord('clm-p2-math-numbers-add-999')!;
  const r4 = findVerificationRecord('cl-aA-math-p3-add-9999')!;
  assert.match(r3.evidence.decisionReason, /cross-page structural calibration|band cell/i);
  assert.match(r4.evidence.decisionReason, /calibration/i);
  assert.match(r4.evidence.decisionReason, /0-9999/);
});

test('J05 - calibrated verification never fabricates a DIRECT source confirm', () => {
  const r3 = findVerificationRecord('clm-p2-math-numbers-add-999')!;
  const r4 = findVerificationRecord('cl-aA-math-p3-add-9999')!;
  assert.ok(!('sourceConfirmedGrade' in r3));
  assert.ok(!('sourceConfirmedGrade' in r4));
  assert.ok(!r3.evidence.decisionReason.includes('DIRECTLY_ESTABLISHED'));
  assert.ok(!r4.evidence.decisionReason.includes('DIRECTLY_ESTABLISHED'));
});

// ============================================================
// K. REJECTION PROBE (§K) (K01-K08)
// ============================================================

test('K01 - the rejection probe decision is REJECTED with the closed refutation reason', () => {
  const r = findVerificationRecord('clm-p1-math-numbers-multiply-repeated-addition')!;
  assert.strictEqual(r.evidence.reviewDecision, 'REJECTED');
  assert.strictEqual(r.rejectionReason, 'CLAIM_SCOPE_REFUTED_BY_ATTRIBUTION_EVIDENCE');
});

test('K02 - refuted is NOT unresolved and is NOT a parent mismatch', () => {
  const r = findVerificationRecord('clm-p1-math-numbers-multiply-repeated-addition')!;
  assert.notStrictEqual(r.rejectionReason, 'GRADE_ATTRIBUTION_UNRESOLVED');
  assert.notStrictEqual(r.rejectionReason, 'STRUCTURAL_PARENT_MISMATCH');
  assert.strictEqual(r.evidence.structuralParentAssessment, 'PARENT_CONFIRMED', 'the parent is still right');
});

test('K03 - the rejection reason belongs to the closed 11-item set', () => {
  const r = findVerificationRecord('clm-p1-math-numbers-multiply-repeated-addition')!;
  assert.ok(CLOSED_VERIFICATION_REJECTION_REASONS.includes(r.rejectionReason!));
  assert.strictEqual(CLOSED_VERIFICATION_REJECTION_REASONS.length, 11);
  assert.strictEqual(new Set(CLOSED_VERIFICATION_REJECTION_REASONS).size, 11, 'reason set unique');
});

test('K04 - only REJECTED records may carry a rejection reason (and always do)', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    if (r.evidence.reviewDecision === 'REJECTED') {
      assert.ok(r.rejectionReason, 'rejected record has a closed rejection reason');
    } else {
      assert.strictEqual(r.rejectionReason, undefined, 'non-rejected record has no rejection reason');
    }
  }
});

test('K05 - the rejected claim cannot pass the verification contract', () => {
  const r = findVerificationRecord('clm-p1-math-numbers-multiply-repeated-addition')!;
  assert.strictEqual(verificationContractAllowsVerified(r), false);
  assert.strictEqual(verificationDecisionForEvidence(r.evidence), 'REVIEW_REQUIRED');
  assert.strictEqual(r.evidence.reviewDecision, 'REJECTED', 'human review went beyond max-verifiability via the refutation');
});

test('K06 - the 07C.8 record REFUTES P1 ownership for this cell (CONFIRMED_FALSE)', () => {
  const rev = CELL_ATTRIBUTION_REVIEWS.find((x) => x.reviewId === 'rev-07c8-mult-repeated-addition');
  assert.ok(rev, '07C.8 review exists');
  assert.strictEqual(rev!.claimId, 'clm-p1-math-numbers-multiply-repeated-addition');
  assert.strictEqual(rev!.p1Ownership, 'CONFIRMED_FALSE');
  assert.strictEqual(rev!.attributionDecision, 'CONFIRMED_OTHER_GRADE');
  assert.strictEqual(rev!.structurallyCalibratedGrade, 'P3');
});

test('K07 - the frozen 07C.7 claim is NOT mutated, renamed, or regraded', () => {
  const c = findCanonicalClaim('clm-p1-math-numbers-multiply-repeated-addition') as SourceContentClaim;
  assert.strictEqual(c.claimId, 'clm-p1-math-numbers-multiply-repeated-addition');
  assert.strictEqual(c.gradeCode, 'P1', 'claim stays a P1-scoped historical extraction');
  assert.strictEqual(c.verificationState, 'REVIEW_REQUIRED');
  assert.strictEqual(c.contentStatus, 'REVIEW_REQUIRED');
  assert.strictEqual(c.attributionStatus, 'REVIEW_REQUIRED');
});

test('K08 - no P3 multiplication claim is created by this gate', () => {
  const universes = [...CONTENT_EXTRACTION_PILOT_CLAIMS, ...CONTROLLED_EXPANSION_CLAIMS, ...ALL_BATCH_CLAIMS];
  for (const c of universes) {
    if (c.claimId.includes('multiply')) {
      assert.notStrictEqual(candidateGradeOfClaim(c), 'P3', 'no fabricated P3 multiplication claim');
    }
  }
  const coveredIds = CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => r.evidence.claimId);
  for (const id of coveredIds) {
    assert.ok(VERIFICATION_PILOT_CLAIM_IDS.includes(id), `record covers only a pilot claim: ${id}`);
  }
});

// ============================================================
// L. CONTRADICTION (§L) (L01-L03)
// ============================================================

test('L01 - contradiction assessment uses CLEAR/FLAGGED and FLAGGED forbids VERIFIED', () => {
  const closed = new Set(['CLEAR', 'FLAGGED']);
  const base: ContentVerificationEvidencePackage = CONTENT_VERIFICATION_REVIEW_RECORDS[0].evidence;
  const probe = verificationDecisionForEvidence({ ...base, contradictionAssessment: 'FLAGGED' });
  assert.strictEqual(probe, 'REVIEW_REQUIRED', 'FLAGGED forbids VERIFIED');
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(closed.has(r.evidence.contradictionAssessment));
  }
});

test('L02 - no pilot claim is flagged for contradiction', () => {
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.contradictionFlaggedCount, 0);
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.evidence.contradictionAssessment, 'CLEAR');
  }
});

test('L03 - verification uses the primary artifact only (no secondary-source route)', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.evidence.artifactSha256, DIRECT_EVIDENCE_ARTIFACT_SHA256, 'binds the primary artifact only');
    assert.ok(!('secondary' in r), 'no secondary-source field');
  }
});

// ============================================================
// M. DEDUP (§M) (M01-M05)
// ============================================================

test('M01 - canonical semantic keys are unique across the whole pilot', () => {
  const keys = CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => r.evidence.semanticIdentity);
  assert.strictEqual(new Set(keys).size, keys.length, 'no two pilot claims share a semantic identity');
});

test('M02 - no two canonical claims in any frozen universe share a semantic key', () => {
  const keyToIds = new Map<string, string[]>();
  const all = [...CONTENT_EXTRACTION_PILOT_CLAIMS, ...CONTROLLED_EXPANSION_CLAIMS, ...ALL_BATCH_CLAIMS];
  for (const c of all) {
    const key = canonicalClaimKey(c);
    const list = keyToIds.get(key) ?? [];
    list.push(c.claimId);
    keyToIds.set(key, list);
  }
  for (const [key, ids] of keyToIds) {
    assert.strictEqual(ids.length, 1, `semantic key collision: ${key} -> ${ids.join(',')}`);
  }
});

test('M03 - every verification record dedups CLEAR against 07C.7 / 07C.9 / 07C.10 / within-pilot', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(r.evidence.dedupAssessment, 'CLEAR', r.evidence.claimId);
  }
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.dedupCollisionCount, 0);
});

test('M04 - the additive layer created NO new canonical claims', () => {
  const universeSizes = CONTENT_EXTRACTION_PILOT_CLAIMS.length + CONTROLLED_EXPANSION_CLAIMS.length + ALL_BATCH_CLAIMS.length;
  assert.strictEqual(universeSizes, 16 + 11 + 11, 'frozen universe sizes unchanged');
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.ok(VERIFICATION_PILOT_CLAIM_IDS.includes(r.evidence.claimId), 'records only cover pilot claims');
  }
});

test('M05 - distinct pilot claims carry the stable keys implied by their scope', () => {
  const keys = new Set(CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => r.evidence.stableKey));
  assert.strictEqual(keys.size, 4, 'four distinct scope-bucket stable keys');
  assert.ok(keys.has('SRC_MATH:el-math-numbers:P1'));
  assert.ok(keys.has('SRC_MATH:el-math-numbers:P2'));
  assert.ok(keys.has('SRC_MATH:el-math-numbers:P3'));
  assert.ok(keys.has('SRC_FRENCH:el-skill-fr-writing:P2+P3'));
});

// ============================================================
// N. STATE MACHINE (§N) (N01-N05)
// ============================================================

test('N01 - every record transition is legal from its historical state', () => {
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    const c = findCanonicalClaim(r.evidence.claimId);
    assert.strictEqual(
      verificationTransitionLegal(c.verificationState, r.evidence.reviewDecision),
      true,
      `${c.verificationState} -> ${r.evidence.reviewDecision} (${r.evidence.claimId})`,
    );
  }
});

test('N02 - VERIFIED is immutable within the artifact/source version', () => {
  assert.strictEqual(verificationTransitionLegal('VERIFIED', 'VERIFIED'), false);
  assert.strictEqual(verificationTransitionLegal('VERIFIED', 'REVIEW_REQUIRED'), false);
  assert.strictEqual(verificationTransitionLegal('VERIFIED', 'REJECTED'), false);
  const r6 = findVerificationRecord('clm-p1-math-numbers-multiply-repeated-addition')!;
  const c = findCanonicalClaim('clm-p1-math-numbers-multiply-repeated-addition');
  const asVerified = { ...c, verificationState: 'VERIFIED' } as unknown as VerificationClaimSource;
  assert.strictEqual(effectiveVerificationState(asVerified, r6), 'VERIFIED', 'no silent VERIFIED -> REJECTED');
});

test('N03 - REJECTED reopens ONLY with new evidence, and 07C.11 provides none', () => {
  assert.strictEqual(verificationTransitionLegal('REJECTED', 'REVIEW_REQUIRED', false), false);
  assert.strictEqual(verificationTransitionLegal('REJECTED', 'REVIEW_REQUIRED', true), true);
  assert.strictEqual(verificationTransitionLegal('REJECTED', 'VERIFIED'), false);
  assert.strictEqual(verificationTransitionLegal('REJECTED', 'REJECTED'), false);
});

test('N04 - REJECTED was reached from REVIEW_REQUIRED (its frozen historical state)', () => {
  const c = findCanonicalClaim('clm-p1-math-numbers-multiply-repeated-addition');
  assert.strictEqual(c.verificationState, 'REVIEW_REQUIRED');
  assert.strictEqual(verificationTransitionLegal(c.verificationState, 'REJECTED'), true);
});

test('N05 - effective states cover the full closed verification state set', () => {
  const effective = new Set(CONTENT_VERIFICATION_REVIEW_RECORDS.map((r) => effectiveVerificationState(findCanonicalClaim(r.evidence.claimId), r)));
  assert.strictEqual(effective.has('VERIFIED'), true);
  assert.strictEqual(effective.has('REJECTED'), true);
  assert.strictEqual(effective.has('REVIEW_REQUIRED'), false, 'pilot has no open review claims');
});

// ============================================================
// O. LEDGER (§O) (O01-O08)
// ============================================================

test('O01 - the ledger counts derive from the six records', () => {
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.gate, '07C.11');
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.pilotClaimCount, 6);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.reviewRecordCount, 6);
});

test('O02 - decision partition reconciles to six', () => {
  const verified = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewDecision === 'VERIFIED');
  const rr = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewDecision === 'REVIEW_REQUIRED');
  const rejected = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewDecision === 'REJECTED');
  assert.strictEqual(verified.length, 5);
  assert.strictEqual(rr.length, 0);
  assert.strictEqual(rejected.length, 1);
  assert.strictEqual(
    verified.length + rr.length + rejected.length,
    CONTENT_VERIFICATION_REVIEW_RECORDS.length,
    'partition sums to the pilot',
  );
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.verifiedClaimCount, 5);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.reviewRequiredClaimCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.rejectedClaimCount, 1);
});

test('O03 - review-mode partition reconciles to six', () => {
  const single = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewMode === 'SINGLE_REVIEW').length;
  const dual = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewMode === 'DUAL_CONFIRMATION').length;
  assert.strictEqual(single, 2);
  assert.strictEqual(dual, 4);
  assert.strictEqual(single + dual, 6);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.singleReviewCount, 2);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.dualConfirmationCount, 4);
});

test('O04 - contentVerified is DERIVED and equals the verified count everywhere', () => {
  const verified = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.reviewDecision === 'VERIFIED').length;
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.contentVerifiedCount, verified);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.contentVerifiedCount, 5);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.contentVerified, CONTENT_VERIFICATION_LEDGER.contentVerifiedCount);
});

test('O05 - by-path partition sums to six', () => {
  const direct = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.evidence.extractionPath === 'DIRECT_PRIMARY_DIGITAL').length;
  const geo = CONTENT_VERIFICATION_REVIEW_RECORDS.filter(
    (r) => r.evidence.extractionPath === 'DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION',
  ).length;
  assert.strictEqual(direct, 3);
  assert.strictEqual(geo, 3);
  const total = CONTENT_VERIFICATION_LEDGER.claimsByExtractionPath.reduce((s, x) => s + x.count, 0);
  assert.strictEqual(total, 6);
  const fromLedger = new Map(CONTENT_VERIFICATION_LEDGER.claimsByExtractionPath.map((x) => [x.extractionPath, x.count]));
  assert.strictEqual(fromLedger.get('DIRECT_PRIMARY_DIGITAL'), 3);
  assert.strictEqual(fromLedger.get('DIRECT_PRIMARY_DIGITAL_WITH_GEOMETRY_ATTRIBUTION'), 3);
});

test('O06 - by-subject and by-grade partitions reconcile', () => {
  const math = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.sourceSubject === 'SRC_MATH').length;
  const fr = CONTENT_VERIFICATION_REVIEW_RECORDS.filter((r) => r.sourceSubject === 'SRC_FRENCH').length;
  assert.strictEqual(math, 5);
  assert.strictEqual(fr, 1);
  const gradeTotal = CONTENT_VERIFICATION_LEDGER.claimsByGradeAttribution.reduce((s, x) => s + x.count, 0);
  assert.strictEqual(gradeTotal, 6);
  const byGrade = new Map(CONTENT_VERIFICATION_LEDGER.claimsByGradeAttribution.map((x) => [x.gradeAttributionAssessment, x.count]));
  assert.strictEqual(byGrade.get('DIRECT_EXACT'), 2);
  assert.strictEqual(byGrade.get('STRUCTURALLY_CALIBRATED'), 2);
  assert.strictEqual(byGrade.get('BAND_SUPPORTED'), 1);
  assert.strictEqual(byGrade.get('UNRESOLVED'), 1);
});

test('O07 - by-decision-reason partition reconciles and is split-proof', () => {
  const independent = new Map<string, number>();
  for (const r of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    independent.set(r.evidence.decisionReason, (independent.get(r.evidence.decisionReason) ?? 0) + 1);
  }
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.claimsByDecisionReason.reduce((s, x) => s + x.count, 0), 6);
  for (const x of CONTENT_VERIFICATION_LEDGER.claimsByDecisionReason) {
    assert.strictEqual(independent.get(x.decisionReason), x.count, 'registry reason counts match independent recount');
  }
});

test('O08 - safety counters stay at zero (no OCR, no publication)', () => {
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.contradictionFlaggedCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.dedupCollisionCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.ocrVerifiedCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.publishedCount, 0);
});

// ============================================================
// P. GLOBAL FREEZES (§P) (P01-P06)
// ============================================================

test('P01 - the structural denominator 42/0/3/6/3/54 is preserved verbatim', () => {
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.verifiedCells, 42);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.supportedCells, 0);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.partialCells, 3);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.unknownCells, 6);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.notApplicableCells, 3);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.totalCells, 54);
  assert.strictEqual(CANONICAL_RECONCILIATION_VERDICT.structureCompleteVerified, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.denominatorFrozenVerbatim, true);
});

test('P02 - every prior gate keeps contentVerified and published at zero', () => {
  assert.strictEqual(CONTROLLED_CONTENT_EXTRACTION_VERDICT.contentVerified, 0);
  assert.strictEqual(CELL_ATTRIBUTION_REVIEW_VERDICT.contentVerifiedStaysZero, true);
  assert.strictEqual(CONTROLLED_EXPANSION_VERDICT.contentVerified, 0);
  assert.strictEqual(BATCH_VERDICT.contentVerified, 0);
  assert.strictEqual(BATCH_VERDICT.published, 0);
});

test('P03 - only the DERIVED CONTENT_VERIFIED may change, and it changes to 5', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.contentVerified, 5);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.published, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.structureCompleteVerified, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.masteryDerived, false);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.contentDenominatorKnown, false);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.completenessUnmeasurable, true);
});

test('P04 - all frozen registries are flagged untouched', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.pilotRegistryFrozen, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.reviewRegistryFrozen, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.expansionRegistryFrozen, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.batchRegistryFrozen, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.historicalClaimsUnmutated, true);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.verifiedClaimsImmutableWithinVersion, true);
});

test('P05 - safety flags on the 07C.11 verdict card are all true', () => {
  const flags = [
    CONTENT_VERIFICATION_VERDICT.sourceNativeFirst,
    CONTENT_VERIFICATION_VERDICT.applicationMappingIsSecondary,
    CONTENT_VERIFICATION_VERDICT.noSyntheticUnitsLessonsKOsOrExercises,
    CONTENT_VERIFICATION_VERDICT.noFabricatedGradeOwnership,
    CONTENT_VERIFICATION_VERDICT.noSourceTruthDuplication,
    CONTENT_VERIFICATION_VERDICT.noOcrVerifiedClaims,
  ];
  for (const f of flags) assert.strictEqual(f, true);
});

test('P06 - recommendation is exactly PASS with the protocol-proven wording', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.recommendation, 'PASS');
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.gate, '07C.11');
});

// ============================================================
// Q. SECURITY / REPO (§Q) (Q01-Q06)
// ============================================================

const REGISTRY_URL = new URL('../../../domain/constants/moroccan-primary-content-verification-registry.ts', import.meta.url);
const TYPES_URL = new URL('../../../domain/types/curriculum-source-governance.types.ts', import.meta.url);
const TEST_URL = new URL('./gate07c11-content-verification.test.ts', import.meta.url);

const Q_BS = String.fromCharCode(92);
const Q_WIN_ROOT = 'C:' + Q_BS;
const Q_DRIVE = ':' + Q_BS;
const Q_OPCODE = ['opencode'].join('') + Q_BS;
const Q_APP = ['App', 'Data'].join('');
const Q_SK = ['sk', '-'].join('');
const Q_OAK = ['OPENAI_API', 'KEY'].join('_');
const Q_PASS = ['password', ':'].join('');
const Q_SECRET = ['secret', ':'].join('');

test('Q01 - no absolute temp/export paths in the new source files', () => {
  for (const u of [REGISTRY_URL, TYPES_URL, TEST_URL]) {
    const src = readFileSync(fileURLToPath(u), 'utf8');
    assert.ok(!src.includes(Q_WIN_ROOT), 'no windows root absolute path');
    assert.ok(!src.includes(Q_DRIVE), 'no drive-letter absolute path');
    assert.ok(!src.includes(Q_OPCODE), 'no opencode temp path');
    assert.ok(!src.includes(Q_APP), 'no user profile path');
  }
});

test('Q02 - no OCR/PDF dumps, images, or artifact page transcripts are committed', () => {
  const src = readFileSync(fileURLToPath(REGISTRY_URL), 'utf8');
  const bad = /\.pdf|rendered|pdftoppm|base64|data:image|\.png|\.jpg|rowview|addsub\d+|frocr|fr_arSA|idx2\d\d|idx21[89]|idx22[01]/;
  assert.ok(!bad.test(src), 'registry holds no committed artifact dumps');
});

test('Q03 - no secrets, keys, or tokens appear in the new source files', () => {
  for (const u of [REGISTRY_URL, TYPES_URL, TEST_URL]) {
    const src = readFileSync(fileURLToPath(u), 'utf8');
    assert.ok(!src.includes(Q_SK), 'no bearer token');
    assert.ok(!src.includes(Q_OAK), 'no provider key variable');
    assert.ok(!src.includes(Q_PASS), 'no pass field');
    assert.ok(!src.includes(Q_SECRET), 'no secret marker');
  }
});

test('Q04 - no migration, DB write, or deployment code in the registry', () => {
  const src = readFileSync(fileURLToPath(REGISTRY_URL), 'utf8');
  const dangerous = /create table|INSERT INTO|supabase\.from|\.insert\(|migrat(ion|e)|npm publish|git push/;
  assert.ok(!dangerous.test(src), 'no persistence/deploy code');
});

test('Q05 - the registry composes only frozen constants (no runtime side effects)', () => {
  const src = readFileSync(fileURLToPath(REGISTRY_URL), 'utf8');
  assert.ok(!src.includes('import.meta'), 'registry itself static');
  assert.ok(!src.includes('process.env'), 'no env access in registry');
});

test('Q06 - artifact identity is hash-bound, never path-bound', () => {
  const src = readFileSync(fileURLToPath(REGISTRY_URL), 'utf8');
  assert.strictEqual(src.includes('Curriculum_Primaire'), false, 'no artifact file name committed');
  assert.strictEqual(
    CONTENT_VERIFICATION_ARTIFACT_SHA256,
    '4FC71E9D4F52C2DE8188F878D2B02A54C4615E4402640ECE804D18AA4E5FAB0F',
  );
});

console.log('');
console.log(`--- GATE 07C.11: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);

if (failed > 0) {
  console.log(`FAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  process.exit(0);
}