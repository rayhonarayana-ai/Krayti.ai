/**
 * Qarayti.ai — Adaptive Context Builder
 * Connects BKT, IRT, spaced repetition, and weakness detection into Faheem AI context
 */

import { FaheemAdaptiveState } from '../../../domain/types/faheem.types';

export class AdaptiveContextBuilder {
  private state: FaheemAdaptiveState = {
    currentMasteryLevel: 0.78,
    bktProbability: 0.82,
    recommendedDifficulty: 'HARD',
    spacedRepetitionDueCount: 4,
    weakTopics: ['Nombres Complexes - Forme Exponentielle', 'Ondes Lumineuses'],
  };

  public setIRTState(mastery: number, difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'OLYMPIAD'): this {
    this.state.currentMasteryLevel = mastery;
    this.state.recommendedDifficulty = difficulty;
    return this;
  }

  public setBKTHistory(bktProbability: number, weakTopics: string[]): this {
    this.state.bktProbability = bktProbability;
    this.state.weakTopics = weakTopics;
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
