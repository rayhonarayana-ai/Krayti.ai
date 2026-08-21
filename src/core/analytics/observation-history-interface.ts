/**
 * Qarayti.ai — Learning Observation History Interface & Types
 * Sprint 2.6: Append-Only Observation History Contract
 *
 * Gate 06B.2B.2.1: Verified interaction semantics.
 * Gate 06C.1: ALL non-exercise observations use neutral mastery sentinel.
 *
 * currentMastery: Concept mastery score (0.0–1.0). For ALL observations except
 *   server-graded exercises, this is set to 0 (neutral) because unverified events
 *   MUST NOT establish mastery. Mastery is derived from observation history by
 *   computeHistoricalTrajectory(), never claimed by event payloads.
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
  /**
   * Gate 06C.4.1: School-scoped institutional canonical read.
   * Paginates until exhaustion. Returns ALL observations for a student within a school.
   * schoolId is MANDATORY — institutional canonical state is scoped by (studentId, schoolId).
   * Observations with school_id IS NULL are excluded from institutional reads.
   * No default limit. No silent truncation.
   */
  getObservationsForStudent(studentId: string, schoolId: string): Promise<LearningEvidenceObservation[]>;
  /**
   * Gate 06C.4.1: School-scoped institutional canonical read.
   * Paginates until exhaustion. Returns ALL observations for a student+concept within a school.
   * schoolId is MANDATORY — concept state is scoped by (studentId, schoolId, conceptId).
   * Observations with school_id IS NULL are excluded from institutional reads.
   * No default limit. No silent truncation.
   */
  getObservationsForConcept(studentId: string, schoolId: string, conceptId: string): Promise<LearningEvidenceObservation[]>;
  getObservationByIdempotencyKey(idempotencyKey: string): Promise<LearningEvidenceObservation | null>;
}
