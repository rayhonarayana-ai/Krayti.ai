/** Gate 07C.14: pure publication-candidate and immutable-manifest domain layer. */
import { createHash } from 'node:crypto';
import type {
  PublicationCandidate, PublicationManifest, PublicationManifestEntry, PublicationPolicyVersion,
  PublicationReleaseScope, SourceCurrentnessEvidenceRecord,
} from '../types/curriculum-source-governance.types';
import { DERIVED_CURRENTNESS_READINESS, P1_MATH_CURRENTNESS_DECISION } from './moroccan-primary-currentness-decision-registry';
import { EFFECTIVE_CANONICAL_VERIFIED_CLAIMS } from './moroccan-primary-effective-verified-content-registry';

export const PUBLICATION_POLICY_V1: PublicationPolicyVersion = '07C14-POLICY-V1';
export const PRODUCTION_PUBLICATION_MANIFESTS: readonly PublicationManifest[] = [];

function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value.normalize('NFC'));
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`).join(',')}}`;
}

export function sha256(value: unknown): string {
  return createHash('sha256').update(canonicalize(value), 'utf8').digest('hex');
}

export function scopeKey(scope: PublicationReleaseScope): string {
  return canonicalize({ ...scope, gradeOrBand: scope.gradeOrBand ? [...scope.gradeOrBand].sort() : null });
}

export function scopesOverlap(left: PublicationReleaseScope, right: PublicationReleaseScope): boolean {
  if (left.educationSystem !== right.educationSystem) return false;
  if (left.educationLevel && right.educationLevel && left.educationLevel !== right.educationLevel) return false;
  if (left.subject && right.subject && left.subject !== right.subject) return false;
  if (left.gradeOrBand && right.gradeOrBand && !left.gradeOrBand.some((grade) => right.gradeOrBand!.includes(grade))) return false;
  return true;
}

export function candidateIsPublishable(candidate: PublicationCandidate): boolean {
  return candidate.readinessState === 'READY' &&
    (candidate.currentnessState === 'CURRENT_CONFIRMED' || candidate.currentnessState === 'CURRENT_FOR_SCOPE') &&
    Boolean(candidate.canonicalIdentity && candidate.claimId && candidate.sourceId && candidate.sourceVersionId && candidate.artifactHash && candidate.verificationRecordId && candidate.currentnessDecisionId && candidate.currentnessAsOf && candidate.readinessDecisionId && candidate.semanticDigest && candidate.provenanceDigest && candidate.publicationPolicyVersion);
}

/** Production selection is intentionally empty because 07C.13 derives no READY pilot. */
export function derivePublishableCandidates(): readonly PublicationCandidate[] {
  return DERIVED_CURRENTNESS_READINESS.flatMap((readiness) => {
    if (readiness.decision !== 'READY') return [];
    const projection = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((item) => item.claimId === readiness.claimId);
    if (!projection) return [];
    const scope: PublicationReleaseScope = { educationSystem: 'MOROCCO', educationLevel: 'PRIMARY', subject: 'MATH', gradeOrBand: projection.gradeOrBandScope };
    const semanticIdentity = projection.canonicalIdentity;
    const candidate: PublicationCandidate = {
      candidateId: `candidate-07c14-${projection.claimId}`, canonicalIdentity: projection.canonicalIdentity, claimId: projection.claimId,
      sourceId: 'src-primary-curriculum-2021', sourceVersionId: projection.sourceVersionId, artifactHash: projection.artifactSha256,
      verificationRecordId: projection.verificationReviewId, verificationVersion: projection.verificationVersion,
      currentnessDecisionId: P1_MATH_CURRENTNESS_DECISION.currentnessDecisionId, currentnessAsOf: P1_MATH_CURRENTNESS_DECISION.currentnessAsOf,
      currentnessState: P1_MATH_CURRENTNESS_DECISION.currentnessState, readinessDecisionId: `readiness-07c13-${projection.claimId}`,
      readinessState: readiness.decision, scope, semanticIdentity,
      semanticDigest: sha256({ semanticIdentity, canonicalIdentity: projection.canonicalIdentity }),
      provenanceDigest: sha256({ sourceVersionId: projection.sourceVersionId, artifactHash: projection.artifactSha256, verificationRecordId: projection.verificationReviewId }),
      publicationPolicyVersion: PUBLICATION_POLICY_V1,
    };
    return candidateIsPublishable(candidate) ? [candidate] : [];
  });
}

export const PRODUCTION_PUBLISHABLE_CANDIDATES = derivePublishableCandidates();

export function manifestEntryFrom(candidate: PublicationCandidate, manifestId: string): PublicationManifestEntry {
  return { ...candidate, manifestEntryId: `${manifestId}:entry:${candidate.candidateId}` };
}

function orderedEntries(entries: readonly PublicationManifestEntry[]): readonly PublicationManifestEntry[] {
  return [...entries].sort((a, b) => `${a.canonicalIdentity}|${scopeKey(a.scope)}|${a.claimId}`.localeCompare(`${b.canonicalIdentity}|${scopeKey(b.scope)}|${b.claimId}`));
}

export function manifestDigest(entries: readonly PublicationManifestEntry[], policy: PublicationPolicyVersion): string {
  return sha256({ publicationPolicyVersion: policy, entries: orderedEntries(entries) });
}

export function createPublicationManifest(input: Omit<PublicationManifest, 'entries' | 'entryCount' | 'manifestDigest' | 'status'> & { readonly candidates: readonly PublicationCandidate[] }): PublicationManifest {
  const entries = orderedEntries(input.candidates.map((candidate) => manifestEntryFrom(candidate, input.manifestId)));
  return { manifestId: input.manifestId, manifestVersion: input.manifestVersion, createdAt: input.createdAt, publicationPolicyVersion: input.publicationPolicyVersion, previousManifestId: input.previousManifestId, entries, entryCount: entries.length, manifestDigest: manifestDigest(entries, input.publicationPolicyVersion), status: 'DRAFT' };
}

export function validateManifestForSeal(manifest: PublicationManifest): readonly string[] {
  const errors: string[] = [];
  if (manifest.entryCount !== manifest.entries.length || manifest.entryCount === 0) errors.push('MANIFEST_ENTRIES_INVALID');
  if (manifest.manifestDigest !== manifestDigest(manifest.entries, manifest.publicationPolicyVersion)) errors.push('MANIFEST_DIGEST_INVALID');
  const seen = new Set<string>();
  for (const entry of manifest.entries) {
    if (!candidateIsPublishable(entry)) errors.push(`ENTRY_NOT_PUBLISHABLE:${entry.manifestEntryId}`);
    if (entry.publicationPolicyVersion !== manifest.publicationPolicyVersion) errors.push(`POLICY_MISMATCH:${entry.manifestEntryId}`);
    const key = `${entry.canonicalIdentity}|${scopeKey(entry.scope)}`;
    if (seen.has(key)) errors.push(`DUPLICATE_CANONICAL_IDENTITY:${key}`);
    seen.add(key);
  }
  return errors;
}

export function validateManifest(manifest: PublicationManifest): PublicationManifest {
  const errors = validateManifestForSeal(manifest);
  return { ...manifest, status: errors.length === 0 ? 'VALIDATED' : 'REJECTED' };
}
