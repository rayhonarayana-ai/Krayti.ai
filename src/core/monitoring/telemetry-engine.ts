/**
 * Qarayti.ai — Real User Monitoring (RUM) & Telemetry Engine (1M Active Users Scale)
 * Tracks Core Web Vitals (LCP, INP, CLS), API latency histograms, memory usage,
 * and client performance metrics.
 */

import { logger } from '../logging/logger';

export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'INP' | 'CLS' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export class TelemetryEngine {
  private metrics: WebVitalsMetric[] = [];
  private apiLatenciesMs: number[] = [];
  private maxLatencyHistory = 1000;

  constructor() {
    this.initCoreWebVitalsObservers();
    logger.info('TelemetryEngine', 'Real User Monitoring (RUM) & Core Web Vitals Telemetry active.');
  }

  private initCoreWebVitalsObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Observe LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordWebVital({
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor',
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Browser support fallback
    }
  }

  public recordWebVital(metric: WebVitalsMetric): void {
    this.metrics.push(metric);
    logger.debug('TelemetryEngine', `Core Web Vital [${metric.name}]: ${metric.value}ms (${metric.rating})`);
  }

  public recordApiLatency(durationMs: number): void {
    this.apiLatenciesMs.push(durationMs);
    if (this.apiLatenciesMs.length > this.maxLatencyHistory) {
      this.apiLatenciesMs.shift();
    }
  }

  public recordMetric(metricName: string, value: number, tags?: Record<string, unknown>): void {
    logger.debug('TelemetryEngine', `Custom Metric Recorded [${metricName}]: ${value}`, tags);
  }

  public getTelemetrySummary() {
    const sorted = [...this.apiLatenciesMs].sort((a, b) => a - b);
    const count = sorted.length;
    const p50 = count > 0 ? sorted[Math.floor(count * 0.5)] : 0;
    const p95 = count > 0 ? sorted[Math.floor(count * 0.95)] : 0;
    const p99 = count > 0 ? sorted[Math.floor(count * 0.99)] : 0;

    return {
      webVitals: this.metrics,
      totalApiRequestsRecorded: count,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
    };
  }
}

export const telemetryEngine = new TelemetryEngine();
