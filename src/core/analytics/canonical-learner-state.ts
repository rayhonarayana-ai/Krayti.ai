/**
 * Qarayti.ai — Canonical Derived Learner State
 * Gate 06C.2: Evidence-backed learner state derived exclusively from
 * authoritative observation history.
 *
 * Source of truth: learning_observation_history (append-only, server-authoritative)
 * NOT from: learner_memory, React state, mock arrays, Golden Path maps, Faheem context
 *
 * Mastery authority: NULL / NOT_DERIVED
 * Accuracy authority: derived from verified exercise interactions only
 *
 * Trusted observation types (allowlist):
 *   EXERCISE_COMPLETION — only from verified Edge Function ingestion path
 *
 * Excluded types (never contribute to derived state):
 *   LESSON_COMPLETION — untrusted participation event
 *   ADAPTIVE_GAP_REMEDIATED — untrusted/dead event
 *   ADAPTIVE_SKILL_MASTERED — untrusted client declaration
 */

import { EvidenceState } from './observation-history-interface';

/**
 * Canonical derived state for a single concept.
 *
 * Derived exclusively from EXERCISE_COMPLETION observations that have
 * verified interactionResult ('CORRECT' | 'INCORRECT') from the Edge Function.
 *
 * mastery is intentionally NULL — accuracy ≠ mastery. Do not map accuracy to mastery
 * without an authorized model (BKT, IRT, or equivalent).
 */
export interface DerivedConceptState {
  /** Canonical concept identifier from verified exercise/KO mapping */
  conceptId: string;

  /** Number of verified exercise interactions for this concept */
  verifiedInteractionCount: number;

  /** Number of verified CORRECT interactions */
  correctCount: number;

  /** Number of verified INCORRECT interactions */
  incorrectCount: number;

  /**
   * Accuracy rate: correctCount / verifiedInteractionCount.
   * This is NOT mastery. Do not treat as masteryPercent.
   * Null when no verified interactions exist.
   */
  accuracyRate: number | null;

  /** Timestamp of first verified observation for this concept */
  firstObservedAt: string | null;

  /** Timestamp of latest verified observation for this concept */
  lastObservedAt: string | null;

  /**
   * Evidence state for this concept.
   * NO_EVIDENCE: 0 verified interactions
   * INSUFFICIENT_EVIDENCE: 1 verified interaction
   * OBSERVED: 2+ verified interactions
   *
   * OBSERVED means "sufficient verified interaction history exists"
   * NOT "mastery proven".
   */
  evidenceState: EvidenceState;

  /**
   * Mastery is NOT DERIVED from exercise interactions.
   * Always null. Reserved for future Gate that introduces trusted
   * mastery derivation (BKT, IRT, or equivalent).
   */
  mastery: null;

  /**
   * Mastery confidence is NOT DERIVED.
   * Always null. Reserved for future Gate.
   */
  masteryConfidence: null;
}

/**
 * Canonical derived learner state across all concepts.
 *
 * Derived from observation history. Single source of truth for
 * evidence-backed learner state reads.
 */
export interface DerivedLearnerState {
  /** Student identifier */
  studentId: string;

  /** Map of conceptId → derived concept state */
  concepts: Map<string, DerivedConceptState>;

  /** Total verified interaction count across all concepts */
  totalVerifiedInteractions: number;

  /** Total correct across all concepts */
  totalCorrect: number;

  /** Total incorrect across all concepts */
  totalIncorrect: number;

  /** Overall accuracy: totalCorrect / totalVerifiedInteractions. Null if no interactions. */
  overallAccuracyRate: number | null;

  /** Earliest observation timestamp across all concepts */
  firstObservedAt: string | null;

  /** Latest observation timestamp across all concepts */
  lastObservedAt: string | null;

  /**
   * Overall evidence state across all concepts.
   * NO_EVIDENCE: 0 verified interactions total
   * INSUFFICIENT_EVIDENCE: 1 verified interaction total
   * OBSERVED: 2+ verified interactions total
   */
  evidenceState: EvidenceState;
}

/**
 * Canonical derived student evidence for consumers.
 *
 * Replaces the contaminated learner_memory-derived StudentLearningEvidence.
 * All fields are derived from observation history, not learner_memory.
 */
export interface CanonicalStudentEvidence {
  studentId: string;
  studentName: string;

  /**
   * Overall accuracy rate from verified exercise interactions.
   * This is NOT mastery. Do not present as masteryPercent.
   * Null when no verified interactions exist.
   */
  accuracyRate: number | null;

  /** Total verified exercise interactions */
  verifiedInteractionCount: number;

  /** Total correct interactions */
  correctCount: number;

  /** Total incorrect interactions */
  incorrectCount: number;

  /** Number of concepts with verified interactions */
  conceptsObservedCount: number;

  /** Evidence state */
  evidenceState: EvidenceState;

  /** First observation timestamp */
  firstObservedAt: string | null;

  /** Latest observation timestamp */
  lastObservedAt: string | null;

  /**
   * Mastery is NOT DERIVED. Always null.
   * Reserved for future Gate with authorized mastery model.
   */
  mastery: null;

  /**
   * Mastery confidence is NOT DERIVED. Always null.
   */
  masteryConfidence: null;

  /** Time spent (from in-memory tracker, display-only) */
  totalTimeSpentMinutes: number;

  /** Remediation efficacy rate (from in-memory tracker, display-only) */
  remediationEfficacyRate: number | null;

  /** Misconceptions cleared (from in-memory tracker, display-only) */
  frequentMisconceptionsCleared: string[];
}

/** Unknown concept IDs that must never enter derived state */
const BLOCKED_CONCEPT_IDS = new Set([
  'NO_COMPETENCY_MAPPING',
  'GAP-UNKNOWN',
  'CONCEPT-UNKNOWN',
  'lesson-unknown',
]);

/**
 * Trusted observation types that contribute to derived learner state.
 *
 * Only EXERCISE_COMPLETION with verified interactionResult from the
 * Edge Function ingestion path qualifies.
 *
 * LESSON_COMPLETION, ADAPTIVE_GAP_REMEDIATED, ADAPTIVE_SKILL_MASTERED
 * are explicitly excluded — they are untrusted participation/declaration events.
 */
const TRUSTED_OBSERVATION_TYPES = new Set([
  'EXERCISE_COMPLETION',
]);

/**
 * Gate 06C.2 — Trusted canonical observation predicate.
 *
 * An observation qualifies as trusted for canonical derivation ONLY when:
 *   1. observationType is in TRUSTED_OBSERVATION_TYPES (EXERCISE_COMPLETION)
 *   2. interactionResult is present and is 'CORRECT' or 'INCORRECT'
 *      (server-derived by Edge Function — legacy observations lack this field)
 *   3. metadata.serverGraded is true
 *      (set exclusively by Edge Function — legacy observations lack this)
 *
 * PROVENANCE ANALYSIS:
 *   - Post-Gate observations (Edge Function): have interactionResult + serverGraded=true
 *   - Legacy browser observations (pre-Gate 06B.2A): lack interactionResult and serverGraded
 *   - Forged observations via legacy Edge Function path: lack interactionResult and serverGraded
 *     (legacy path passes client metadata verbatim, does not set serverGraded)
 *
 * This function is the single provenance predicate. Do not scatter conditions elsewhere.
 */
export function isTrustedCanonicalObservation(
  observation: {
    observationType: string;
    interactionResult?: 'CORRECT' | 'INCORRECT' | null;
    metadata?: Record<string, unknown>;
  }
): boolean {
  if (!TRUSTED_OBSERVATION_TYPES.has(observation.observationType)) {
    return false;
  }

  if (observation.interactionResult !== 'CORRECT' && observation.interactionResult !== 'INCORRECT') {
    return false;
  }

  const metadata = observation.metadata || {};
  if (metadata.serverGraded !== true) {
    return false;
  }

  return true;
}

/**
 * Pure derivation function: observations → DerivedConceptState.
 *
 * Deterministic: same input produces identical output.
 * No side effects, no writes, no browser state.
 *
 * TENANT INVARIANT (Gate 06C.4.1): This function is school-agnostic by design.
 * The mandatory tenant boundary belongs BEFORE this function — the caller
 * (repository/service) must obtain a school-scoped observation set before
 * calling this function. This function does NOT filter by school_id.
 *
 * @param conceptId canonical concept identifier
 * @param observations observations for this concept (already filtered to trusted types and scoped to school by caller)
 * @returns derived concept state
 */
export function deriveConceptState(
  conceptId: string,
  observations: Array<{
    observationType: string;
    interactionResult?: 'CORRECT' | 'INCORRECT' | null;
    occurredAt: string;
    metadata?: Record<string, unknown>;
  }>
): DerivedConceptState {
  // Fail closed on unknown concepts
  if (!conceptId || BLOCKED_CONCEPT_IDS.has(conceptId)) {
    return {
      conceptId,
      verifiedInteractionCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracyRate: null,
      firstObservedAt: null,
      lastObservedAt: null,
      evidenceState: 'NO_EVIDENCE',
      mastery: null,
      masteryConfidence: null,
    };
  }

  // Filter to only trusted canonical observations (provenance-verified)
  const verifiedObservations = observations.filter(isTrustedCanonicalObservation);

  const verifiedInteractionCount = verifiedObservations.length;

  if (verifiedInteractionCount === 0) {
    return {
      conceptId,
      verifiedInteractionCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracyRate: null,
      firstObservedAt: null,
      lastObservedAt: null,
      evidenceState: 'NO_EVIDENCE',
      mastery: null,
      masteryConfidence: null,
    };
  }

  const correctCount = verifiedObservations.filter(
    (o) => o.interactionResult === 'CORRECT'
  ).length;
  const incorrectCount = verifiedInteractionCount - correctCount;

  // Sort by occurredAt for temporal ordering
  const sorted = [...verifiedObservations].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  const firstObservedAt = sorted[0].occurredAt;
  const lastObservedAt = sorted[sorted.length - 1].occurredAt;

  const accuracyRate = verifiedInteractionCount > 0
    ? Math.round((correctCount / verifiedInteractionCount) * 1000) / 1000
    : null;

  // Gate 04 evidence state philosophy:
  // 0 verified observations → NO_EVIDENCE
  // 1 verified observation → INSUFFICIENT_EVIDENCE
  // 2+ verified observations → OBSERVED
  // OBSERVED means "sufficient verified interaction history", NOT "mastery proven"
  let evidenceState: EvidenceState = 'NO_EVIDENCE';
  if (verifiedInteractionCount >= 2) {
    evidenceState = 'OBSERVED';
  } else if (verifiedInteractionCount === 1) {
    evidenceState = 'INSUFFICIENT_EVIDENCE';
  }

  return {
    conceptId,
    verifiedInteractionCount,
    correctCount,
    incorrectCount,
    accuracyRate,
    firstObservedAt,
    lastObservedAt,
    evidenceState,
    mastery: null,
    masteryConfidence: null,
  };
}

/**
 * Pure derivation function: observations[] → DerivedLearnerState.
 *
 * Deterministic: same input produces identical output.
 * No side effects, no writes, no browser state.
 *
 * TENANT INVARIANT (Gate 06C.4.1): This function is school-agnostic by design.
 * The mandatory tenant boundary belongs BEFORE this function — the caller
 * (repository/service) must obtain a school-scoped observation set before
 * calling this function. This function does NOT filter by school_id.
 *
 * @param studentId student identifier
 * @param observations all observations for this student within a single school (school-scoped by caller)
 * @returns derived learner state across all concepts
 */
export function deriveLearnerState(
  studentId: string,
  observations: Array<{
    conceptId: string;
    observationType: string;
    interactionResult?: 'CORRECT' | 'INCORRECT' | null;
    occurredAt: string;
    metadata?: Record<string, unknown>;
  }>
): DerivedLearnerState {
  // Group observations by conceptId
  const conceptMap = new Map<string, typeof observations>();
  for (const obs of observations) {
    if (!conceptMap.has(obs.conceptId)) {
      conceptMap.set(obs.conceptId, []);
    }
    conceptMap.get(obs.conceptId)!.push(obs);
  }

  const concepts = new Map<string, DerivedConceptState>();
  let totalVerifiedInteractions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let earliestAt: string | null = null;
  let latestAt: string | null = null;

  for (const [conceptId, conceptObs] of conceptMap) {
    const state = deriveConceptState(conceptId, conceptObs);
    concepts.set(conceptId, state);

    totalVerifiedInteractions += state.verifiedInteractionCount;
    totalCorrect += state.correctCount;
    totalIncorrect += state.incorrectCount;

    if (state.firstObservedAt) {
      if (!earliestAt || state.firstObservedAt < earliestAt) {
        earliestAt = state.firstObservedAt;
      }
    }
    if (state.lastObservedAt) {
      if (!latestAt || state.lastObservedAt > latestAt) {
        latestAt = state.lastObservedAt;
      }
    }
  }

  const overallAccuracyRate = totalVerifiedInteractions > 0
    ? Math.round((totalCorrect / totalVerifiedInteractions) * 1000) / 1000
    : null;

  let evidenceState: EvidenceState = 'NO_EVIDENCE';
  if (totalVerifiedInteractions >= 2) {
    evidenceState = 'OBSERVED';
  } else if (totalVerifiedInteractions === 1) {
    evidenceState = 'INSUFFICIENT_EVIDENCE';
  }

  return {
    studentId,
    concepts,
    totalVerifiedInteractions,
    totalCorrect,
    totalIncorrect,
    overallAccuracyRate,
    firstObservedAt: earliestAt,
    lastObservedAt: latestAt,
    evidenceState,
  };
}
