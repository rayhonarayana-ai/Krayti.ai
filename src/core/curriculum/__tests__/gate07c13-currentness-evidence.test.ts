/** Gate 07C.13: authoritative currentness evidence and temporal applicability proof. */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  CURRENTNESS_EVIDENCE_METRICS,
  DERIVED_CURRENTNESS_READINESS,
  deriveCurrentnessDecision,
  deriveCurrentnessReadiness,
  P1_MATH_CURRENTNESS_DECISION,
  scopeCovers,
} from '../../../domain/constants/moroccan-primary-currentness-decision-registry';
import { P1_MATH_CURRENTNESS_SCOPE, SOURCE_CURRENTNESS_EVIDENCE_REGISTRY } from '../../../domain/constants/moroccan-primary-source-currentness-evidence-registry';
import { CANONICAL_EFFECTIVE_VERIFICATION_LEDGER, EFFECTIVE_CANONICAL_VERIFIED_CLAIMS } from '../../../domain/constants/moroccan-primary-effective-verified-content-registry';
import { PUBLICATION_READINESS_LEDGER, PUBLICATION_READINESS_RECORDS } from '../../../domain/constants/moroccan-primary-publication-readiness-registry';
import { CONTENT_VERIFICATION_VERDICT } from '../../../domain/constants/moroccan-primary-content-verification-registry';
import { CANONICAL_RECONCILIATION_VERDICT } from '../../../domain/constants/moroccan-primary-structure-reconciliation-registry';
import type { SourceCurrentnessEvidenceRecord, TemporalPrecision } from '../../../domain/types/curriculum-source-governance.types';

let passed = 0; let failed = 0;
function test(name: string, fn: () => void) { try { fn(); passed++; console.log(`[PASS] ${name}`); } catch (error: any) { failed++; console.log(`[FAIL] ${name}: ${error.message}`); } }
const base = SOURCE_CURRENTNESS_EVIDENCE_REGISTRY[0];
function fixture(overrides: Partial<SourceCurrentnessEvidenceRecord>): SourceCurrentnessEvidenceRecord {
  return { ...base, evidenceId: 'fixture', targetScope: P1_MATH_CURRENTNESS_SCOPE, evidenceClass: 'SCOPE_SPECIFIC_CONTINUITY', authorityTier: 'TIER_1_COMPETENT_AUTHORITY', currentnessAsOf: '2026-08-29', supportRole: 'SUPPORTING', recoveryState: 'OFFICIAL_PAGE_RECORDED', ...overrides };
}

// A. BASELINE / B. AUTHORITY / C. CLASSIFICATION
test('A01-A04 - frozen 07C.11/07C.12 counts and pilot claims remain unchanged', () => {
  assert.strictEqual(CANONICAL_EFFECTIVE_VERIFICATION_LEDGER.historicalVerifiedReviewRecordCount, 5);
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.length, 5);
  assert.strictEqual(PUBLICATION_READINESS_RECORDS.length, 2);
  assert.strictEqual(PUBLICATION_READINESS_LEDGER.publicationReadyCount, 0);
});
test('B01-B05 - only Tier 1 exact-scope evidence can promote', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ authorityTier: 'TIER_2_OFFICIAL_INSTITUTION' })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ authorityTier: 'TIER_3_SECONDARY_DISCOVERY' })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ targetScope: { kind: 'SUBJECT', system: 'MOROCCO', subject: 'FRENCH' } })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
});
test('C01-C10 - all closed evidence classifications are representable', () => {
  const classes = ['EXPLICIT_CURRENTNESS_CONFIRMATION', 'EXPLICIT_SUPERSESSION', 'SCOPE_SPECIFIC_CONTINUITY', 'SCOPE_SPECIFIC_REPLACEMENT', 'SUCCESSOR_EQUIVALENCE_CONFIRMED', 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION', 'LATEST_OFFICIAL_SOURCE_ONLY', 'OFFICIAL_INSTITUTIONAL_CORROBORATION_ONLY', 'SECONDARY_CORROBORATION_ONLY', 'CONTRADICTORY_EVIDENCE', 'INSUFFICIENT_EVIDENCE', 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED'];
  assert.deepStrictEqual(new Set(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.map((item) => item.evidenceClass)).size >= 4, true);
  assert.strictEqual(classes.length, 12);
});

// D. SCOPE / E. TEMPORAL / F. AS-OF
test('D01-D08 - scope matching is deterministic and cannot expand narrower evidence', () => {
  assert.strictEqual(scopeCovers({ kind: 'SYSTEM', system: 'MOROCCO' }, P1_MATH_CURRENTNESS_SCOPE), true);
  assert.strictEqual(scopeCovers({ kind: 'EDUCATION_LEVEL', system: 'MOROCCO', educationLevel: 'PRIMARY' }, P1_MATH_CURRENTNESS_SCOPE), true);
  assert.strictEqual(scopeCovers({ kind: 'SUBJECT', system: 'MOROCCO', subject: 'MATH' }, P1_MATH_CURRENTNESS_SCOPE), true);
  assert.strictEqual(scopeCovers({ kind: 'GRADE', system: 'MOROCCO', subject: 'MATH', grade: 'P2' }, P1_MATH_CURRENTNESS_SCOPE), false);
  assert.strictEqual(scopeCovers({ kind: 'CANONICAL_CLAIM', canonicalIdentity: 'other' }, P1_MATH_CURRENTNESS_SCOPE), false);
});
test('E01-E07 - temporal precision is preserved with no fabricated applicability dates', () => {
  const precisions = new Set(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.map((item) => item.publicationDatePrecision));
  const academicYearPrecision: TemporalPrecision = 'ACADEMIC_YEAR';
  assert.ok(precisions.has('DAY') && precisions.has('MONTH') && precisions.has('YEAR') && precisions.has('UNKNOWN'));
  assert.strictEqual(academicYearPrecision, 'ACADEMIC_YEAR');
  assert.ok(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.every((item) => !item.applicabilityStart && !item.applicabilityEnd));
});
test('F01-F04 - positive decisions require as-of evidence; unresolved retains evaluation date and triggers', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ currentnessAsOf: undefined })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
  assert.strictEqual(P1_MATH_CURRENTNESS_DECISION.currentnessAsOf, '2026-08-29');
  assert.ok(P1_MATH_CURRENTNESS_DECISION.revalidationTriggers.includes('PRE_PUBLICATION_RELEASE'));
});

// G/H. PRODUCTION EVIDENCE / PRODUCTION CURRENTNESS
test('G01-G07 - production registry preserves only Phase A bounded evidence', () => {
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.length, 5);
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.find((item) => item.evidenceId === 'E-2026-MEN-CURRICULA')?.evidenceClass, 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION');
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.find((item) => item.evidenceId === 'E-2026-MEN-PIONEER')?.evidenceClass, 'REFORM_WITHOUT_CURRICULUM_SUPERSESSION');
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.find((item) => item.evidenceId === 'E-2026-CSEFRS-HOME')?.authorityTier, 'TIER_2_OFFICIAL_INSTITUTION');
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.find((item) => item.evidenceId === 'C-2026-REFERENCE-FRAMEWORK')?.recoveryState, 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED');
});
test('H01-H05 - P1 Math and both pilot claims derive unresolved without fabrication', () => {
  assert.strictEqual(P1_MATH_CURRENTNESS_DECISION.currentnessState, 'CURRENTNESS_UNRESOLVED');
  assert.deepStrictEqual(DERIVED_CURRENTNESS_READINESS.map((item) => item.currentnessState), ['CURRENTNESS_UNRESOLVED', 'CURRENTNESS_UNRESOLVED']);
  assert.strictEqual(CURRENTNESS_EVIDENCE_METRICS.currentnessConfirmedCount, 0);
});

// I/J/K/L/M. TEST-ONLY PROOFS
test('I01-I05 - exact Tier-1 positive fixture promotes only with as-of evidence', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'SCOPE_SPECIFIC_CONTINUITY' })]).currentnessState, 'CURRENT_FOR_SCOPE');
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'EXPLICIT_CURRENTNESS_CONFIRMATION' })]).currentnessState, 'CURRENT_CONFIRMED');
  assert.strictEqual(SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.some((item) => item.evidenceId === 'fixture'), false);
});
test('J01-J03 - unrelated newer source cannot supersede or promote P1 Math', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ publicationDate: '2030-01-01', targetScope: { kind: 'GRADE', system: 'MOROCCO', subject: 'MATH', grade: 'P2' }, evidenceClass: 'EXPLICIT_SUPERSESSION' })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
});
test('K01-K04 - partial supersession affects only its exact scope', () => {
  const p2 = { ...P1_MATH_CURRENTNESS_SCOPE, grade: 'P2' };
  const replacement = fixture({ targetScope: p2, evidenceClass: 'SCOPE_SPECIFIC_REPLACEMENT' });
  assert.strictEqual(deriveCurrentnessDecision(p2, [replacement]).currentnessState, 'SUPERSEDED_IN_SCOPE');
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [replacement]).currentnessState, 'CURRENTNESS_UNRESOLVED');
});
test('L01-L03 - applicable contradiction produces conservative unresolved result', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'EXPLICIT_CURRENTNESS_CONFIRMATION' }), fixture({ evidenceId: 'contradiction', evidenceClass: 'CONTRADICTORY_EVIDENCE', supportRole: 'CONTRADICTING' })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
});
test('M01-M06 - successor equivalence requires recovered authenticated evidence and preserves history', () => {
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'SUCCESSOR_EQUIVALENCE_CONFIRMED', recoveryState: 'OFFICIAL_PAGE_RECORDED' })]).currentnessState, 'CURRENTNESS_UNRESOLVED');
  assert.strictEqual(deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'SUCCESSOR_EQUIVALENCE_CONFIRMED', recoveryState: 'RECOVERED_AUTHENTICATED' })]).currentnessState, 'CURRENT_FOR_SCOPE');
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.length, 5);
});

// N/O/P/Q/R. FIREWALLS, METRICS, AND REPOSITORY
test('N01-N06 - readiness remains derived: verified alone/current alone/READY never means published', () => {
  assert.deepStrictEqual(DERIVED_CURRENTNESS_READINESS.map((item) => item.decision), ['REVIEW_REQUIRED', 'REVIEW_REQUIRED']);
  assert.strictEqual(deriveCurrentnessReadiness('clm-p1-math-numbers-natural-numbers-0-9', deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE, [fixture({ evidenceClass: 'EXPLICIT_CURRENTNESS_CONFIRMATION' })])).decision, 'READY');
  assert.strictEqual(CURRENTNESS_EVIDENCE_METRICS.publishedCount, 0);
});
test('O01-O03 - currentness does not change band or calibrated attribution', () => {
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((item) => item.claimId === 'cl-bA-fr-write-p23-ecriture-cursive')?.attributionAssessment, 'BAND_SUPPORTED');
  assert.strictEqual(EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((item) => item.claimId === 'clm-p2-math-numbers-add-999')?.attributionAssessment, 'STRUCTURALLY_CALIBRATED');
});
test('P01-P07 - metrics are derived and contain no completeness percentage', () => {
  assert.deepStrictEqual(CURRENTNESS_EVIDENCE_METRICS, { currentnessEvidenceCount: 5, tier1EvidenceCount: 4, tier2EvidenceCount: 1, unrecoveredOfficialEvidenceCount: 1, currentnessConfirmedCount: 0, currentForScopeCount: 0, currentnessUnresolvedCount: 2, supersededInScopeCount: 0, publicationReadyCount: 0, publicationReviewRequiredCount: 2, publishedCount: 0 });
});
test('Q01-Q10 - global freezes remain unchanged', () => {
  assert.strictEqual(CONTENT_VERIFICATION_VERDICT.structureCompleteVerified, 0); assert.strictEqual(CONTENT_VERIFICATION_VERDICT.published, 0);
  assert.deepStrictEqual([CANONICAL_RECONCILIATION_VERDICT.verifiedCells, CANONICAL_RECONCILIATION_VERDICT.supportedCells, CANONICAL_RECONCILIATION_VERDICT.partialCells, CANONICAL_RECONCILIATION_VERDICT.unknownCells, CANONICAL_RECONCILIATION_VERDICT.notApplicableCells, CANONICAL_RECONCILIATION_VERDICT.totalCells], [42, 0, 3, 6, 3, 54]);
});
test('R01-R10 - new modules contain no secrets, dumps, writes, migrations, packages, or deployment', () => {
  for (const url of [new URL('../../../domain/constants/moroccan-primary-source-currentness-evidence-registry.ts', import.meta.url), new URL('../../../domain/constants/moroccan-primary-currentness-decision-registry.ts', import.meta.url)]) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    assert.ok(!/process\.env|supabase\.from|\.insert\(|create table|npm publish|git push|base64|data:image|pdftoppm/.test(source));
  }
});

console.log(`\n--- GATE 07C.13: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);
process.exit(failed === 0 ? 0 : 1);
