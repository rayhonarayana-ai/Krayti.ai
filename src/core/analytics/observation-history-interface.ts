/**
 * Qarayti.ai — Learning Observation History Interface & Types
 * Sprint 2.6: Append-Only Observation History Contract
 */

export interface LearningEvidenceObservation {
  id?: string;
  studentId: string;
  tenantId?: string;
  conceptId: string;
  observationType: string;
  evidenceSource: string;
  sourceEventId: string;
  idempotencyKey: string;
  previousMastery: number | null;
  currentMastery: number;
  delta: number | null;
  confidence: number;
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
