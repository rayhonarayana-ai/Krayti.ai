/**
 * Qarayti.ai — Governance: Integration Policy Engine
 * Defines security boundaries, event publishing permissions (RBAC), subscription authorization,
 * rate limits, and PII payload sanitization policies.
 */

import { logger } from '../../logging/logger';

export interface PolicyViolation {
  ruleId: string;
  eventType: string;
  actorRole: string;
  reason: string;
  timestamp: string;
}

export class IntegrationPolicyEngine {
  private static instance: IntegrationPolicyEngine;
  private violationsLog: PolicyViolation[] = [];

  // Allowed Publish Rules Matrix
  private publishRules: Record<string, string[]> = {
    STUDENT_EXERCISE_COMPLETED: ['STUDENT', 'SCHOOL_MANAGER', 'SUPER_ADMIN'],
    STUDENT_HOMEWORK_SUBMITTED: ['STUDENT'],
    TEACHER_GRADE_RECORDED: ['TEACHER', 'SCHOOL_MANAGER'],
    TEACHER_ATTENDANCE_MARKED: ['TEACHER', 'SCHOOL_MANAGER'],
    SCHOOL_LICENSE_UPDATED: ['SCHOOL_MANAGER', 'SUPER_ADMIN'],
    SCHOOL_STUDENT_ENROLLED: ['SCHOOL_MANAGER', 'SUPER_ADMIN'],
  };

  private constructor() {
    logger.info('IntegrationPolicyEngine', 'Governance Integration Policy Engine initialized.');
  }

  public static getInstance(): IntegrationPolicyEngine {
    if (!IntegrationPolicyEngine.instance) {
      IntegrationPolicyEngine.instance = new IntegrationPolicyEngine();
    }
    return IntegrationPolicyEngine.instance;
  }

  /**
   * Verify if an actor role is authorized to publish a specific domain event.
   */
  public authorizePublish(
    eventType: string,
    actorRole: string
  ): { isAuthorized: boolean; reason?: string } {
    const allowedRoles = this.publishRules[eventType];

    // If event type has defined rules
    if (allowedRoles && !allowedRoles.includes(actorRole) && actorRole !== 'SUPER_ADMIN') {
      const violation: PolicyViolation = {
        ruleId: 'POL-001-UNAUTHORIZED_PUBLISH',
        eventType,
        actorRole,
        reason: `Role '${actorRole}' is not permitted to publish event '${eventType}'. Allowed: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString(),
      };
      this.violationsLog.unshift(violation);
      logger.warn('IntegrationPolicyEngine', violation.reason);
      return { isAuthorized: false, reason: violation.reason };
    }

    return { isAuthorized: true };
  }

  /**
   * Sanitize PII payload attributes before public broadcast
   */
  public sanitizePayload<T extends Record<string, any>>(payload: T): T {
    if (!payload || typeof payload !== 'object') return payload;

    const sanitized = { ...payload };
    const piiFields = ['password', 'cinNumber', 'parentPhoneNumber', 'studentNationalCNE'];

    for (const key of Object.keys(sanitized)) {
      if (piiFields.includes(key) && typeof sanitized[key] === 'string') {
        const val = sanitized[key] as string;
        sanitized[key as keyof T] = (val.length > 4 ? val.substring(0, 3) + '****' : '****') as any;
      }
    }

    return sanitized;
  }

  public getViolations(): PolicyViolation[] {
    return this.violationsLog;
  }
}

export const integrationPolicyEngine = IntegrationPolicyEngine.getInstance();
