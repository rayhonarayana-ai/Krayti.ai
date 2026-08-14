/**
 * Qarayti.ai — Core Integration Subsystem Bootstrapper
 * Registers Event Bus, Notification Engine, and Integration Workflow Engine into DI Container.
 */

import { container, ServiceLifetime } from '../di/container';
import { logger } from '../logging/logger';
import { qaraytiEventBus, QaraytiEventBus } from './event-bus';
import { qaraytiNotificationEngine, QaraytiNotificationEngine } from './notification-engine';
import { qaraytiIntegrationEngine, QaraytiIntegrationEngine } from './integration-engine';

export function registerCoreIntegrationSubsystems(): void {
  logger.info('IntegrationStartup', 'Registering Core Integration & Workflow Orchestration Subsystems...');

  container.register<QaraytiEventBus>('QaraytiEventBus', () => qaraytiEventBus, ServiceLifetime.SINGLETON);
  container.register<QaraytiNotificationEngine>('QaraytiNotificationEngine', () => qaraytiNotificationEngine, ServiceLifetime.SINGLETON);
  container.register<QaraytiIntegrationEngine>('QaraytiIntegrationEngine', () => qaraytiIntegrationEngine, ServiceLifetime.SINGLETON);

  logger.info('IntegrationStartup', 'Core Integration Subsystems successfully registered.');
}
