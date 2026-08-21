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
 *
 * Gate 06C.4.1: All institutional canonical reads require mandatory schoolId.
 * schoolId is resolved from trusted school_memberships via the caller.
 * Multi-school ambiguity FAILS CLOSED — no default school, no first-membership fallback.
 * Historical NULL-school observations are excluded from institutional reads.
 */
export class CanonicalLearnerStateService {
  /**
   * Gate 06C.4.1: Derive school-scoped canonical learner state for a student.
   *
   * Reads ALL observations for the student within the specified school,
   * then delegates to the pure deriveLearnerState function.
   *
   * @param studentId student identifier
   * @param schoolId school identifier — MANDATORY for institutional canonical state
   * @returns derived learner state, or empty state if no observations
   */
  async deriveStudentState(studentId: string, schoolId: string): Promise<DerivedLearnerState> {
    if (!studentId) {
      throw new Error('studentId is required for deriveStudentState');
    }
    if (!schoolId) {
      throw new Error('schoolId is required for deriveStudentState — institutional canonical state is school-scoped');
    }

    const observations = await observationHistoryRepo.getObservationsForStudent(studentId, schoolId);
    return deriveLearnerState(studentId, observations || []);
  }

  /**
   * Gate 06C.4.1: Derive school-scoped canonical concept state.
   *
   * @param studentId student identifier
   * @param schoolId school identifier — MANDATORY
   * @param conceptId canonical concept identifier
   * @returns derived concept state
   */
  async deriveConceptState(
    studentId: string,
    schoolId: string,
    conceptId: string
  ): Promise<DerivedConceptState> {
    if (!studentId) {
      throw new Error('studentId is required for deriveConceptState');
    }
    if (!schoolId) {
      throw new Error('schoolId is required for deriveConceptState — institutional canonical state is school-scoped');
    }
    if (!conceptId) {
      throw new Error('conceptId is required for deriveConceptState');
    }

    const observations = await observationHistoryRepo.getObservationsForConcept(
      studentId,
      schoolId,
      conceptId
    );
    return deriveConceptState(conceptId, observations || []);
  }

  /**
   * Gate 06C.4.1: Produce school-scoped canonical student evidence for consumers.
   *
   * Replaces the contaminated learner_memory-derived getStudentEvidence().
   * All fields derived from observation history, not learner_memory.
   * schoolId is MANDATORY — institutional canonical state is school-scoped.
   *
   * @param studentId student identifier
   * @param schoolId school identifier — MANDATORY for institutional canonical state
   * @param tracker optional in-memory tracker for display-only metrics (time, remediation)
   * @returns canonical student evidence
   */
  async getCanonicalStudentEvidence(
    studentId: string,
    schoolId: string,
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
    if (!schoolId) {
      throw new Error('schoolId is required for getCanonicalStudentEvidence — institutional canonical state is school-scoped');
    }

    const state = await this.deriveStudentState(studentId, schoolId);

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
      // Gate 06C.4: Count only concepts with at least one TRUSTED canonical observation.
      // state.concepts.size includes concepts with only untrusted observations (NO_EVIDENCE).
      // A concept is "observed" only if evidenceState !== NO_EVIDENCE.
      conceptsObservedCount: Array.from(state.concepts.values())
        .filter((c) => c.evidenceState !== 'NO_EVIDENCE').length,
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
