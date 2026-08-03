/**
 * Qarayti.ai — AI Cost Optimizer
 * Tracks token usage, calculates cost in USD and MAD, and provides optimization recommendations
 */

import { FaheemCostReport } from '../../../domain/types/faheem.types';
import { logger } from '../../logging/logger';

export class FaheemCostOptimizer {
  // Model pricing (per 1M tokens) - gemini-3.6-flash pricing
  private static INPUT_COST_PER_M_USD = 0.075;
  private static OUTPUT_COST_PER_M_USD = 0.30;
  private static USD_TO_MAD_RATE = 10.1; // Official MAD exchange rate

  private totalInputTokens = 0;
  private totalOutputTokens = 0;
  private totalQueries = 0;

  public recordUsage(inputTokens: number, outputTokens: number): void {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
    this.totalQueries += 1;

    logger.debug(
      'FaheemCostOptimizer',
      `Recorded usage: +${inputTokens} in / +${outputTokens} out. Total queries: ${this.totalQueries}`
    );
  }

  public getCostReport(): FaheemCostReport {
    const inputCostUSD = (this.totalInputTokens / 1_000_000) * FaheemCostOptimizer.INPUT_COST_PER_M_USD;
    const outputCostUSD = (this.totalOutputTokens / 1_000_000) * FaheemCostOptimizer.OUTPUT_COST_PER_M_USD;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    const totalCostMAD = totalCostUSD * FaheemCostOptimizer.USD_TO_MAD_RATE;

    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalCostUSD: Number(totalCostUSD.toFixed(6)),
      totalCostMAD: Number(totalCostMAD.toFixed(4)),
      queryCount: this.totalQueries,
    };
  }
}
