/**
 * Qarayti.ai — Learning Observation History Interface & Types
 * Sprint 2.6: Append-Only Observation History Contract
 *
 * Gate 06B.2B.2.1: Verified interaction semantics.
 *
 * currentMastery: Concept mastery score (0.0–1.0). For EXERCISE_COMPLETION observations,
 *   this is set to 0 (neutral) because a single exercise outcome is NOT concept mastery.
 *   Mastery is derived later by the mastery derivation gate.
 *
 * interactionResult: Verified exercise outcome ('CORRECT' | 'INCORRECT' | null).
 *   Only populated for EXERCISE_COMPLETION observations. This is the factual record
 *   of what happened, separate from mastery claims.
 *
 * confidence: Evidence certainty (0.0–1.0). For server-graded exercises, this means
 *   "grading determinism" (1.0 = exact match grading). This does NOT mean
 *   "learner mastery confidence". Do not conflate grading certainty with learner confidence.
 */

export interface LearningEvidenceObservation {
  id?: string;
  studentId: string;
  tenantId?: string;
  schoolId?: string | null;
  conceptId: string;
  observationType: string;
  evidenceSource: string;
  sourceEventId: string;
  idempotencyKey: string;
  previousMastery: number | null;
  currentMastery: number;
  delta: number | null;
  /** Evidence certainty (grader determinism), NOT learner mastery confidence. */
  confidence: number;
  /** Gate 06B.2B.2.1: Verified exercise outcome. null for non-exercise observations. */
  interactionResult?: 'CORRECT' | 'INCORRECT' | null;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  recordedAt?: string;
}

export type EvidenceState = 'NO_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'OBSERVED';
export type LearningTrajectory = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';

export interface HistoricalEvidenceTrajectory {
  studentId: string;
  conceptId?: string;
  evidenceState: EvidenceState;
  sampleSize: number;
  earliestObservationAt: string | null;
  latestObservationAt: string | null;
  initialObservedMastery: number | null;
  latestObservedMastery: number | null;
  historicalDelta: number | null;
  trajectory: LearningTrajectory;
  averageConfidence: number;
  provenanceSources: string[];
}

export interface EvidenceBackedTeacherInsight {
  studentId: string;
  conceptId?: string;
  evidenceState: EvidenceState;
  sampleSize: number;
  emptyStateMessage: string | null;
  observation: string | null;
  pattern: string | null;
  interpretation: string | null;
  action: string | null;
  provenanceSources: string[];
  lastObservedAt: string | null;
}

export interface ILearningObservationRepository {
  recordObservation(observation: LearningEvidenceObservation): Promise<{ success: boolean; id?: string; duplicate?: boolean }>;
  getObservationsForStudent(studentId: string, limit?: number): Promise<LearningEvidenceObservation[]>;
  getObservationsForConcept(studentId: string, conceptId: string, limit?: number): Promise<LearningEvidenceObservation[]>;
  getObservationByIdempotencyKey(idempotencyKey: string): Promise<LearningEvidenceObservation | null>;
}
