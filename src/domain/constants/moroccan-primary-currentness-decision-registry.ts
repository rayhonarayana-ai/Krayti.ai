/** Gate 07C.13 pure currentness derivation; it never mutates historical truth. */
import type {
  CurrentnessDecisionRecord,
  CurrentnessScope,
  DerivedCurrentnessReadiness,
  DerivedCurrentnessState,
  SourceCurrentnessEvidenceRecord,
} from '../types/curriculum-source-governance.types';
import { EFFECTIVE_CANONICAL_VERIFIED_CLAIMS } from './moroccan-primary-effective-verified-content-registry';
import { POSITIVE_READINESS_PILOT_CLAIM_IDS, PUBLICATION_READINESS_RECORDS } from './moroccan-primary-publication-readiness-registry';
import { P1_MATH_CURRENTNESS_SCOPE, SOURCE_CURRENTNESS_EVIDENCE_REGISTRY } from './moroccan-primary-source-currentness-evidence-registry';

const POSITIVE_CLASSES = new Set(['EXPLICIT_CURRENTNESS_CONFIRMATION', 'SCOPE_SPECIFIC_CONTINUITY', 'SUCCESSOR_EQUIVALENCE_CONFIRMED']);
const SUPERSESSION_CLASSES = new Set(['EXPLICIT_SUPERSESSION', 'SCOPE_SPECIFIC_REPLACEMENT']);

export function scopeCovers(evidence: CurrentnessScope, target: CurrentnessScope): boolean {
  const pairs: readonly (readonly [keyof CurrentnessScope, unknown])[] = [
    ['system', target.system], ['educationLevel', target.educationLevel], ['subject', target.subject], ['grade', target.grade],
    ['structuralElementId', target.structuralElementId], ['canonicalIdentity', target.canonicalIdentity],
  ];
  return pairs.every(([key, targetValue]) => {
    const evidenceValue = evidence[key];
    return evidenceValue === undefined || (targetValue !== undefined && evidenceValue === targetValue);
  }) && (!evidence.gradeBand || !target.grade || evidence.gradeBand.includes(target.grade));
}

export function deriveCurrentnessDecision(
  targetScope: CurrentnessScope,
  evidence: readonly SourceCurrentnessEvidenceRecord[] = SOURCE_CURRENTNESS_EVIDENCE_REGISTRY,
  currentnessAsOf = '2026-08-29',
): CurrentnessDecisionRecord {
  const applicable = evidence.filter((item) => scopeCovers(item.targetScope, targetScope));
  const contradictions = applicable.filter((item) => item.evidenceClass === 'CONTRADICTORY_EVIDENCE' || item.supportRole === 'CONTRADICTING');
  const supersessions = applicable.filter((item) => SUPERSESSION_CLASSES.has(item.evidenceClass) && item.authorityTier === 'TIER_1_COMPETENT_AUTHORITY');
  const positives = applicable.filter((item) =>
    POSITIVE_CLASSES.has(item.evidenceClass) &&
    item.authorityTier === 'TIER_1_COMPETENT_AUTHORITY' &&
    item.currentnessAsOf &&
    (item.evidenceClass !== 'SUCCESSOR_EQUIVALENCE_CONFIRMED' || item.recoveryState === 'RECOVERED_AUTHENTICATED'),
  );
  let currentnessState: DerivedCurrentnessState = 'CURRENTNESS_UNRESOLVED';
  let decisionReason = 'No positive, scope-specific Tier-1 currentness evidence with an as-of date is available.';
  if (contradictions.length) {
    decisionReason = 'Applicable contradictory authority evidence prevents positive currentness promotion.';
  } else if (supersessions.length) {
    currentnessState = 'SUPERSEDED_IN_SCOPE';
    decisionReason = 'Applicable Tier-1 evidence explicitly replaces this exact scope.';
  } else if (positives.length) {
    currentnessState = positives.some((item) => item.evidenceClass === 'EXPLICIT_CURRENTNESS_CONFIRMATION') ? 'CURRENT_CONFIRMED' : 'CURRENT_FOR_SCOPE';
    decisionReason = 'Applicable Tier-1 positive currentness evidence covers the queried scope and has a currentness-as-of date.';
  }
  return {
    currentnessDecisionId: `currentness-07c13-${targetScope.subject ?? 'system'}-${targetScope.grade ?? 'all'}`.toLowerCase(),
    targetSourceId: 'src-primary-curriculum-2021', targetSourceVersionId: 'v1.0.0', targetScope,
    authorityState: 'AUTHORITATIVE_FOR_SCOPE', currentnessState,
    applicabilityState: currentnessState === 'SUPERSEDED_IN_SCOPE' ? 'SUPERSEDED' : currentnessState.startsWith('CURRENT_') ? 'APPLICABLE' : 'UNRESOLVED',
    currentnessAsOf, supportingEvidenceIds: applicable.filter((item) => item.supportRole === 'SUPPORTING').map((item) => item.evidenceId),
    contradictingEvidenceIds: contradictions.map((item) => item.evidenceId), decisionReason,
    revalidationTriggers: ['NEW_OFFICIAL_SOURCE_DISCOVERED', 'EXPLICIT_AMENDMENT_OR_REPLACEMENT', 'ACADEMIC_YEAR_BOUNDARY', 'PRE_PUBLICATION_RELEASE', 'CONTRADICTORY_AUTHORITY_EVIDENCE'],
  };
}

export const P1_MATH_CURRENTNESS_DECISION = deriveCurrentnessDecision(P1_MATH_CURRENTNESS_SCOPE);

export function deriveCurrentnessReadiness(claimId: string, decision: CurrentnessDecisionRecord): DerivedCurrentnessReadiness {
  const projection = EFFECTIVE_CANONICAL_VERIFIED_CLAIMS.find((item) => item.claimId === claimId);
  const historical = PUBLICATION_READINESS_RECORDS.find((item) => item.claimId === claimId);
  const positive = decision.currentnessState === 'CURRENT_CONFIRMED' || decision.currentnessState === 'CURRENT_FOR_SCOPE';
  const allHistoricalConditionsPass = historical?.authorityAssessment === 'AUTHORITATIVE_FOR_SCOPE' && [historical.structuralParentAssessment, historical.scopeAssessment, historical.semanticSafetyAssessment, historical.provenanceAssessment, historical.contradictionAssessment, historical.dedupAssessment, historical.editorialSafetyAssessment].every((value) => value === 'CONFIRMED');
  const decisionState = projection?.effectiveVerificationState === 'VERIFIED' && positive && allHistoricalConditionsPass ? 'READY' : decision.currentnessState === 'SUPERSEDED_IN_SCOPE' ? 'BLOCKED' : 'REVIEW_REQUIRED';
  return { claimId, sourceVersionId: projection?.sourceVersionId ?? 'v1.0.0', currentnessState: decision.currentnessState, decision: decisionState, decisionReason: decisionState === 'READY' ? 'Verified claim has positive applicable currentness evidence and all frozen readiness conditions pass.' : 'Currentness evidence does not make this verified claim publication-ready; publication remains unchanged.' };
}

export const DERIVED_CURRENTNESS_READINESS: readonly DerivedCurrentnessReadiness[] = POSITIVE_READINESS_PILOT_CLAIM_IDS.map((claimId) => deriveCurrentnessReadiness(claimId, P1_MATH_CURRENTNESS_DECISION));
export const CURRENTNESS_EVIDENCE_METRICS = {
  currentnessEvidenceCount: SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.length,
  tier1EvidenceCount: SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.filter((item) => item.authorityTier === 'TIER_1_COMPETENT_AUTHORITY').length,
  tier2EvidenceCount: SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.filter((item) => item.authorityTier === 'TIER_2_OFFICIAL_INSTITUTION').length,
  unrecoveredOfficialEvidenceCount: SOURCE_CURRENTNESS_EVIDENCE_REGISTRY.filter((item) => item.recoveryState === 'OFFICIAL_SOURCE_DISCOVERED_NOT_RECOVERED').length,
  currentnessConfirmedCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.currentnessState === 'CURRENT_CONFIRMED').length,
  currentForScopeCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.currentnessState === 'CURRENT_FOR_SCOPE').length,
  currentnessUnresolvedCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.currentnessState === 'CURRENTNESS_UNRESOLVED').length,
  supersededInScopeCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.currentnessState === 'SUPERSEDED_IN_SCOPE').length,
  publicationReadyCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.decision === 'READY').length,
  publicationReviewRequiredCount: DERIVED_CURRENTNESS_READINESS.filter((item) => item.decision === 'REVIEW_REQUIRED').length,
  publishedCount: 0,
} as const;
