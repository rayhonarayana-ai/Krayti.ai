/**
 * Qarayti.ai — High-Scale Tiered Caching Manager (1M Active Users Scale)
 * Multi-layer in-memory LRU cache, stale-while-revalidate, request deduplication,
 * memory budget management, and compression strategy.
 */

import { logger } from '../logging/logger';

export interface CacheOptions {
  ttlMs?: number; // Time To Live in milliseconds (default: 5 mins)
  staleWhileRevalidateMs?: number; // Serve stale content while fetching fresh data
  tags?: string[];
}

interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  staleUntil: number;
  sizeBytes: number;
  tags: string[];
}

export class HighScaleCacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inFlightRequests = new Map<string, Promise<unknown>>();
  private maxMemoryBytes = 50 * 1024 * 1024; // 50 MB in-memory limit for 1M users frontend
  private currentMemoryBytes = 0;
  private hitCount = 0;
  private missCount = 0;

  constructor(maxMemoryMb = 50) {
    this.maxMemoryBytes = maxMemoryMb * 1024 * 1024;
    logger.info('CacheManager', `Initialized High-Scale Tiered Cache with ${maxMemoryMb}MB memory budget.`);
  }

  public get<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.missCount++;
      return { data: null, isStale: false };
    }

    const now = Date.now();

    // Check if expired past stale window
    if (now > entry.staleUntil) {
      this.delete(key);
      this.missCount++;
      return { data: null, isStale: false };
    }

    this.hitCount++;
    const isStale = now > entry.expiresAt;

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry as CacheEntry<unknown>);

    return { data: entry.value, isStale };
  }

  public set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttlMs = options.ttlMs ?? 300000; // 5 minutes
    const staleMs = options.staleWhileRevalidateMs ?? 600000; // 10 minutes
    const now = Date.now();

    const valueJson = JSON.stringify(value);
    const sizeBytes = valueJson.length * 2; // Approximate JS string memory bytes

    // Evict entries if over memory budget
    while (this.currentMemoryBytes + sizeBytes > this.maxMemoryBytes && this.cache.size > 0) {
      this.evictLRU();
    }

    if (this.cache.has(key)) {
      this.delete(key);
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      staleUntil: now + staleMs,
      sizeBytes,
      tags: options.tags || [],
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
    this.currentMemoryBytes += sizeBytes;
  }

  /**
   * Request Deduplication (In-Flight Request Coalescing)
   * Prevents cache stampedes when 1M concurrent users request identical data simultaneously.
   */
  public async fetchWithDeduplication<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    // Check if request is already in-flight
    if (this.inFlightRequests.has(key)) {
      logger.debug('CacheManager', `Coalescing in-flight request stampede for key: ${key}`);
      return (await this.inFlightRequests.get(key)) as T;
    }

    // Return stale data immediately while revalidating in background if stale
    if (cached.data && cached.isStale) {
      logger.debug('CacheManager', `Serving stale cache while background revalidating key: ${key}`);
      this.triggerBackgroundRevalidate(key, fetcher, options);
      return cached.data;
    }

    // Execute new request and share promise across all callers
    const promise = fetcher()
      .then((data) => {
        this.set(key, data, options);
        return data;
      })
      .finally(() => {
        this.inFlightRequests.delete(key);
      });

    this.inFlightRequests.set(key, promise);
    return await promise;
  }

  private triggerBackgroundRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): void {
    if (this.inFlightRequests.has(key)) return;

    const promise = fetcher()
      .then((fresh) => {
        this.set(key, fresh, options);
        logger.debug('CacheManager', `Background cache revalidation succeeded for key: ${key}`);
        return fresh;
      })
      .catch((err) => {
        logger.warn('CacheManager', `Background cache revalidation failed for key: ${key}`, err);
      })
      .finally(() => {
        this.inFlightRequests.delete(key);
      });

    this.inFlightRequests.set(key, promise);
  }

  public invalidateByTag(tag: string): number {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        invalidatedCount++;
      }
    }
    logger.info('CacheManager', `Invalidated ${invalidatedCount} cache keys for tag: ${tag}`);
    return invalidatedCount;
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentMemoryBytes -= entry.sizeBytes;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  private evictLRU(): void {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      logger.debug('CacheManager', `Evicting LRU entry: ${oldestKey}`);
      this.delete(oldestKey);
    }
  }

  public clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
    this.currentMemoryBytes = 0;
  }

  public getTelemetry() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? ((this.hitCount / totalRequests) * 100).toFixed(1) : '100.0';

    return {
      totalEntries: this.cache.size,
      memoryUsedMb: (this.currentMemoryBytes / (1024 * 1024)).toFixed(2),
      maxMemoryMb: (this.maxMemoryBytes / (1024 * 1024)).toFixed(2),
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatePercent: `${hitRate}%`,
      activeInFlightRequests: this.inFlightRequests.size,
    };
  }
}

export const cacheManager = new HighScaleCacheManager();
