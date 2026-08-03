/**
 * Qarayti.ai — Faheem Telemetry Engine
 * Tracks query execution metrics, latency, token usage, cost, and safety alerts
 */

import { FaheemMetrics, FaheemCostReport } from '../../../domain/types/faheem.types';
import { FaheemCostOptimizer } from '../governance/cost-optimizer';
import { logger } from '../../logging/logger';

export class FaheemTelemetry {
  private costOptimizer: FaheemCostOptimizer;
  private totalQueries = 0;
  private totalLatencyMs = 0;
  private safetyFlagsCount = 0;
  private cacheHits = 0;
  private activeSessions = new Set<string>();

  constructor(costOptimizer: FaheemCostOptimizer) {
    this.costOptimizer = costOptimizer;
  }

  public recordQuery(latencyMs: number, inputTokens: number, outputTokens: number, isSafetyFlagged: boolean, sessionId?: string): void {
    this.totalQueries += 1;
    this.totalLatencyMs += latencyMs;
    if (isSafetyFlagged) this.safetyFlagsCount += 1;
    if (sessionId) this.activeSessions.add(sessionId);

    this.costOptimizer.recordUsage(inputTokens, outputTokens);
    logger.debug('FaheemTelemetry', `Recorded query telemetry: ${latencyMs}ms, ${inputTokens + outputTokens} tokens`);
  }

  public getMetrics(): FaheemMetrics {
    const costReport: FaheemCostReport = this.costOptimizer.getCostReport();
    const avgLatencyMs = this.totalQueries > 0 ? Math.round(this.totalLatencyMs / this.totalQueries) : 0;

    return {
      totalQueries: this.totalQueries,
      avgLatencyMs,
      totalInputTokens: costReport.totalInputTokens,
      totalOutputTokens: costReport.totalOutputTokens,
      costEstimateMAD: costReport.totalCostMAD,
      safetyFlagsCount: this.safetyFlagsCount,
      cacheHitRate: this.totalQueries > 0 ? Number((this.cacheHits / this.totalQueries).toFixed(2)) : 0,
      activeSessionsCount: this.activeSessions.size,
    };
  }
}
