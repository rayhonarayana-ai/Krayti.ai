/**
 * Gate 07C.12: bounded publication-readiness assessments.
 * Readiness is downstream from effective verification and never publishes.
 */
import type {
  PublicationReadinessLedger,
  PublicationReadinessRecord,
  PublicationReadinessState,
} from '../types/curriculum-source-governance.types';

import {
  EFFECTIVE_CANONICAL_VERIFIED_CLAIMS,
  isEffectivelyVerified,
} from './moroccan-primary-effective-verified-content-registry';
import {
  CONTENT_VERIFICATION_ARTIFACT_SHA256,
  CONTENT_VERIFICATION_SOURCE_VERSION_ID,
} from './moroccan-primary-content-verification-registry';

export const PUBLICATION_READINESS_GATE = '07C.12';
export const PUBLICATION_READINESS_PILOT_ID = 'PILOT-07C12-CANONICAL-READINESS-V1';
export const PUBLICATION_READINESS_FROZEN_DATE = '2026-08-29';

export const POSITIVE_READINESS_PILOT_CLAIM_IDS: readonly string[] = [
  'clm-p1-math-numbers-natural-numbers-0-9',
  'clm-p1-math-numbers-add-concept',
] as const;

export const READINESS_NEGATIVE_CONTROL_CLAIM_ID =
  'clm-p1-math-numbers-multiply-repeated-addition';

function requireProjection(claimId: string) {
  const projection = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((item) => item.claimId === claimId);
  if (!projection) throw new Error(`Gate 07C.12: readiness pilot claim is not effectively verified: ${claimId}`);
  return projection;
}

function buildReviewRequiredAssessment(claimId: string, suffix: string): PublicationReadinessRecord {
  const projection = requireProjection(claimId);
  return {
    readinessAssessmentId: `ready-07c12-${suffix}`,
    claimId,
    canonicalIdentity: projection.canonicalIdentity,
    verificationReviewId: projection.verificationReviewId,
    sourceVersionId: projection.sourceVersionId,
    authorityAssessment: projection.sourceAuthorityState,
    currentnessAssessment: projection.sourceCurrentnessState,
    structuralParentAssessment: 'CONFIRMED',
    scopeAssessment: 'CONFIRMED',
    semanticSafetyAssessment: 'CONFIRMED',
    provenanceAssessment: 'CONFIRMED',
    contradictionAssessment: 'CONFIRMED',
    dedupAssessment: 'CONFIRMED',
    editorialSafetyAssessment: 'CONFIRMED',
    // Latest verified artifact found is enough for effective projection, not publication.
    decision: 'REVIEW_REQUIRED',
    decisionReason:
      'Effectively VERIFIED with complete claim/record provenance, but source currentness is ' +
      'LATEST_VERIFIED_ARTIFACT_FOUND rather than CURRENT_CONFIRMED; publication remains REVIEW_REQUIRED. ' +
      'This assessment neither publishes content nor changes verification truth.',
  };
}

export const PUBLICATION_READINESS_RECORDS: readonly PublicationReadinessRecord[] = [
  buildReviewRequiredAssessment('clm-p1-math-numbers-natural-numbers-0-9', '01-natural-numbers-0-9'),
  buildReviewRequiredAssessment('clm-p1-math-numbers-add-concept', '02-add-concept'),
];

export function readinessDecisionFor(record: PublicationReadinessRecord): PublicationReadinessState {
  if (record.authorityAssessment !== 'AUTHORITATIVE_FOR_SCOPE') return 'BLOCKED';
  if (record.currentnessAssessment !== 'CURRENT_CONFIRMED') return 'REVIEW_REQUIRED';
  const assessments = [
    record.structuralParentAssessment,
    record.scopeAssessment,
    record.semanticSafetyAssessment,
    record.provenanceAssessment,
    record.contradictionAssessment,
    record.dedupAssessment,
    record.editorialSafetyAssessment,
  ];
  if (assessments.includes('BLOCKED')) return 'BLOCKED';
  if (assessments.includes('REVIEW_REQUIRED')) return 'REVIEW_REQUIRED';
  return 'READY';
}

export function isPublicationReady(claimId: string, sourceVersionId: string): boolean {
  const record = PUBLICATION_READINESS_RECORDS.find(
    (item) => item.claimId === claimId && item.sourceVersionId === sourceVersionId,
  );
  return Boolean(record && isEffectivelyVerified(claimId, sourceVersionId) && readinessDecisionFor(record) === 'READY');
}

export const PUBLICATION_READY_CLAIMS = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.filter((claim) =>
  isPublicationReady(claim.claimId, claim.sourceVersionId),
);

export const PUBLICATION_READINESS_LEDGER: PublicationReadinessLedger = {
  gate: '07C.12',
  positiveReadinessPilotCount: POSITIVE_READINESS_PILOT_CLAIM_IDS.length,
  publicationReadyCount: PUBLICATION_READY_CLAIMS.length,
  publicationReviewRequiredCount: PUBLICATION_READINESS_RECORDS.filter(
    (record) => readinessDecisionFor(record) === 'REVIEW_REQUIRED',
  ).length,
  publicationBlockedCount: PUBLICATION_READINESS_RECORDS.filter(
    (record) => readinessDecisionFor(record) === 'BLOCKED',
  ).length,
  negativeControlExcludedCount: isEffectivelyVerified(
    READINESS_NEGATIVE_CONTROL_CLAIM_ID,
    CONTENT_VERIFICATION_SOURCE_VERSION_ID,
  ) ? 0 : 1,
  publishedCount: 0,
};

export const PUBLICATION_READINESS_MANIFEST = {
  pilotId: PUBLICATION_READINESS_PILOT_ID,
  selectedVerifiedClaimIds: POSITIVE_READINESS_PILOT_CLAIM_IDS,
  negativeControlClaimId: READINESS_NEGATIVE_CONTROL_CLAIM_ID,
  maximumPositiveClaims: 2,
  sourceVersions: [CONTENT_VERIFICATION_SOURCE_VERSION_ID],
  artifactSha256: CONTENT_VERIFICATION_ARTIFACT_SHA256,
  allowedVerificationRecords: PUBLICATION_READINESS_RECORDS.map((record) => record.verificationReviewId),
  scopeFrozenAt: PUBLICATION_READINESS_FROZEN_DATE,
  purpose: 'Prove canonical effective verified content and publication readiness without publication.',
} as const;
