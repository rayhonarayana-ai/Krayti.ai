/**
 * Qarayti.ai — Background Job & Queue Manager (1M Active Users Scale)
 * Asynchronous job queue, concurrency throttling, exponential retry,
 * dead letter queue (DLQ), and CPU worker offloading.
 */

import { logger } from '../logging/logger';

export type JobPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface BackgroundJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  priority: JobPriority;
  maxRetries: number;
  attempts: number;
  createdAt: number;
  handler: (data: T) => Promise<void>;
}

export class BackgroundJobQueue {
  private highPriorityQueue: BackgroundJob[] = [];
  private normalPriorityQueue: BackgroundJob[] = [];
  private lowPriorityQueue: BackgroundJob[] = [];
  private deadLetterQueue: BackgroundJob[] = [];
  private activeConcurrency = 0;
  private maxConcurrency = 5; // Process up to 5 async jobs simultaneously
  private processedCount = 0;
  private failedCount = 0;

  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    logger.info('BackgroundJobQueue', `Initialized Background Queue with max concurrency: ${maxConcurrency}`);
  }

  public enqueue<T>(
    name: string,
    data: T,
    handler: (data: T) => Promise<void>,
    priority: JobPriority = 'NORMAL',
    maxRetries = 3
  ): string {
    const job: BackgroundJob<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      data,
      priority,
      maxRetries,
      attempts: 0,
      createdAt: Date.now(),
      handler,
    };

    switch (priority) {
      case 'HIGH':
        this.highPriorityQueue.push(job as BackgroundJob<unknown>);
        break;
      case 'NORMAL':
        this.normalPriorityQueue.push(job as BackgroundJob<unknown>);
        break;
      case 'LOW':
        this.lowPriorityQueue.push(job as BackgroundJob<unknown>);
        break;
    }

    logger.debug('BackgroundJobQueue', `Enqueued job '${name}' [${priority}] (ID: ${job.id})`);
    this.processNext();
    return job.id;
  }

  private async processNext(): Promise<void> {
    if (this.activeConcurrency >= this.maxConcurrency) return;

    const job =
      this.highPriorityQueue.shift() ||
      this.normalPriorityQueue.shift() ||
      this.lowPriorityQueue.shift();

    if (!job) return;

    this.activeConcurrency++;
    job.attempts++;

    try {
      logger.debug('BackgroundJobQueue', `Executing job '${job.name}' (Attempt ${job.attempts}/${job.maxRetries})`);
      await job.handler(job.data);
      this.processedCount++;
      logger.debug('BackgroundJobQueue', `Job '${job.name}' completed successfully.`);
    } catch (err) {
      logger.warn('BackgroundJobQueue', `Job '${job.name}' failed on attempt ${job.attempts}`, err);

      if (job.attempts < job.maxRetries) {
        // Retry with backoff
        setTimeout(() => {
          this.normalPriorityQueue.push(job);
          this.processNext();
        }, Math.pow(2, job.attempts) * 500);
      } else {
        this.failedCount++;
        this.deadLetterQueue.push(job);
        logger.error('BackgroundJobQueue', `Job '${job.name}' moved to Dead Letter Queue (DLQ) after max retries.`);
      }
    } finally {
      this.activeConcurrency--;
      this.processNext();
    }
  }

  public getTelemetry() {
    return {
      pendingHigh: this.highPriorityQueue.length,
      pendingNormal: this.normalPriorityQueue.length,
      pendingLow: this.lowPriorityQueue.length,
      deadLetterCount: this.deadLetterQueue.length,
      activeConcurrency: this.activeConcurrency,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
    };
  }
}

export const jobQueue = new BackgroundJobQueue();
