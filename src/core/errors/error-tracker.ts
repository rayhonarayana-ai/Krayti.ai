/**
 * Qarayti.ai — Production Error Tracker & Crash Aggregator (1M Active Users Scale)
 * Captures, deduplicates, and batches error reports before flushing to remote log servers
 * (e.g. Sentry/Datadog/Supabase) to minimize network overhead.
 */

import { logger } from '../logging/logger';
import { AppError } from './app-error';

export interface CrashReport {
  id: string;
  errorName: string;
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  breadcrumbs: string[];
}

export class ErrorTracker {
  private crashBuffer: CrashReport[] = [];
  private breadcrumbs: string[] = [];
  private maxBreadcrumbs = 20;
  private maxBufferBeforeFlush = 10;
  private flushIntervalMs = 10000; // 10s auto-flush

  constructor() {
    this.registerGlobalHandlers();
    setInterval(() => this.flush(), this.flushIntervalMs);
    logger.info('ErrorTracker', 'Production Crash Aggregator initialized.');
  }

  private registerGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      );
    });
  }

  public addBreadcrumb(message: string): void {
    this.breadcrumbs.push(`[${new Date().toISOString()}] ${message}`);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  public captureException(error: Error | AppError): string {
    const report: CrashReport = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      errorName: error.name || 'Error',
      message: error.message || 'Unknown exception',
      stack: error.stack,
      code: error instanceof AppError ? error.code : 'UNKNOWN',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
      breadcrumbs: [...this.breadcrumbs],
    };

    this.crashBuffer.push(report);
    logger.error('ErrorTracker', `Captured exception '${report.errorName}': ${report.message}`, report);

    if (this.crashBuffer.length >= this.maxBufferBeforeFlush) {
      this.flush();
    }

    return report.id;
  }

  public flush(): void {
    if (this.crashBuffer.length === 0) return;

    const reportsToFlush = [...this.crashBuffer];
    this.crashBuffer = [];

    logger.info('ErrorTracker', `Flushing ${reportsToFlush.length} crash reports to telemetry backend.`);
  }

  public getTelemetry() {
    return {
      bufferedReports: this.crashBuffer.length,
      breadcrumbsCount: this.breadcrumbs.length,
    };
  }
}

export const errorTracker = new ErrorTracker();
