/**
 * Qarayti.ai — Bayesian Knowledge Tracing (BKT) Engine
 * Standard 4-parameter BKT probabilistic update model for student mastery state.
 */

import { BKTState } from '../../domain/types/adaptive.types';

export const DEFAULT_BKT_PARAMS: BKTState = {
  pKnown: 0.25,   // Initial probability of knowing concept
  pTransit: 0.15, // Probability of learning transition per interaction
  pSlip: 0.10,    // Probability of mistake despite knowing concept
  pGuess: 0.20,   // Probability of correct answer by guessing
};

export class BKTEngine {
  /**
   * Updates student's P(Known) after an item attempt.
   * @param currentState Current BKT parameters (pKnown, pTransit, pSlip, pGuess)
   * @param isCorrect Whether the response was correct
   * @param responseTimeSeconds Time spent on question
   */
  public static updateMastery(
    currentState: BKTState = DEFAULT_BKT_PARAMS,
    isCorrect: boolean,
    responseTimeSeconds?: number
  ): BKTState {
    const { pKnown, pTransit, pSlip, pGuess } = currentState;

    // 1. Posterior probability of knowledge given observation
    let pObserved: number;

    if (isCorrect) {
      const numerator = pKnown * (1 - pSlip);
      const denominator = numerator + (1 - pKnown) * pGuess;
      pObserved = denominator > 0 ? numerator / denominator : pKnown;
    } else {
      const numerator = pKnown * pSlip;
      const denominator = numerator + (1 - pKnown) * (1 - pGuess);
      pObserved = denominator > 0 ? numerator / denominator : pKnown;
    }

    // 2. Adjust for response time (if response time is extremely fast on correct answer, might be guess; if slow & correct, high reflection)
    if (responseTimeSeconds !== undefined) {
      if (isCorrect && responseTimeSeconds < 3) {
        // Fast correct response might slightly increase guess factor weight
        pObserved = Math.max(0, pObserved - 0.05);
      }
    }

    // 3. Transition to next state: P(L_t+1) = P(L_t|Obs) + (1 - P(L_t|Obs)) * P(T)
    const pNextKnown = pObserved + (1 - pObserved) * pTransit;

    // Clamp to [0.01, 0.99]
    const clampedKnown = Math.min(0.99, Math.max(0.01, pNextKnown));

    return {
      ...currentState,
      pKnown: Number(clampedKnown.toFixed(4)),
    };
  }

  /**
   * Calculates confidence interval [lower, upper] for current BKT score.
   */
  public static calculateConfidenceInterval(pKnown: number, attemptsCount: number): [number, number] {
    const margin = Math.max(0.03, 0.40 / Math.sqrt(attemptsCount + 1));
    const lower = Math.max(0, pKnown - margin);
    const upper = Math.min(1, pKnown + margin);
    return [Number(lower.toFixed(3)), Number(upper.toFixed(3))];
  }

  /**
   * Evaluates overall node status derived from BKT pKnown score.
   */
  public static evaluateNodeStatus(pKnown: number): 'locked' | 'available' | 'in_progress' | 'mastered' | 'weak' {
    if (pKnown >= 0.85) return 'mastered';
    if (pKnown < 0.35) return 'weak';
    return 'in_progress';
  }
}
