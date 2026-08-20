/**
 * Qarayti.ai — Core Event Bus (Domain Events Architecture)
 * Central pub/sub broker enabling asynchronous, decoupled event-driven communication
 * across Student, Teacher, Parent, School OS, Super Admin, Faheem AI, and Adaptive Engine.
 */

import { logger } from '../logging/logger';
import { realtimeEngine } from '../realtime/realtime-engine';

export enum QaraytiEventType {
  // Student Portal Events
  STUDENT_EXERCISE_COMPLETED = 'STUDENT_EXERCISE_COMPLETED',
  STUDENT_HOMEWORK_SUBMITTED = 'STUDENT_HOMEWORK_SUBMITTED',
  STUDENT_LESSON_FINISHED = 'STUDENT_LESSON_FINISHED',
  STUDENT_GOAL_UPDATED = 'STUDENT_GOAL_UPDATED',

  // Teacher Portal Events
  TEACHER_ASSIGNMENT_CREATED = 'TEACHER_ASSIGNMENT_CREATED',
  TEACHER_GRADE_RECORDED = 'TEACHER_GRADE_RECORDED',
  TEACHER_ATTENDANCE_MARKED = 'TEACHER_ATTENDANCE_MARKED',
  TEACHER_LESSON_PLAN_PUBLISHED = 'TEACHER_LESSON_PLAN_PUBLISHED',

  // Parent Portal Events
  PARENT_FEE_PAID = 'PARENT_FEE_PAID',
  PARENT_MESSAGE_SENT = 'PARENT_MESSAGE_SENT',
  PARENT_JUSTIFICATION_SUBMITTED = 'PARENT_JUSTIFICATION_SUBMITTED',

  // School OS Events
  SCHOOL_LICENSE_UPDATED = 'SCHOOL_LICENSE_UPDATED',
  SCHOOL_STUDENT_ENROLLED = 'SCHOOL_STUDENT_ENROLLED',
  MASSAR_SYNC_COMPLETED = 'MASSAR_SYNC_COMPLETED',

  // AI & Adaptive Engine Events
  FAHEEM_TUTOR_INTERACTION = 'FAHEEM_TUTOR_INTERACTION',
  ADAPTIVE_SKILL_MASTERED = 'ADAPTIVE_SKILL_MASTERED',
  ADAPTIVE_DIAGNOSTIC_TRIGGERED = 'ADAPTIVE_DIAGNOSTIC_TRIGGERED',
  ADAPTIVE_REVISION_SCHEDULED = 'ADAPTIVE_REVISION_SCHEDULED',
  ADAPTIVE_GAP_REMEDIATED = 'ADAPTIVE_GAP_REMEDIATED',
  CONTENT_KNOWLEDGE_OBJECT_PUBLISHED = 'CONTENT_KNOWLEDGE_OBJECT_PUBLISHED',

  // Platform & Security Events
  NOTIFICATION_DISPATCHED = 'NOTIFICATION_DISPATCHED',
  SECURITY_ALERT_RAISED = 'SECURITY_ALERT_RAISED',
  SUPER_ADMIN_CONFIG_CHANGED = 'SUPER_ADMIN_CONFIG_CHANGED',
}

export interface QaraytiDomainEvent<T = Record<string, unknown>> {
  id: string;
  type: QaraytiEventType;
  timestamp: string;
  actorId: string;
  actorRole: 'STUDENT' | 'TEACHER' | 'PARENT' | 'SCHOOL_MANAGER' | 'SUPER_ADMIN' | 'SYSTEM';
  schoolId?: string;
  payload: T;
  correlationId?: string;
}

import { integrationPolicyEngine, idempotencyEngine, traceEngine } from './governance';

export type QaraytiEventHandler<T = any> = (event: QaraytiDomainEvent<T>) => void | Promise<void>;

export interface DeadLetterQueueItem {
  id: string;
  event: QaraytiDomainEvent;
  errorReason: string;
  failedAt: string;
  retryCount: number;
}

export interface EventBusMetrics {
  totalPublished: number;
  totalDelivered: number;
  totalFailed: number;
  eventsPerMinute: number;
  deadLetterCount: number;
}

export class QaraytiEventBus {
  private static instance: QaraytiEventBus;
  private handlers = new Map<QaraytiEventType, Set<QaraytiEventHandler>>();
  private eventHistory: QaraytiDomainEvent[] = [];
  private deadLetterQueue: DeadLetterQueueItem[] = [];
  private maxHistorySize = 500;
  private totalPublishedCount = 0;
  private totalDeliveredCount = 0;
  private totalFailedCount = 0;
  private startTime = Date.now();

  private constructor() {
    logger.info('QaraytiEventBus', 'Core Domain Event Bus initialized with DLQ & Retry Policy.');
  }

  public static getInstance(): QaraytiEventBus {
    if (!QaraytiEventBus.instance) {
      QaraytiEventBus.instance = new QaraytiEventBus();
    }
    return QaraytiEventBus.instance;
  }

  /**
   * Subscribe a handler function to a specific domain event type.
   */
  public subscribe<T = Record<string, unknown>>(
    eventType: QaraytiEventType,
    handler: QaraytiEventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const typeHandlers = this.handlers.get(eventType)!;
    typeHandlers.add(handler as QaraytiEventHandler);

    logger.debug('QaraytiEventBus', `Subscribed handler to domain event: '${eventType}'`);

    return () => {
      typeHandlers.delete(handler as QaraytiEventHandler);
    };
  }

  /**
   * Publish a domain event to all local subscribers and mirror to Realtime WebSockets.
   */
  public async publish<T = Record<string, unknown>>(
    type: QaraytiEventType,
    actorId: string,
    actorRole: QaraytiDomainEvent['actorRole'],
    payload: T,
    schoolId?: string,
    correlationId?: string
  ): Promise<QaraytiDomainEvent<T>> {
    // 1. Governance Policy Check (RBAC Authorization)
    const policyCheck = integrationPolicyEngine.authorizePublish(type, actorRole);
    if (!policyCheck.isAuthorized) {
      throw new Error(`Governance Policy Violation: ${policyCheck.reason}`);
    }

    // Sanitize Payload for PII
    const sanitizedPayload = integrationPolicyEngine.sanitizePayload(payload as any) as T;

    const event: QaraytiDomainEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      schoolId: schoolId || undefined,
      payload: sanitizedPayload,
      correlationId: correlationId || `corr-${Date.now()}`,
    };

    // 2. Idempotency Engine Check
    const businessId =
      (sanitizedPayload as any)?.submissionId ||
      (sanitizedPayload as any)?.attemptId ||
      (sanitizedPayload as any)?.completionId ||
      (sanitizedPayload as any)?.remediationId ||
      (sanitizedPayload as any)?.masteryId;
    const idempotencyKey = businessId
      ? `idem-${type}-${actorId}-${businessId}`
      : `idem-${type}-${actorId}-${JSON.stringify(sanitizedPayload)}`;
    const idemCheck = idempotencyEngine.checkAndLock(idempotencyKey);
    if (idemCheck.isDuplicate && idemCheck.status === 'COMPLETED') {
      logger.info('QaraytiEventBus', `Idempotent execution skipped duplicate event: ${type}`);
      return event;
    }

    // 3. Start Distributed Trace Span
    const traceId = traceEngine.createTrace(type);
    const busSpan = traceEngine.startSpan(traceId, 'EventBusHub', `Dispatch:${type}`, undefined, {
      actorRole,
      actorId,
    });

    this.totalPublishedCount++;

    // Keep in bounded history
    this.eventHistory.unshift(event as QaraytiDomainEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Broadcast over Realtime WebSocket Engine
    realtimeEngine.publish('qarayti-domain-bus', type, event);

    // Execute local handlers with exception trapping for DLQ
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers && typeHandlers.size > 0) {
      const promises: Array<Promise<void> | void> = [];
      typeHandlers.forEach((handler) => {
        try {
          const res = handler(event);
          if (res && typeof (res as Promise<void>).then === 'function') {
            promises.push(
              (res as Promise<void>).catch((err) => {
                this.handleHandlerFailure(event, err);
              })
            );
          } else {
            this.totalDeliveredCount++;
          }
        } catch (err) {
          this.handleHandlerFailure(event, err);
        }
      });

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            this.totalDeliveredCount++;
          }
        });
      }
    } else {
      this.totalDeliveredCount++;
    }

    idempotencyEngine.markCompleted(idempotencyKey, { eventId: event.id });
    traceEngine.endSpan(traceId, busSpan.spanId, 'OK', { eventId: event.id });

    logger.info('QaraytiEventBus', `Published domain event '${type}' [Actor: ${actorRole}:${actorId}] [TraceId: ${traceId}]`);
    return event;
  }

  private handleHandlerFailure(event: QaraytiDomainEvent<any>, error: any): void {
    this.totalFailedCount++;
    const dlqItem: DeadLetterQueueItem = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event: event as QaraytiDomainEvent,
      errorReason: String(error?.message || error || 'Unknown handler execution error'),
      failedAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.deadLetterQueue.unshift(dlqItem);
    logger.error('QaraytiEventBus', `Pushed event to Dead Letter Queue (DLQ): ${event.type}`, error);
  }

  /**
   * Re-play a Dead Letter Queue event back into the handler subscribers.
   */
  public async replayDlqItem(dlqId: string): Promise<boolean> {
    const index = this.deadLetterQueue.findIndex((item) => item.id === dlqId);
    if (index === -1) return false;

    const dlqItem = this.deadLetterQueue[index];
    dlqItem.retryCount++;

    const typeHandlers = this.handlers.get(dlqItem.event.type);
    if (typeHandlers) {
      try {
        for (const handler of typeHandlers) {
          await handler(dlqItem.event);
        }
        // Successfully replayed -> remove from DLQ
        this.deadLetterQueue.splice(index, 1);
        this.totalDeliveredCount++;
        logger.info('QaraytiEventBus', `Replayed DLQ Item '${dlqId}' successfully.`);
        return true;
      } catch (err) {
        dlqItem.errorReason = `Retry ${dlqItem.retryCount} failed: ${String(err)}`;
        return false;
      }
    }
    return false;
  }

  public getDeadLetterQueue(): DeadLetterQueueItem[] {
    return this.deadLetterQueue;
  }

  public getMetrics(): EventBusMetrics {
    const elapsedMinutes = Math.max((Date.now() - this.startTime) / 60000, 0.1);
    return {
      totalPublished: this.totalPublishedCount,
      totalDelivered: this.totalDeliveredCount,
      totalFailed: this.totalFailedCount,
      eventsPerMinute: Math.round(this.totalPublishedCount / elapsedMinutes),
      deadLetterCount: this.deadLetterQueue.length,
    };
  }

  /**
   * Retrieve bounded event history for audit logs & analytics.
   */
  public getHistory(limit: number = 50, filterType?: QaraytiEventType): QaraytiDomainEvent[] {
    let filtered = this.eventHistory;
    if (filterType) {
      filtered = filtered.filter((e) => e.type === filterType);
    }
    return filtered.slice(0, limit);
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const qaraytiEventBus = QaraytiEventBus.getInstance();
