/**
 * Qarayti.ai — Canonical Learner State Service
 * Gate 06C.2: Reads from observation history and produces derived learner state.
 *
 * Source of truth: learning_observation_history (append-only, server-authoritative)
 * NOT from: learner_memory, React state, mock arrays, Golden Path maps
 *
 * This service is a thin async wrapper around the pure derivation functions
 * in canonical-learner-state.ts. It reads from the observation history
 * repository and delegates to the pure derivation.
 */

import { observationHistoryRepo } from './supabase-observation-history-repository';
import {
  DerivedLearnerState,
  DerivedConceptState,
  CanonicalStudentEvidence,
  deriveLearnerState,
  deriveConceptState,
} from './canonical-learner-state';
import { EvidenceState } from './observation-history-interface';

/**
 * Service for deriving canonical learner state from observation history.
 *
 * All derivation is pure and deterministic. This service only provides
 * the async observation-history read that the pure functions cannot do.
 */
export class CanonicalLearnerStateService {
  /**
   * Derive canonical learner state for a student from observation history.
   *
   * Reads ALL observations for the student, then delegates to the pure
   * deriveLearnerState function.
   *
   * @param studentId student identifier
   * @returns derived learner state, or empty state if no observations
   */
  async deriveStudentState(studentId: string): Promise<DerivedLearnerState> {
    if (!studentId) {
      throw new Error('studentId is required for deriveStudentState');
    }

    const observations = await observationHistoryRepo.getObservationsForStudent(studentId);
    return deriveLearnerState(studentId, observations || []);
  }

  /**
   * Derive canonical learner state for a specific concept.
   *
   * @param studentId student identifier
   * @param conceptId canonical concept identifier
   * @returns derived concept state
   */
  async deriveConceptState(
    studentId: string,
    conceptId: string
  ): Promise<DerivedConceptState> {
    if (!studentId) {
      throw new Error('studentId is required for deriveConceptState');
    }
    if (!conceptId) {
      throw new Error('conceptId is required for deriveConceptState');
    }

    const observations = await observationHistoryRepo.getObservationsForConcept(
      studentId,
      conceptId
    );
    return deriveConceptState(conceptId, observations || []);
  }

  /**
   * Produce canonical student evidence for consumers.
   *
   * Replaces the contaminated learner_memory-derived getStudentEvidence().
   * All fields derived from observation history, not learner_memory.
   *
   * @param studentId student identifier
   * @param tracker optional in-memory tracker for display-only metrics (time, remediation)
   * @returns canonical student evidence
   */
  async getCanonicalStudentEvidence(
    studentId: string,
    tracker?: {
      exerciseCompletions: Array<{ exerciseId: string; isCorrect: boolean; timestamp: string; topic?: string }>;
      lessonCompletions: Array<{ lessonId: string; timestamp: string }>;
      remediationAttempts: Array<{ conceptCode: string; isSuccess: boolean; misconceptionCleared?: string; timestamp: string }>;
      lastActivityTimestamp?: string;
    }
  ): Promise<CanonicalStudentEvidence> {
    if (!studentId) {
      throw new Error('studentId is required for getCanonicalStudentEvidence');
    }

    const state = await this.deriveStudentState(studentId);

    // Display-only metrics from in-memory tracker (not authoritative)
    let totalTimeSpentMinutes = 0;
    let remediationEfficacyRate: number | null = null;
    const misconceptionsSet = new Set<string>();

    if (tracker) {
      const exerciseTime = tracker.exerciseCompletions.length * 5;
      const lessonTime = tracker.lessonCompletions.length * 15;
      totalTimeSpentMinutes = exerciseTime + lessonTime;

      if (tracker.remediationAttempts.length > 0) {
        const successful = tracker.remediationAttempts.filter((r) => r.isSuccess).length;
        remediationEfficacyRate = Math.round((successful / tracker.remediationAttempts.length) * 1000) / 10;
      }

      tracker.remediationAttempts.forEach((r) => {
        if (r.isSuccess && r.misconceptionCleared) {
          misconceptionsSet.add(r.misconceptionCleared);
        }
      });
    }

    return {
      studentId,
      studentName: `Learner (${studentId.substring(0, 8)})`,
      accuracyRate: state.overallAccuracyRate,
      verifiedInteractionCount: state.totalVerifiedInteractions,
      correctCount: state.totalCorrect,
      incorrectCount: state.totalIncorrect,
      conceptsObservedCount: state.concepts.size,
      evidenceState: state.evidenceState,
      firstObservedAt: state.firstObservedAt,
      lastObservedAt: state.lastObservedAt,
      mastery: null,
      masteryConfidence: null,
      totalTimeSpentMinutes,
      remediationEfficacyRate,
      frequentMisconceptionsCleared: Array.from(misconceptionsSet),
    };
  }
}

/** Singleton instance */
export const canonicalLearnerStateService = new CanonicalLearnerStateService();
