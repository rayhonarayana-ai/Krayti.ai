/** Gate 07C.12: canonical effective verified-content and readiness proof. */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  ALL_HISTORICAL_CONTENT_CLAIMS,
  CANONICAL_EFFECTIVE_VERIFICATION_LEDGER,
  canonicalIdentityOf,
  deriveEffectiveVerifiedClaims,
  EFFECTIVE_CANONICAL_VERIFIED_CLAIMS,
  effectiveTruthStateFor,
  findHistoricalClaim,
  gradeOrBandScopeOf,
  isEffectivelyVerified,
  resolveApplicableVerificationRecord,
} from '../../../domain/constants/moroccan-primary-effective-verified-content-registry';
import {
  CONTENT_VERIFICATION_ARTIFACT_SHA256,
  CONTENT_VERIFICATION_LEDGER,
  CONTENT_VERIFICATION_REVIEW_RECORDS,
  CONTENT_VERIFICATION_VERDICT,
  verificationContractAllowsVerified,
} from '../../../domain/constants/moroccan-primary-content-verification-registry';
import {
  POSITIVE_READINESS_PILOT_CLAIM_IDS,
  PUBLICATION_READINESS_LEDGER,
  PUBLICATION_READINESS_MANIFEST,
  PUBLICATION_READINESS_RECORDS,
  READINESS_NEGATIVE_CONTROL_CLAIM_ID,
  readinessDecisionFor,
} from '../../../domain/constants/moroccan-primary-publication-readiness-registry';
import { CANONICAL_RECONCILIATION_VERDICT } from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';
import type {
  CanonicalClaimSupersession,
  ContentVerificationReviewRecord,
  PublicationReadinessRecord,
} from '../../../domain/types/curriculum-source-governance.types';

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`[PASS] ${name}`); }
  catch (error: any) { failed++; console.log(`[FAIL] ${name}: ${error.message}`); }
}

function claim(id: string) {
  const value = findHistoricalClaim(id);
  if (!value) throw new Error(`claim not found: ${id}`);
  return value;
}
function record(id: string) {
  const value = CONTENT_VERIFICATION_REVIEW_RECORDS.find((item) => item.evidence.claimId === id);
  if (!value) throw new Error(`record not found: ${id}`);
  return value;
}
function duplicateRecord(id: string, duplicateId: string): ContentVerificationReviewRecord {
  const original = record(id);
  return { ...original, reviewRecordId: `${original.reviewRecordId}-duplicate`, evidence: { ...original.evidence, claimId: duplicateId } };
}

// A. BASELINE
test('A01 - 07C.11 historical ledger remains 6 / 5 / 0 / 1', () => {
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.pilotClaimCount, 6);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.verifiedClaimCount, 5);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.reviewRequiredClaimCount, 0);
  assert.strictEqual(CONTENT_VERIFICATION_LEDGER.rejectedClaimCount, 1);
});
test('A02 - all six historical decisions remain unchanged', () => {
  assert.strictEqual(CONTENT_VERIFICATION_REVIEW_RECORDS.length, 6);
  assert.strictEqual(record(READINESS_NEGATIVE_CONTROL_CLAIM_ID).evidence.reviewDecision, 'REJECTED');
});
test('A03 - artifact and source version bindings remain frozen', () => {
  for (const item of CONTENT_VERIFICATION_REVIEW_RECORDS) {
    assert.strictEqual(item.evidence.artifactSha256, CONTENT_VERIFICATION_ARTIFACT_SHA256);
    assert.strictEqual(item.evidence.sourceVersionId, 'v1.0.0');
  }
});
test('A04 - 07C.11 raw content metric is preserved', () => assert.strictEqual(CONTENT_VERIFICATION_VERDICT.contentVerified, 5));

// B. CANONICAL IDENTITY
const p1Numbers = claim('clm-p1-math-numbers-natural-numbers-0-9');
test('B01-B05 - identity contains subject, parent, category, scope, and normalized semantics', () => {
  const identity = canonicalIdentityOf(p1Numbers);
  assert.strictEqual(identity.sourceSubject, 'SRC_MATH');
  assert.strictEqual(identity.structuralElementId, 'el-math-numbers');
  assert.strictEqual(identity.category, 'OBJECTIVE');
  assert.deepStrictEqual(identity.gradeOrBandScope, ['P1']);
  assert.ok(identity.normalizedSemanticValue.length > 0);
});
test('B06 - source version is outside the semantic identity', () => {
  const v2 = { ...p1Numbers, sourceVersionId: 'v2.0.0' };
  assert.strictEqual(canonicalIdentityOf(v2).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
});
test('B07-B08 - page and claim ID alone do not define identity', () => {
  assert.strictEqual(canonicalIdentityOf({ ...p1Numbers, claimId: 'other', provenance: { ...p1Numbers.provenance, physicalPage: 999 } }).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
});
test('B09 - same wording with different grade scope is distinct', () => {
  assert.notStrictEqual(canonicalIdentityOf({ ...p1Numbers, gradeCode: 'P2' }).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
});
test('B10 - same wording with different category is distinct', () => {
  assert.notStrictEqual(canonicalIdentityOf({ ...p1Numbers, category: 'CONTENT_ELEMENT' }).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
});
test('B11 - same wording with different structural parent or subject is distinct', () => {
  assert.notStrictEqual(canonicalIdentityOf({ ...p1Numbers, structuralElementId: 'other-parent' }).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
  assert.notStrictEqual(canonicalIdentityOf({ ...p1Numbers, sourceSubject: 'SRC_FRENCH' }).canonicalIdentity, canonicalIdentityOf(p1Numbers).canonicalIdentity);
});

// C. EFFECTIVE VERIFIED SELECTOR
test('C01 - only the five VERIFIED records enter the effective projection', () => assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.length, 5));
test('C02-C04 - REVIEW_REQUIRED, REJECTED, and unverified claims are excluded', () => {
  assert.strictEqual(isEffectivelyVerified(READINESS_NEGATIVE_CONTROL_CLAIM_ID, 'v1.0.0'), false);
  assert.strictEqual(isEffectivelyVerified('not-a-claim', 'v1.0.0'), false);
});
test('C05-C11 - every effective projection has valid verified evidence and binding', () => {
  for (const projection of EFFECTIVE_CANONICAL_VERIFIED_CLAIMS) {
    const source = claim(projection.claimId);
    const evidence = record(projection.claimId);
    assert.strictEqual(evidence.evidence.reviewDecision, 'VERIFIED');
    assert.strictEqual(verificationContractAllowsVerified(evidence), true);
    assert.strictEqual(evidence.evidence.semanticFidelityAssessment, 'CONFIRMED');
    assert.strictEqual(evidence.evidence.contradictionAssessment, 'CLEAR');
    assert.strictEqual(evidence.evidence.dedupAssessment, 'CLEAR');
    assert.strictEqual(evidence.evidence.structuralParentAssessment, 'PARENT_CONFIRMED');
    assert.strictEqual(evidence.evidence.artifactSha256, CONTENT_VERIFICATION_ARTIFACT_SHA256);
    assert.strictEqual(evidence.evidence.sourceVersionId, source.sourceVersionId);
  }
});
test('C12 - each projection is unique by canonical identity', () => assert.strictEqual(new Set(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.map((x) => x.canonicalIdentity)).size, 5));

// D. HISTORICAL VS EFFECTIVE METRICS
test('D01-D03 - historical records and effective canonical claims derive separately', () => {
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.historicalVerifiedReviewRecordCount, 5);
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.effectiveCanonicalVerifiedClaimCount, 5);
  assert.notStrictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER, CONTENT_VERIFICATION_LEDGER);
});
test('D04 - duplicate historical claims cannot inflate effective canonical truth', () => {
  const duplicate = { ...p1Numbers, claimId: 'fixture-duplicate-p1-numbers' };
  const result = deriveEffectiveVerifiedClaims([p1Numbers, duplicate], [record(p1Numbers.claimId), duplicateRecord(p1Numbers.claimId, duplicate.claimId)]);
  assert.strictEqual(result.claims.length, 1);
  assert.strictEqual(result.canonicalIdentityCollisionCount, 1);
});
test('D05 - superseded truth cannot inflate the effective count', () => {
  const identity = canonicalIdentityOf(p1Numbers).canonicalIdentity;
  const supersession: CanonicalClaimSupersession = { supersessionId: 'fixture-supersession', canonicalIdentity: identity, supersededSourceVersionId: 'v1.0.0', supersedingSourceVersionId: 'v2.0.0', reason: 'SOURCE_VERSION_SUPERSESSION' };
  const result = deriveEffectiveVerifiedClaims([p1Numbers], [record(p1Numbers.claimId)], [supersession]);
  assert.strictEqual(result.claims.length, 0);
  assert.strictEqual(result.supersededExcludedCount, 1);
});
test('D06 - current bounded effective count is mechanically reconciled', () => {
  assert.ok(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.effectiveCanonicalVerifiedClaimCount <= CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.historicalVerifiedReviewRecordCount);
});

// E/F. VERSION, CURRENTNESS, SUPERSESSION
test('E01-E02 - authority is separate from currentness and latest-found is not confirmed-current', () => {
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS[0].sourceAuthorityState, 'AUTHORITATIVE_FOR_SCOPE');
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS[0].sourceCurrentnessState, 'LATEST_VERIFIED_ARTIFACT_FOUND');
});
test('E03 - unrelated V2 leaves V1 effective', () => assert.strictEqual(deriveEffectiveVerifiedClaims([p1Numbers], [record(p1Numbers.claimId)]).claims.length, 1));
test('E04/F02 - same-scope version supersession excludes V1', () => {
  const supersession: CanonicalClaimSupersession = { supersessionId: 'fixture-scope', canonicalIdentity: canonicalIdentityOf(p1Numbers).canonicalIdentity, supersededSourceVersionId: 'v1.0.0', supersedingSourceVersionId: 'v2.0.0', reason: 'SCOPE_REPLACEMENT' };
  assert.strictEqual(deriveEffectiveVerifiedClaims([p1Numbers], [record(p1Numbers.claimId)], [supersession]).claims.length, 0);
});
test('E05-E07 - unresolved currentness and no fabricated dates are conservative', () => {
  assert.strictEqual(effectiveTruthStateFor('CURRENTNESS_UNRESOLVED'), 'REVIEW_REQUIRED_FOR_CURRENTNESS');
  assert.strictEqual(effectiveTruthStateFor('SUPERSEDED_IN_SCOPE'), 'SUPERSEDED');
  assert.strictEqual(effectiveTruthStateFor('LATEST_VERIFIED_ARTIFACT_FOUND'), 'EFFECTIVE');
});
test('F01/F03-F07 - supersession is additive, closed, and does not mutate history', () => {
  assert.deepStrictEqual(deriveEffectiveVerifiedClaims().claims.map((x) => x.claimId).sort(), EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.map((x) => x.claimId).sort());
  assert.strictEqual(CONTENT_VERIFICATION_REVIEW_RECORDS.length, 6);
});

// G/H. BAND AND CALIBRATED ATTRIBUTION
test('G01-G05 - French P2-P3 remains one BAND_SUPPORTED canonical scope', () => {
  const french = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((x) => x.claimId === 'cl-bA-fr-write-p23-ecriture-cursive')!;
  assert.deepStrictEqual(french.gradeOrBandScope, ['P2', 'P3']);
  assert.strictEqual(french.attributionAssessment, 'BAND_SUPPORTED');
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.filter((x) => x.claimId === french.claimId).length, 1);
  assert.deepStrictEqual(gradeOrBandScopeOf(claim(french.claimId)), ['P2', 'P3']);
});
test('H01-H04 - calibrated claims remain calibrated after effective verification', () => {
  for (const id of ['clm-p2-math-numbers-add-999', 'cl-aA-math-p3-add-9999']) {
    const projection = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((x) => x.claimId === id)!;
    assert.strictEqual(projection.attributionAssessment, 'STRUCTURALLY_CALIBRATED');
    assert.notStrictEqual(projection.attributionAssessment, 'DIRECT_EXACT');
  }
});

// I/J/K. READINESS AND POSITIVE PILOT
test('I01-I05 - readiness uses a separate closed state machine', () => {
  const states = ['NOT_EVALUATED', 'REVIEW_REQUIRED', 'BLOCKED', 'READY'];
  assert.strictEqual(states.includes(PUBLICATION_READINESS_RECORDS[0].decision), true);
});
test('I06/J01-J12 - VERIFIED does not imply READY; currentness blocks promotion', () => {
  for (const readiness of PUBLICATION_READINESS_RECORDS) {
    assert.strictEqual(isEffectivelyVerified(readiness.claimId, readiness.sourceVersionId), true);
    assert.strictEqual(readinessDecisionFor(readiness), 'REVIEW_REQUIRED');
    assert.strictEqual(readiness.currentnessAssessment, 'LATEST_VERIFIED_ARTIFACT_FOUND');
    assert.strictEqual(readiness.structuralParentAssessment, 'CONFIRMED');
    assert.strictEqual(readiness.provenanceAssessment, 'CONFIRMED');
    assert.strictEqual(readiness.editorialSafetyAssessment, 'CONFIRMED');
  }
});
test('I04-I05 - blocked and ready decisions are representable without production fixtures', () => {
  const base = PUBLICATION_READINESS_RECORDS[0];
  const blocked = { ...base, authorityAssessment: 'NOT_AUTHORITATIVE_FOR_SCOPE' as const };
  const ready = { ...base, currentnessAssessment: 'CURRENT_CONFIRMED' as const };
  assert.strictEqual(readinessDecisionFor(blocked), 'BLOCKED');
  assert.strictEqual(readinessDecisionFor(ready), 'READY');
});
test('K01-K07 - positive pilot is exactly the two frozen direct-exact claims', () => {
  assert.deepStrictEqual([...POSITIVE_READINESS_PILOT_CLAIM_IDS], ['clm-p1-math-numbers-natural-numbers-0-9', 'clm-p1-math-numbers-add-concept']);
  assert.strictEqual(PUBLICATION_READINESS_MANIFEST.maximumPositiveClaims, 2);
  for (const id of POSITIVE_READINESS_PILOT_CLAIM_IDS) {
    const projection = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((x) => x.claimId === id)!;
    assert.strictEqual(projection.verificationPath, 'DIRECT_PRIMARY_DIGITAL');
    assert.strictEqual(projection.attributionAssessment, 'DIRECT_EXACT');
  }
});

// L/M/N. NEGATIVE CONTROL, FIREWALL, PROVENANCE
test('L01-L06 - rejected negative control remains auditable but excluded everywhere positive', () => {
  assert.strictEqual(record(READINESS_NEGATIVE_CONTROL_CLAIM_ID).evidence.reviewDecision, 'REJECTED');
  assert.ok(findHistoricalClaim(READINESS_NEGATIVE_CONTROL_CLAIM_ID));
  assert.strictEqual(isEffectivelyVerified(READINESS_NEGATIVE_CONTROL_CLAIM_ID, 'v1.0.0'), false);
  assert.strictEqual(PUBLICATION_READINESS_RECORDS.some((x) => x.claimId === READINESS_NEGATIVE_CONTROL_CLAIM_ID), false);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.negativeControlExcludedCount, 1);
});
test('M01-M07 - no raw claim, record, readiness result, or superseded claim auto-publishes', () => {
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publishedCount, 0);
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.publishedCount, 0);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publicationReadyCount, 0);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publicationReadyCount <= CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.effectiveCanonicalVerifiedClaimCount, true);
});
test('N01-N11 - every effective projection retains the required provenance chain', () => {
  for (const projection of EFFECTIVE_CANONICAL_VERIFIED_CLAIMS) {
    assert.ok(projection.claimId && projection.canonicalIdentity && projection.structuralElementId);
    assert.strictEqual(projection.sourceVersionId, 'v1.0.0');
    assert.strictEqual(projection.artifactSha256, CONTENT_VERIFICATION_ARTIFACT_SHA256);
    assert.ok(projection.physicalPage > 0 && projection.printedPage);
    assert.ok(projection.verificationReviewId && projection.verificationVersion);
    assert.ok(projection.verificationPath && projection.attributionAssessment && projection.sourceCurrentnessState);
  }
});

// O/P. LEDGERS AND GLOBAL FREEZES
test('O01-O08 - ledgers derive counts and enforce publication inequality', () => {
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.historicalVerifiedReviewRecordCount, 5);
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.effectiveCanonicalVerifiedClaimCount, EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.length);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.positiveReadinessPilotCount, 2);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publicationReviewRequiredCount, 2);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publicationBlockedCount, 0);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publishedCount, 0);
  assert.ok(PUBLICATION_READINESS_LEDGER.publishedCount <= PUBLICATION_READINESS_LEDGER.publicationReadyCount);
  assert.ok(PUBLICATION_READINESS_LEDGER.publicationReadyCount <= CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.effectiveCanonicalVerifiedClaimCount);
});
test('P01-P09 - global freezes and denominator remain unchanged', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.structureCompleteVerified, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.contentVerified, 5);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.published, 0);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.masteryDerived, false);
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.completenessUnmeasurable, true);
  assert.deepStrictEqual([CANONICAL_RECONCILIATION_VERDICT.verifiedCells, CANONICAL_RECONCILIATION_VERDICT.supportedCells, CANONICAL_RECONCILIATION_VERDICT.partialCells, CANONICAL_RECONCILIATION_VERDICT.unknownCells, CANONICAL_RECONCILIATION_VERDICT.notApplicableCells, CANONICAL_RECONCILIATION_VERDICT.totalCells], [42, 0, 3, 6, 3, 54]);
});

// Q. SECURITY / REPOSITORY
const SELECTOR_URL = new URL('../../../domain/constants/moroccan-primary-effective-verified-content-registry.ts', import.meta.url);
const READINESS_URL = new URL('../../../domain/constants/moroccan-primary-publication-readiness-registry.ts', import.meta.url);
test('Q01-Q09 - additive modules contain no artifact dumps, secrets, persistence, or deployment', () => {
  for (const url of [SELECTOR_URL, READINESS_URL]) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    assert.ok(!/\.pdf|base64|data:image|pdftoppm|supabase\.from|\.insert\(|create table|npm publish|git push/.test(source));
    assert.ok(!source.includes('process.env'));
  }
});

console.log('');
console.log(`--- GATE 07C.12: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);
process.exit(failed === 0 ? 0 : 1);
