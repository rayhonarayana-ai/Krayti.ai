/** Gate 07C.14: pure immutable release lifecycle and active projection. */
import type {
  ActivePublishedCurriculumEntry, CurriculumRelease, PublicationManifest, PublicationReleaseScope,
  PublicationLifecycleEvent, PublicationSupersessionRecord, PublicationWithdrawalRecord,
} from '../types/curriculum-source-governance.types';
import { PRODUCTION_PUBLICATION_MANIFESTS, PRODUCTION_PUBLISHABLE_CANDIDATES, scopesOverlap, validateManifestForSeal } from './moroccan-primary-publication-manifest-registry';

export const PRODUCTION_CURRICULUM_RELEASES: readonly CurriculumRelease[] = [];
export const PRODUCTION_WITHDRAWALS: readonly PublicationWithdrawalRecord[] = [];
export const PRODUCTION_SUPERSESSIONS: readonly PublicationSupersessionRecord[] = [];

export function canTransitionRelease(from: CurriculumRelease['status'], to: CurriculumRelease['status']): boolean {
  return ({ DRAFT: ['VALIDATED', 'REJECTED'], VALIDATED: ['SEALED', 'REJECTED'], SEALED: ['ACTIVE', 'WITHDRAWN'], ACTIVE: ['SUPERSEDED', 'WITHDRAWN'], SUPERSEDED: [], WITHDRAWN: [], REJECTED: [] } as const)[from].includes(to as never);
}

export function sealRelease(manifest: PublicationManifest, release: CurriculumRelease): { readonly manifest: PublicationManifest; readonly release: CurriculumRelease } {
  if (manifest.status !== 'VALIDATED' || validateManifestForSeal(manifest).length > 0) throw new Error('Manifest must be validated before sealing.');
  if (release.status !== 'VALIDATED' || release.manifestId !== manifest.manifestId || release.manifestDigest !== manifest.manifestDigest || release.publicationPolicyVersion !== manifest.publicationPolicyVersion) throw new Error('Release binding is invalid for sealing.');
  return { manifest: { ...manifest, status: 'SEALED' }, release: { ...release, status: 'SEALED', sealedAt: release.sealedAt ?? release.createdAt } };
}

export function activateRelease(release: CurriculumRelease, authorization: string | undefined, activeReleases: readonly CurriculumRelease[]): CurriculumRelease {
  if (release.status !== 'SEALED' || !authorization) throw new Error('Activation requires a sealed release and explicit authorization.');
  if (activeReleases.some((item) => item.status === 'ACTIVE' && scopesOverlap(item.releaseScope, release.releaseScope))) throw new Error('Activation conflicts with an active overlapping release.');
  return { ...release, status: 'ACTIVE', activatedAt: release.activatedAt ?? release.sealedAt ?? release.createdAt };
}

/** Persistent idempotency is an operational concern; this pure guard rejects replayed event keys. */
export function validateLifecycleEvents(events: readonly PublicationLifecycleEvent[]): readonly string[] {
  const keys = new Set<string>();
  const errors: string[] = [];
  for (const event of events) {
    if (!event.authorityReference || !event.idempotencyKey) errors.push(`EVENT_AUTHORIZATION_INVALID:${event.eventId}`);
    if (keys.has(event.idempotencyKey)) errors.push(`EVENT_REPLAYED:${event.idempotencyKey}`);
    keys.add(event.idempotencyKey);
  }
  return errors;
}

export function deriveActivePublishedCurriculum(
  releases: readonly CurriculumRelease[], manifests: readonly PublicationManifest[], withdrawals: readonly PublicationWithdrawalRecord[], supersessions: readonly PublicationSupersessionRecord[],
): readonly ActivePublishedCurriculumEntry[] {
  const manifestById = new Map(manifests.map((manifest) => [manifest.manifestId, manifest]));
  const active: ActivePublishedCurriculumEntry[] = [];
  for (const release of releases.filter((item) => item.status === 'ACTIVE')) {
    const manifest = manifestById.get(release.manifestId);
    if (!manifest || manifest.status !== 'SEALED' || manifest.manifestDigest !== release.manifestDigest) continue;
    for (const entry of manifest.entries) {
      const withdrawn = withdrawals.some((item) => item.targetReleaseId === release.releaseId && item.targetManifestEntryIds.includes(entry.manifestEntryId));
      const superseded = supersessions.some((item) => item.predecessorReleaseId === release.releaseId && item.targetCanonicalIdentities.includes(entry.canonicalIdentity) && scopesOverlap(item.scope, entry.scope));
      if (withdrawn || superseded) continue;
      if (active.some((item) => item.canonicalIdentity === entry.canonicalIdentity && scopesOverlap(item.scope, entry.scope))) throw new Error('Duplicate active canonical identity.');
      active.push({ publishedCurriculumId: `published:${release.releaseId}:${entry.manifestEntryId}`, releaseId: release.releaseId, manifestId: manifest.manifestId, manifestEntryId: entry.manifestEntryId, canonicalIdentity: entry.canonicalIdentity, scope: entry.scope, semanticIdentity: entry.semanticIdentity, semanticDigest: entry.semanticDigest, sourceId: entry.sourceId, sourceVersionId: entry.sourceVersionId, artifactHash: entry.artifactHash, publicationPolicyVersion: entry.publicationPolicyVersion, effectivePublicationState: 'ACTIVE' });
    }
  }
  return active;
}

export const ACTIVE_PUBLISHED_CURRICULUM = deriveActivePublishedCurriculum(PRODUCTION_CURRICULUM_RELEASES, [], PRODUCTION_WITHDRAWALS, PRODUCTION_SUPERSESSIONS);
export const PUBLICATION_RELEASE_METRICS = {
  publishableCandidateCount: PRODUCTION_PUBLISHABLE_CANDIDATES.length,
  manifestEntryCount: PRODUCTION_PUBLICATION_MANIFESTS.reduce((count, manifest) => count + manifest.entries.length, 0),
  sealedReleaseCount: PRODUCTION_CURRICULUM_RELEASES.filter((item) => item.status === 'SEALED').length,
  activeReleaseCount: PRODUCTION_CURRICULUM_RELEASES.filter((item) => item.status === 'ACTIVE').length,
  activePublishedClaimCount: ACTIVE_PUBLISHED_CURRICULUM.length,
  withdrawnEntryCount: PRODUCTION_WITHDRAWALS.reduce((count, item) => count + item.targetManifestEntryIds.length, 0),
  supersededEntryCount: PRODUCTION_SUPERSESSIONS.reduce((count, item) => count + item.targetCanonicalIdentities.length, 0),
  historicalEverPublishedCount: PRODUCTION_CURRICULUM_RELEASES.filter((item) => item.status === 'ACTIVE' || item.status === 'SUPERSEDED' || item.status === 'WITHDRAWN').length,
} as const;
