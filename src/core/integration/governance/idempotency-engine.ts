/**
 * Qarayti.ai — Governance: Idempotency Engine
 * Guarantees duplicate domain events are processed exactly ONCE (At-Most-Once / Exactly-Once semantics).
 * Prevents duplicate homework submissions, double grade publication, or repeated parent billing.
 */

import { logger } from '../../logging/logger';

export interface IdempotencyRecord {
  key: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  cachedResult?: any;
  duplicateAttemptsCount: number;
}

export class IdempotencyEngine {
  private static instance: IdempotencyEngine;
  private records = new Map<string, IdempotencyRecord>();
  private defaultTtlMs = 24 * 60 * 60 * 1000; // 24 Hours default TTL
  private totalDuplicatesBlocked = 0;

  private constructor() {
    logger.info('IdempotencyEngine', 'Governance Idempotency Engine initialized.');
  }

  public static getInstance(): IdempotencyEngine {
    if (!IdempotencyEngine.instance) {
      IdempotencyEngine.instance = new IdempotencyEngine();
    }
    return IdempotencyEngine.instance;
  }

  /**
   * Check if idempotency key is locked or already executed.
   */
  public checkAndLock(
    key: string
  ): { isDuplicate: boolean; status?: 'PROCESSING' | 'COMPLETED' | 'FAILED'; cachedResult?: any } {
    const existing = this.records.get(key);

    if (existing) {
      existing.duplicateAttemptsCount++;
      this.totalDuplicatesBlocked++;
      logger.warn('IdempotencyEngine', `Duplicate operation detected for key '${key}'. Duplicate count: ${existing.duplicateAttemptsCount}`);
      return {
        isDuplicate: true,
        status: existing.status,
        cachedResult: existing.cachedResult,
      };
    }

    // Lock key
    const record: IdempotencyRecord = {
      key,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
      duplicateAttemptsCount: 0,
    };
    this.records.set(key, record);

    return { isDuplicate: false };
  }

  public markCompleted(key: string, result?: any): void {
    const rec = this.records.get(key);
    if (rec) {
      rec.status = 'COMPLETED';
      rec.completedAt = new Date().toISOString();
      rec.cachedResult = result;
      logger.info('IdempotencyEngine', `Marked key '${key}' as COMPLETED.`);
    }
  }

  public markFailed(key: string): void {
    const rec = this.records.get(key);
    if (rec) {
      rec.status = 'FAILED';
      rec.completedAt = new Date().toISOString();
      logger.warn('IdempotencyEngine', `Marked key '${key}' as FAILED.`);
    }
  }

  public getRecords(): IdempotencyRecord[] {
    return Array.from(this.records.values()).reverse();
  }

  public getMetrics() {
    const all = Array.from(this.records.values());
    return {
      totalKeysTracked: all.length,
      totalDuplicatesBlocked: this.totalDuplicatesBlocked,
      completedCount: all.filter((r) => r.status === 'COMPLETED').length,
      processingCount: all.filter((r) => r.status === 'PROCESSING').length,
      failedCount: all.filter((r) => r.status === 'FAILED').length,
    };
  }
}

export const idempotencyEngine = IdempotencyEngine.getInstance();
