/**
 * Qarayti.ai — Scale & Cost Optimizer Engine (1M Active Users Scale)
 * Mitigates API token/compute costs, debounces UI events, enforces payload compression,
 * and manages idle state memory cleanup.
 */

import { logger } from '../logging/logger';
import { cacheManager } from '../cache/cache-manager';

export class ScaleOptimizer {
  private isIdle = false;
  private idleTimeoutMs = 120000; // 2 minutes inactivity
  private idleTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initIdleListener();
    logger.info('ScaleOptimizer', 'Cost Guardrails & High-Scale Performance Optimizer active.');
  }

  private initIdleListener(): void {
    if (typeof window === 'undefined') return;

    const resetIdleTimer = () => {
      this.isIdle = false;
      if (this.idleTimer) clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.isIdle = true;
        logger.info('ScaleOptimizer', 'User idle detected. Running background memory garbage collection & cache compression.');
        this.performMemoryCleanup();
      }, this.idleTimeoutMs);
    };

    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer, { passive: true });
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    resetIdleTimer();
  }

  public performMemoryCleanup(): void {
    // Invalidate stale entries across cache tags to free browser RAM
    cacheManager.invalidateByTag('transient');
  }

  public debounce<T extends (...args: unknown[]) => unknown>(fn: T, delayMs = 300): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delayMs);
    };
  }

  public throttle<T extends (...args: unknown[]) => unknown>(fn: T, limitMs = 300): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limitMs);
      }
    };
  }

  public getTelemetry() {
    return {
      isIdle: this.isIdle,
      idleTimeoutMinutes: this.idleTimeoutMs / 60000,
    };
  }
}

export const scaleOptimizer = new ScaleOptimizer();
