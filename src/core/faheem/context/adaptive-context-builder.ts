/**
 * Qarayti.ai — Adaptive Context Builder
 * Connects BKT, IRT, spaced repetition, and weakness detection into Faheem AI context
 */

import { FaheemAdaptiveState } from '../../../domain/types/faheem.types';

export class AdaptiveContextBuilder {
  private state: FaheemAdaptiveState = {
    evidenceState: 'NO_EVIDENCE',
    sampleSize: 0,
    currentMasteryLevel: null,
    bktProbability: null,
    recommendedDifficulty: 'MEDIUM',
    spacedRepetitionDueCount: 0,
    weakTopics: [],
  };

  public setEvidenceState(evidenceState: 'NO_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'OBSERVED', sampleSize: number = 0): this {
    this.state.evidenceState = evidenceState;
    this.state.sampleSize = sampleSize;
    if (evidenceState === 'NO_EVIDENCE') {
      this.state.currentMasteryLevel = null;
      this.state.bktProbability = null;
      this.state.weakTopics = [];
    }
    return this;
  }

  public setIRTState(mastery: number | null, difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'OLYMPIAD'): this {
    this.state.currentMasteryLevel = mastery;
    this.state.recommendedDifficulty = difficulty;
    if (mastery !== null) {
      this.state.evidenceState = 'OBSERVED';
    }
    return this;
  }

  public setBKTHistory(bktProbability: number | null, weakTopics: string[]): this {
    this.state.bktProbability = bktProbability;
    this.state.weakTopics = weakTopics;
    if (bktProbability !== null) {
      this.state.evidenceState = 'OBSERVED';
    }
    return this;
  }

  public setSpacedRepetitionDue(dueCount: number): this {
    this.state.spacedRepetitionDueCount = dueCount;
    return this;
  }

  public build(): FaheemAdaptiveState {
    return { ...this.state };
  }
}
