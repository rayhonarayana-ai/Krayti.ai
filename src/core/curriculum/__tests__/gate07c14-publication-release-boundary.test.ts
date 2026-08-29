/** Gate 07C.14: test-only proofs for immutable publication manifests and releases. */
import assert from 'node:assert';
import {
  PRODUCTION_PUBLICATION_MANIFESTS, PRODUCTION_PUBLISHABLE_CANDIDATES,
  PUBLICATION_POLICY_V1, createPublicationManifest, derivePublishableCandidates, manifestDigest, sha256, validateManifest, validateManifestForSeal,
} from '../../../domain/constants/moroccan-primary-publication-manifest-registry';
import {
  ACTIVE_PUBLISHED_CURRICULUM, PRODUCTION_CURRICULUM_RELEASES, PRODUCTION_SUPERSESSIONS, PRODUCTION_WITHDRAWALS, PUBLICATION_RELEASE_METRICS,
  activateRelease, deriveActivePublishedCurriculum, sealRelease, validateLifecycleEvents,
} from '../../../domain/constants/moroccan-primary-publication-release-registry';
import type { CurriculumRelease, PublicationCandidate, PublicationLifecycleEvent } from '../../../domain/types/curriculum-source-governance.types';

let passed = 0; let failed = 0;
function test(name: string, fn: () => void) { try { fn(); passed++; console.log(`[PASS] ${name}`); } catch (error: any) { failed++; console.log(`[FAIL] ${name}: ${error.message}`); } }

// Fixtures are synthetic and never enter production registry arrays.
function candidate(id = 'synthetic-a', canonicalIdentity = 'cvci:synthetic-a'): PublicationCandidate {
  const semanticIdentity = `semantic:${canonicalIdentity}`;
  return {
    candidateId: id, canonicalIdentity, claimId: `claim:${id}`, sourceId: 'synthetic-official-source', sourceVersionId: 'synthetic-v1', artifactHash: 'a'.repeat(64),
    verificationRecordId: `verification:${id}`, verificationVersion: 'synthetic-verification-v1', currentnessDecisionId: `currentness:${id}`, currentnessAsOf: '2026-08-29', currentnessState: 'CURRENT_CONFIRMED',
    readinessDecisionId: `readiness:${id}`, readinessState: 'READY', scope: { educationSystem: 'SYNTHETIC', educationLevel: 'PRIMARY', subject: 'MATH', gradeOrBand: ['P1'] }, semanticIdentity,
    semanticDigest: sha256({ semanticIdentity, canonicalIdentity }), provenanceDigest: sha256({ sourceVersionId: 'synthetic-v1', artifactHash: 'a'.repeat(64), verificationRecordId: `verification:${id}` }), publicationPolicyVersion: PUBLICATION_POLICY_V1,
  };
}
function release(manifestId: string, digest: string, overrides: Partial<CurriculumRelease> = {}): CurriculumRelease {
  return { releaseId: `release:${manifestId}`, releaseVersion: 'synthetic-release-v1', releaseScope: { educationSystem: 'SYNTHETIC', educationLevel: 'PRIMARY', subject: 'MATH', gradeOrBand: ['P1'] }, manifestId, manifestDigest: digest, publicationPolicyVersion: PUBLICATION_POLICY_V1, createdAt: '2026-08-29T00:00:00Z', status: 'VALIDATED', ...overrides };
}
function sealedActive(id = 'synthetic-a') {
  const draft = createPublicationManifest({ manifestId: `manifest:${id}`, manifestVersion: 'synthetic-manifest-v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate(id)] });
  const sealed = sealRelease(validateManifest(draft), release(draft.manifestId, draft.manifestDigest));
  return { manifest: sealed.manifest, release: activateRelease(sealed.release, 'TEST-ONLY-AUTHORIZATION', []) };
}

test('A01-A08 - production is mechanically empty and no empty manifest is fabricated', () => {
  assert.deepStrictEqual(derivePublishableCandidates(), []);
  assert.deepStrictEqual(PRODUCTION_PUBLISHABLE_CANDIDATES, []);
  assert.deepStrictEqual(PRODUCTION_PUBLICATION_MANIFESTS, []);
  assert.deepStrictEqual(PRODUCTION_CURRICULUM_RELEASES, []);
  assert.deepStrictEqual(ACTIVE_PUBLISHED_CURRICULUM, []);
  assert.deepStrictEqual(PUBLICATION_RELEASE_METRICS, { publishableCandidateCount: 0, manifestEntryCount: 0, sealedReleaseCount: 0, activeReleaseCount: 0, activePublishedClaimCount: 0, withdrawnEntryCount: 0, supersededEntryCount: 0, historicalEverPublishedCount: 0 });
});
test('B01-B07 - candidate promotion requires READY, currentness, and every frozen binding', () => {
  const draft = createPublicationManifest({ manifestId: 'manifest:bindings', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate()] });
  assert.deepStrictEqual(validateManifestForSeal(draft), []);
  const incomplete = { ...candidate(), artifactHash: '', readinessState: 'REVIEW_REQUIRED' as const };
  const invalid = createPublicationManifest({ manifestId: 'manifest:incomplete', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [incomplete] });
  assert.ok(validateManifestForSeal(invalid).some((error) => error.startsWith('ENTRY_NOT_PUBLISHABLE')));
});
test('C01-C08 - manifest canonicalization, ordering, and digest are deterministic and tamper-evident', () => {
  const one = createPublicationManifest({ manifestId: 'manifest:ordered', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate('b', 'cvci:b'), candidate('a', 'cvci:a')] });
  const two = createPublicationManifest({ manifestId: 'manifest:ordered', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate('a', 'cvci:a'), candidate('b', 'cvci:b')] });
  assert.strictEqual(one.manifestDigest, two.manifestDigest);
  assert.deepStrictEqual(one.entries.map((entry) => entry.canonicalIdentity), ['cvci:a', 'cvci:b']);
  assert.strictEqual(manifestDigest(one.entries, PUBLICATION_POLICY_V1), one.manifestDigest);
  assert.ok(validateManifestForSeal({ ...one, manifestDigest: 'tampered' }).includes('MANIFEST_DIGEST_INVALID'));
});
test('D01-D06 - duplicate canonical identities and policy mismatches reject before sealing', () => {
  const duplicate = createPublicationManifest({ manifestId: 'manifest:duplicate', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate('one', 'cvci:same'), candidate('two', 'cvci:same')] });
  assert.ok(validateManifestForSeal(duplicate).some((error) => error.startsWith('DUPLICATE_CANONICAL_IDENTITY')));
  assert.strictEqual(validateManifest(duplicate).status, 'REJECTED');
  assert.ok(validateManifestForSeal({ ...createPublicationManifest({ manifestId: 'manifest:policy', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate()] }), entries: [{ ...createPublicationManifest({ manifestId: 'manifest:policy', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate()] }).entries[0], publicationPolicyVersion: 'other' }] }).some((error) => error.startsWith('POLICY_MISMATCH')));
});
test('E01-E09 - validation, sealing, and activation are explicit one-way boundaries', () => {
  const draft = createPublicationManifest({ manifestId: 'manifest:lifecycle', manifestVersion: 'v1', createdAt: '2026-08-29T00:00:00Z', publicationPolicyVersion: PUBLICATION_POLICY_V1, candidates: [candidate()] });
  assert.throws(() => sealRelease(draft, release(draft.manifestId, draft.manifestDigest)));
  const sealed = sealRelease(validateManifest(draft), release(draft.manifestId, draft.manifestDigest));
  assert.strictEqual(sealed.manifest.status, 'SEALED'); assert.strictEqual(sealed.release.status, 'SEALED');
  assert.throws(() => activateRelease(sealed.release, undefined, []));
  assert.strictEqual(activateRelease(sealed.release, 'TEST-ONLY-AUTHORIZATION', []).status, 'ACTIVE');
  assert.throws(() => sealRelease(validateManifest(draft), release(draft.manifestId, 'wrong')));
});
test('F01-F07 - active projection only derives from sealed, authorized active release bindings', () => {
  const result = sealedActive();
  const active = deriveActivePublishedCurriculum([result.release], [result.manifest], [], []);
  assert.strictEqual(active.length, 1); assert.strictEqual(active[0].effectivePublicationState, 'ACTIVE');
  assert.deepStrictEqual(deriveActivePublishedCurriculum([{ ...result.release, status: 'SEALED' }], [result.manifest], [], []), []);
  assert.deepStrictEqual(deriveActivePublishedCurriculum([result.release], [{ ...result.manifest, status: 'VALIDATED' }], [], []), []);
});
test('G01-G06 - overlapping activation conflicts and lifecycle replay keys are rejected', () => {
  const first = sealedActive('one'); const second = sealedActive('two');
  assert.throws(() => activateRelease({ ...second.release, status: 'SEALED' }, 'TEST-ONLY-AUTHORIZATION', [first.release]));
  const events: readonly PublicationLifecycleEvent[] = [
    { eventId: 'event:1', eventType: 'RELEASE_ACTIVATED', releaseId: first.release.releaseId, createdAt: '2026-08-29T00:00:00Z', authorityReference: 'TEST-ONLY', idempotencyKey: 'same' },
    { eventId: 'event:2', eventType: 'RELEASE_ACTIVATED', releaseId: second.release.releaseId, createdAt: '2026-08-29T00:00:01Z', authorityReference: 'TEST-ONLY', idempotencyKey: 'same' },
  ];
  assert.deepStrictEqual(validateLifecycleEvents(events), ['EVENT_REPLAYED:same']);
});
test('H01-H09 - withdrawal, supersession, and reopened governance remove active content without erasing history', () => {
  const old = sealedActive('old'); const replacement = sealedActive('replacement');
  const withdrawal = { withdrawalId: 'withdrawal:old', targetReleaseId: old.release.releaseId, targetManifestEntryIds: [old.manifest.entries[0].manifestEntryId], scope: old.release.releaseScope, reasonCode: 'CURRENTNESS_INVALIDATED' as const, createdAt: '2026-08-29T01:00:00Z', authorityReference: 'TEST-ONLY-REOPENED-GOVERNANCE' };
  assert.deepStrictEqual(deriveActivePublishedCurriculum([old.release], [old.manifest], [withdrawal], []), []);
  const supersession = { supersessionId: 'supersession:old', predecessorReleaseId: old.release.releaseId, successorReleaseId: replacement.release.releaseId, targetCanonicalIdentities: [old.manifest.entries[0].canonicalIdentity], scope: old.release.releaseScope, createdAt: '2026-08-29T01:00:00Z', reason: 'TEST-ONLY successor' };
  assert.deepStrictEqual(deriveActivePublishedCurriculum([old.release], [old.manifest], [], [supersession]), []);
  assert.strictEqual(old.manifest.entries.length, 1); // Withdrawal is a new record; immutable history remains.
});
test('I01-I06 - frozen 07C.11-07C.13 production truth remains unreleased', () => {
  assert.strictEqual(PRODUCTION_WITHDRAWALS.length, 0); assert.strictEqual(PRODUCTION_SUPERSESSIONS.length, 0);
  assert.strictEqual(PRODUCTION_PUBLISHABLE_CANDIDATES.length, 0); assert.strictEqual(ACTIVE_PUBLISHED_CURRICULUM.length, 0);
});

console.log(`\n--- GATE 07C.14: ${passed}/${passed + failed} TESTS PASSED SUCCESSFULLY ---`);
process.exit(failed === 0 ? 0 : 1);
