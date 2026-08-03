/**
 * Qarayti.ai — Spaced Repetition Engine (SM-2 & FSRS Hybrid Model)
 * Computes optimal review intervals, ease factor dynamics, and Ebbinghaus memory retention curves.
 */

import { SpacedRepetitionCard } from '../../domain/types/adaptive.types';

export class SpacedRepetitionEngine {
  /**
   * Calculates retention probability R(t) = exp(-t / S)
   * @param elapsedDays Days passed since last review
   * @param easeFactor Card ease factor
   * @param intervalDays Card scheduled interval
   */
  public static calculateRetentionProbability(
    elapsedDays: number,
    easeFactor: number,
    intervalDays: number
  ): number {
    if (elapsedDays <= 0) return 1.0;
    // Stability S roughly equals interval * (easeFactor / 2.5)
    const stability = Math.max(0.5, intervalDays * (easeFactor / 2.5));
    const retention = Math.exp(-elapsedDays / stability);
    return Number(Math.min(1.0, Math.max(0.05, retention)).toFixed(4));
  }

  /**
   * Updates card metrics after a user review rating (0 = Blackout, 3 = Hard/Pass, 5 = Perfect).
   */
  public static updateCardReview(
    card: SpacedRepetitionCard,
    qualityScore: number // 0 to 5
  ): SpacedRepetitionCard {
    const q = Math.max(0, Math.min(5, qualityScore));
    let { easeFactor, repetitionCount, intervalDays } = card;

    // 1. Calculate new Ease Factor EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEase = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(1.3, Number(newEase.toFixed(2)));

    // 2. Compute next interval
    if (q < 3) {
      // Failed recall -> reset repetitions
      repetitionCount = 0;
      intervalDays = 1;
    } else {
      repetitionCount += 1;
      if (repetitionCount === 1) {
        intervalDays = 1;
      } else if (repetitionCount === 2) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
    }

    const now = new Date();
    const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    return {
      ...card,
      easeFactor,
      repetitionCount,
      intervalDays,
      lastReviewDate: now.toISOString(),
      nextReviewDate: nextReview.toISOString(),
      retentionProbability: 1.0, // Freshly reviewed
    };
  }

  /**
   * Checks if a card is currently due for review.
   */
  public static isCardDue(card: SpacedRepetitionCard): boolean {
    const now = new Date();
    const dueDate = new Date(card.nextReviewDate);
    return now >= dueDate || card.retentionProbability < 0.65;
  }
}
