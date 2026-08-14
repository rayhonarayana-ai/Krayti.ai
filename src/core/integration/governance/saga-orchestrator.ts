/**
 * Qarayti.ai — Governance: Distributed Saga Orchestrator
 * Manages long-running, multi-step distributed transactions across portals.
 * Executes compensating actions (rollback) automatically if any step fails.
 */

import { logger } from '../../logging/logger';

export interface SagaStepContext<T = any> {
  payload: T;
  stepResults: Record<string, any>;
  sagaId: string;
  correlationId: string;
}

export interface SagaStep<T = any> {
  name: string;
  service: string;
  execute: (ctx: SagaStepContext<T>) => Promise<any>;
  compensate: (ctx: SagaStepContext<T>) => Promise<void>;
}

export interface SagaDefinition<T = any> {
  name: string;
  steps: SagaStep<T>[];
}

export interface SagaInstanceRecord {
  id: string;
  sagaName: string;
  correlationId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  currentStepIndex: number;
  totalSteps: number;
  executedSteps: string[];
  compensatedSteps: string[];
  failureReason?: string;
  startedAt: string;
  completedAt?: string;
  stepResults: Record<string, any>;
}

export class SagaOrchestrator {
  private static instance: SagaOrchestrator;
  private sagaDefinitions = new Map<string, SagaDefinition>();
  private activeInstances = new Map<string, SagaInstanceRecord>();
  private instanceHistory: SagaInstanceRecord[] = [];

  private constructor() {
    logger.info('SagaOrchestrator', 'Governance Saga Orchestrator initialized.');
    this.registerBuiltInSagas();
  }

  public static getInstance(): SagaOrchestrator {
    if (!SagaOrchestrator.instance) {
      SagaOrchestrator.instance = new SagaOrchestrator();
    }
    return SagaOrchestrator.instance;
  }

  public registerSaga<T>(definition: SagaDefinition<T>): void {
    this.sagaDefinitions.set(definition.name, definition);
    logger.info('SagaOrchestrator', `Registered Saga Definition: ${definition.name} (${definition.steps.length} steps)`);
  }

  public async executeSaga<T = any>(
    sagaName: string,
    initialPayload: T,
    correlationId?: string
  ): Promise<SagaInstanceRecord> {
    const def = this.sagaDefinitions.get(sagaName);
    if (!def) {
      throw new Error(`Saga '${sagaName}' is not registered in the Orchestrator.`);
    }

    const sagaId = `saga-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const corrId = correlationId || `corr-${Date.now()}`;

    const instance: SagaInstanceRecord = {
      id: sagaId,
      sagaName,
      correlationId: corrId,
      status: 'RUNNING',
      currentStepIndex: 0,
      totalSteps: def.steps.length,
      executedSteps: [],
      compensatedSteps: [],
      startedAt: new Date().toISOString(),
      stepResults: {},
    };

    this.activeInstances.set(sagaId, instance);

    const ctx: SagaStepContext<T> = {
      payload: initialPayload,
      stepResults: {},
      sagaId,
      correlationId: corrId,
    };

    let failedStepIndex = -1;

    // Execute Forward Steps
    for (let i = 0; i < def.steps.length; i++) {
      const step = def.steps[i];
      instance.currentStepIndex = i;

      try {
        logger.info('SagaOrchestrator', `[Saga: ${sagaName}] Executing step ${i + 1}/${def.steps.length}: ${step.name}`);
        const result = await step.execute(ctx);
        ctx.stepResults[step.name] = result || { status: 'OK' };
        instance.stepResults[step.name] = result || { status: 'OK' };
        instance.executedSteps.push(step.name);
      } catch (err: any) {
        logger.error('SagaOrchestrator', `[Saga: ${sagaName}] Step '${step.name}' FAILED! Initiating Rollback Compensation.`, err);
        instance.status = 'FAILED';
        instance.failureReason = `Step '${step.name}' failed: ${err.message || String(err)}`;
        failedStepIndex = i;
        break;
      }
    }

    // If step failed, execute Compensation in Reverse Order
    if (failedStepIndex !== -1) {
      for (let j = failedStepIndex - 1; j >= 0; j--) {
        const stepToRollback = def.steps[j];
        try {
          logger.warn('SagaOrchestrator', `[Saga: ${sagaName}] Compensating step ${j + 1}: ${stepToRollback.name}`);
          await stepToRollback.compensate(ctx);
          instance.compensatedSteps.push(stepToRollback.name);
        } catch (compErr) {
          logger.error('SagaOrchestrator', `[Saga: ${sagaName}] Compensation for '${stepToRollback.name}' failed!`, compErr);
        }
      }
      instance.status = 'ROLLED_BACK';
    } else {
      instance.status = 'COMPLETED';
    }

    instance.completedAt = new Date().toISOString();
    this.activeInstances.delete(sagaId);
    this.instanceHistory.unshift(instance);

    if (this.instanceHistory.length > 100) {
      this.instanceHistory.pop();
    }

    return instance;
  }

  private registerBuiltInSagas(): void {
    // 1. Student Registration & Provisioning Saga
    this.registerSaga({
      name: 'StudentRegistrationSaga',
      steps: [
        {
          name: 'CreateSchoolOSRecord',
          service: 'School OS',
          execute: async () => ({ studentId: 'stu-884', created: true }),
          compensate: async () => logger.info('Compensation', 'Removed student record from School OS'),
        },
        {
          name: 'ProvisionFaheemAITutor',
          service: 'Faheem AI Copilot',
          execute: async () => ({ modelContextId: 'ctx-faheem-884', ready: true }),
          compensate: async () => logger.info('Compensation', 'Deprovisioned Faheem AI context'),
        },
        {
          name: 'InitAdaptiveLearningProfile',
          service: 'Adaptive Engine',
          execute: async () => ({ theta: 0.0, pKnown: 0.15 }),
          compensate: async () => logger.info('Compensation', 'Deleted adaptive state profile'),
        },
        {
          name: 'LinkParentNotification',
          service: 'Notification Gateway',
          execute: async () => ({ parentNotified: true }),
          compensate: async () => logger.info('Compensation', 'Sent cancellation SMS to parent'),
        },
      ],
    });

    // 2. School License Onboarding Saga
    this.registerSaga({
      name: 'SchoolLicenseActivationSaga',
      steps: [
        {
          name: 'VerifyPaymentAndQuota',
          service: 'Super Admin Billing',
          execute: async () => ({ paymentVerified: true, quota: 2000 }),
          compensate: async () => logger.info('Compensation', 'Refunded billing transaction'),
        },
        {
          name: 'UpgradeSchoolOSTier',
          service: 'School OS',
          execute: async () => ({ tier: 'PRO_EXCELLENCE' }),
          compensate: async () => logger.info('Compensation', 'Downgraded School OS back to FREE'),
        },
        {
          name: 'ProvisionSchoolTeacherLicenses',
          service: 'Teacher Portal',
          execute: async () => ({ allocatedTeachers: 50 }),
          compensate: async () => logger.info('Compensation', 'Revoked allocated teacher licenses'),
        },
      ],
    });
  }

  public getHistory(): SagaInstanceRecord[] {
    return this.instanceHistory;
  }

  public getSagaDefinitions(): string[] {
    return Array.from(this.sagaDefinitions.keys());
  }
}

export const sagaOrchestrator = SagaOrchestrator.getInstance();
