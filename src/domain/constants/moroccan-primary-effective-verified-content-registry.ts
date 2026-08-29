/**
 * Gate 07C.12: additive effective canonical verified-content projection.
 * Historical claims and 07C.11 records remain the only sources of content and
 * verification truth. This module derives a current, deduplicated projection.
 */
import type {
  BatchContentClaim,
  CanonicalClaimSupersession,
  CanonicalCurriculumIdentity,
  CanonicalEffectiveTruthState,
  CanonicalEffectiveVerificationLedger,
  CanonicalSourceAuthorityState,
  CanonicalSourceCurrentnessState,
  ContentVerificationReviewRecord,
  EffectiveCanonicalVerifiedClaim,
  ExpansionContentClaim,
  SourceContentClaim,
} from '../types/curriculum-source-governance.types';

import { ALL_BATCH_CLAIMS } from './moroccan-primary-batch-extraction-registry';
import { CONTROLLED_EXPANSION_CLAIMS } from './moroccan-primary-controlled-content-expansion-registry';
import { CONTENT_EXTRACTION_PILOT_CLAIMS } from './moroccan-primary-content-extraction-pilot-registry';
import {
  canonicalClaimKey,
  CONTENT_VERIFICATION_ARTIFACT_SHA256,
  CONTENT_VERIFICATION_REVIEW_RECORDS,
  verificationContractAllowsVerified,
} from './moroccan-primary-content-verification-registry';

export const EFFECTIVE_VERIFIED_CONTENT_GATE = '07C.12';
export type CanonicalClaimSource = SourceContentClaim | ExpansionContentClaim | BatchContentClaim;

export const CANONICAL_CONTENT_SUPERSESSIONS: readonly CanonicalClaimSupersession[] = [];

export const ALL_HISTORICAL_CONTENT_CLAIMS: readonly CanonicalClaimSource[] = [
  ...CONTENT_EXTRACTION_PILOT_CLAIMS,
  ...CONTROLLED_EXPANSION_CLAIMS,
  ...ALL_BATCH_CLAIMS,
];

function normalizedValueOf(claim: CanonicalClaimSource): string {
  const value = 'normalizedValueFr' in claim
    ? claim.normalizedValueFr
    : claim.normalizedValueAr;
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

export function gradeOrBandScopeOf(claim: CanonicalClaimSource): readonly string[] {
  if ('gradeBandScope' in claim && claim.gradeBandScope.length > 0) {
    return [...claim.gradeBandScope].sort();
  }
  if ('candidateGrade' in claim) return claim.candidateGrade ? [claim.candidateGrade] : ['UNKNOWN'];
  return [claim.gradeCode];
}

/** Source-version independent semantic identity; JSON prevents delimiter ambiguity. */
export function canonicalIdentityOf(claim: CanonicalClaimSource): CanonicalCurriculumIdentity {
  const gradeOrBandScope = gradeOrBandScopeOf(claim);
  const tuple = [
    claim.sourceSubject,
    claim.structuralElementId,
    claim.category,
    gradeOrBandScope,
    normalizedValueOf(claim),
  ];
  return {
    sourceSubject: claim.sourceSubject,
    structuralElementId: claim.structuralElementId,
    category: claim.category,
    gradeOrBandScope,
    normalizedSemanticValue: normalizedValueOf(claim),
    canonicalIdentity: `cvci:${JSON.stringify(tuple)}`,
  };
}

export function findHistoricalClaim(claimId: string): CanonicalClaimSource | undefined {
  return ALL_HISTORICAL_CONTENT_CLAIMS.find((claim) => claim.claimId === claimId);
}

export function sourceAuthorityFor(claim: CanonicalClaimSource): CanonicalSourceAuthorityState {
  return claim.sourceClassification === 'OFFICIAL_CURRICULUM_DOCUMENT'
    ? 'AUTHORITATIVE_FOR_SCOPE'
    : 'NOT_AUTHORITATIVE_FOR_SCOPE';
}

/** 2021 is latest verified artifact found, not an asserted exact effective period. */
export function sourceCurrentnessFor(_claim: CanonicalClaimSource): CanonicalSourceCurrentnessState {
  return 'LATEST_VERIFIED_ARTIFACT_FOUND';
}

export function effectiveTruthStateFor(
  currentness: CanonicalSourceCurrentnessState,
  superseded = false,
): CanonicalEffectiveTruthState {
  if (superseded || currentness === 'SUPERSEDED_IN_SCOPE') return 'SUPERSEDED';
  if (currentness === 'CURRENTNESS_UNRESOLVED') return 'REVIEW_REQUIRED_FOR_CURRENTNESS';
  return 'EFFECTIVE';
}

export function isSuperseded(
  identity: string,
  sourceVersionId: string,
  supersessions: readonly CanonicalClaimSupersession[] = CANONICAL_CONTENT_SUPERSESSIONS,
): boolean {
  return supersessions.some(
    (item) => item.canonicalIdentity === identity && item.supersededSourceVersionId === sourceVersionId,
  );
}

/** Ambiguous multiple applicable decisions never default to VERIFIED. */
export function resolveApplicableVerificationRecord(
  claim: CanonicalClaimSource,
  records: readonly ContentVerificationReviewRecord[] = CONTENT_VERIFICATION_REVIEW_RECORDS,
): ContentVerificationReviewRecord | undefined {
  const matching = records.filter((record) =>
    record.evidence.claimId === claim.claimId &&
    record.evidence.sourceVersionId === claim.sourceVersionId &&
    record.evidence.semanticIdentity === canonicalClaimKey(claim),
  );
  return matching.length === 1 ? matching[0] : undefined;
}

function recordBindsClaim(claim: CanonicalClaimSource, record: ContentVerificationReviewRecord): boolean {
  const evidence = record.evidence;
  return (
    evidence.claimId === claim.claimId &&
    evidence.sourceVersionId === claim.sourceVersionId &&
    evidence.artifactSha256 === CONTENT_VERIFICATION_ARTIFACT_SHA256 &&
    evidence.structuralElementId === claim.structuralElementId &&
    evidence.semanticIdentity === canonicalClaimKey(claim) &&
    evidence.physicalPage === claim.provenance.physicalPage &&
    evidence.printedPage === claim.provenance.printedPage
  );
}

export interface EffectiveProjectionResult {
  readonly claims: readonly EffectiveCanonicalVerifiedClaim[];
  readonly canonicalIdentityCollisionCount: number;
  readonly supersededExcludedCount: number;
}

/**
 * Selects one retained current projection per universal canonical identity.
 * Same-version multiple decisions are ambiguous; supersession is additive.
 */
export function deriveEffectiveVerifiedClaims(
  claims: readonly CanonicalClaimSource[] = ALL_HISTORICAL_CONTENT_CLAIMS,
  records: readonly ContentVerificationReviewRecord[] = CONTENT_VERIFICATION_REVIEW_RECORDS,
  supersessions: readonly CanonicalClaimSupersession[] = CANONICAL_CONTENT_SUPERSESSIONS,
): EffectiveProjectionResult {
  const candidates: EffectiveCanonicalVerifiedClaim[] = [];
  let supersededExcludedCount = 0;

  for (const claim of claims) {
    const identity = canonicalIdentityOf(claim);
    const record = resolveApplicableVerificationRecord(claim, records);
    if (!record || record.evidence.reviewDecision !== 'VERIFIED') continue;
    if (!recordBindsClaim(claim, record) || !verificationContractAllowsVerified(record)) continue;
    if (sourceAuthorityFor(claim) !== 'AUTHORITATIVE_FOR_SCOPE') continue;
    const superseded = isSuperseded(identity.canonicalIdentity, claim.sourceVersionId, supersessions);
    if (superseded) {
      supersededExcludedCount++;
      continue;
    }
    const currentness = sourceCurrentnessFor(claim);
    const truthState = effectiveTruthStateFor(currentness, superseded);
    if (truthState !== 'EFFECTIVE') continue;
    candidates.push({
      claimId: claim.claimId,
      canonicalIdentity: identity.canonicalIdentity,
      sourceVersionId: claim.sourceVersionId,
      verificationReviewId: record.reviewRecordId,
      verificationVersion: record.evidence.verificationVersion,
      effectiveVerificationState: 'VERIFIED',
      effectiveTruthState: truthState,
      sourceAuthorityState: sourceAuthorityFor(claim),
      sourceCurrentnessState: currentness,
      sourceSubject: claim.sourceSubject,
      structuralElementId: claim.structuralElementId,
      gradeOrBandScope: identity.gradeOrBandScope,
      physicalPage: claim.provenance.physicalPage,
      printedPage: claim.provenance.printedPage,
      artifactSha256: record.evidence.artifactSha256,
      verificationPath: record.evidence.extractionPath,
      attributionAssessment: record.evidence.gradeAttributionAssessment,
    });
  }

  const retained = new Map<string, EffectiveCanonicalVerifiedClaim>();
  let canonicalIdentityCollisionCount = 0;
  for (const candidate of candidates.sort((a, b) => a.claimId.localeCompare(b.claimId))) {
    if (retained.has(candidate.canonicalIdentity)) canonicalIdentityCollisionCount++;
    else retained.set(candidate.canonicalIdentity, candidate);
  }
  return {
    claims: [...retained.values()],
    canonicalIdentityCollisionCount,
    supersededExcludedCount,
  };
}

export const EFFECTIVE_CANONICAL_VERIFIED_RESULT = deriveEffectiveVerifiedClaims();
export const EFFECTIVE_CANONICAL_VERIFIED_CLAIMS = EFFECTIVE_CANONICAL_VERIFIED_RESULT.claims;

export function isEffectivelyVerified(claimId: string, sourceVersionId: string): boolean {
  return EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.some(
    (claim) => claim.claimId === claimId && claim.sourceVersionId === sourceVersionId,
  );
}

export const CANONICAL_EFFECTIVE_VERIFICATION_LEDGER: CanonicalEffectiveVerificationLedger = {
  gate: '07C.12',
  historicalVerifiedReviewRecordCount: CONTENT_VERIFICATION_REVIEW_RECORDS.filter(
    (record) => record.evidence.reviewDecision === 'VERIFIED',
  ).length,
  effectiveCanonicalVerifiedClaimCount: EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.length,
  effectiveRejectedCount: CONTENT_VERIFICATION_REVIEW_RECORDS.filter(
    (record) => record.evidence.reviewDecision === 'REJECTED',
  ).length,
  canonicalIdentityCollisionCount: EFFECTIVE_CANONICAL_VERIFIED_RESULT.canonicalIdentityCollisionCount,
  supersededExcludedCount: EFFECTIVE_CANONICAL_VERIFIED_RESULT.supersededExcludedCount,
  publishedCount: 0,
};
