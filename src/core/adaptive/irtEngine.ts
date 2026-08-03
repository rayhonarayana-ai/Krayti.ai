/**
 * Qarayti.ai — Item Response Theory (IRT) & Difficulty Prediction Engine
 * Implements 2PL/3PL Logistic IRT model to predict response success probability
 * and estimate student latent ability parameter theta (θ).
 */

import { DifficultyPrediction, IRTItemParameters } from '../../domain/types/adaptive.types';

export class IRTEngine {
  /**
   * Calculates probability of correct response using 2PL/3PL IRT model:
   * P(θ) = c + (1 - c) / (1 + exp(-α * (θ - β)))
   */
  public static predictSuccessProbability(
    studentTheta: number,
    itemBeta: number,
    itemAlpha: number = 1.2,
    itemGamma: number = 0.05
  ): number {
    const exponent = -itemAlpha * (studentTheta - itemBeta);
    const logistic = 1 / (1 + Math.exp(exponent));
    const probability = itemGamma + (1 - itemGamma) * logistic;
    return Number(Math.min(0.99, Math.max(0.01, probability)).toFixed(4));
  }

  /**
   * Generates a full difficulty prediction descriptor for a given node/item and student ability.
   */
  public static predictDifficulty(
    studentTheta: number,
    itemParams: IRTItemParameters
  ): DifficultyPrediction {
    const prob = this.predictSuccessProbability(
      studentTheta,
      itemParams.difficultyBeta,
      itemParams.discriminationAlpha,
      itemParams.pseudoguessingGamma
    );

    // Difficulty Rating classification
    let rating: DifficultyPrediction['difficultyRating'] = 'Moderate';
    if (prob > 0.85) rating = 'Very Easy';
    else if (prob > 0.70) rating = 'Easy';
    else if (prob > 0.50) rating = 'Moderate';
    else if (prob > 0.35) rating = 'Challenging';
    else if (prob > 0.20) rating = 'Hard';
    else rating = 'Extreme';

    // Estimated expected response time based on difficulty gap (theta - beta)
    const diffGap = itemParams.difficultyBeta - studentTheta;
    const recommendedTimeSeconds = Math.round(Math.max(30, 90 + diffGap * 45));

    return {
      nodeId: itemParams.nodeId,
      questionId: itemParams.questionId,
      studentTheta,
      itemDifficultyBeta: itemParams.difficultyBeta,
      itemDiscriminationAlpha: itemParams.discriminationAlpha,
      predictedProbability: prob,
      confidenceLevel: Number((0.85 + Math.abs(studentTheta) * 0.05).toFixed(2)),
      recommendedTimeSeconds,
      difficultyRating: rating,
    };
  }

  /**
   * Updates student's ability estimate theta based on item response outcome.
   */
  public static updateAbilityTheta(
    currentTheta: number,
    itemBeta: number,
    itemAlpha: number,
    isCorrect: boolean
  ): number {
    const predicted = this.predictSuccessProbability(currentTheta, itemBeta, itemAlpha);
    const outcome = isCorrect ? 1.0 : 0.0;
    // Step update proportional to discrimination alpha and prediction error
    const learningStep = 0.15 * itemAlpha * (outcome - predicted);
    const newTheta = currentTheta + learningStep;
    return Number(Math.min(3.0, Math.max(-3.0, newTheta)).toFixed(3));
  }
}
