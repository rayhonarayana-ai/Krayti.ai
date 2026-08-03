/**
 * Qarayti.ai — AI Retry Policy
 * Exponential backoff with jitter for transient API errors
 */

import { logger } from '../../logging/logger';

export class FaheemRetryPolicy {
  public static async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 300
  ): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          logger.error('FaheemRetryPolicy', `Failed after ${maxRetries} attempts: ${(err as Error).message}`);
          throw err;
        }

        const jitter = Math.random() * 100;
        const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
        logger.warn('FaheemRetryPolicy', `Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Retry policy exceeded max retries.');
  }
}
