/**
 * Qarayti.ai — AI Rate Limiter
 * Implements sliding window rate limiting for Faheem API requests
 */

import { logger } from '../../logging/logger';

export class FaheemRateLimiter {
  private userBuckets = new Map<string, number[]>();
  private maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute = 30) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  public isAllowed(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    const timestamps = this.userBuckets.get(userId) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequestsPerMinute) {
      logger.warn('FaheemRateLimiter', `Rate limit exceeded for user: ${userId}`);
      return false;
    }

    validTimestamps.push(now);
    this.userBuckets.set(userId, validTimestamps);
    return true;
  }
}
