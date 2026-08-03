/**
 * Qarayti.ai — Faheem AI Engine Startup Registration
 * Boots and registers all Faheem AI Engine singletons in the DI container
 */

import { container, ServiceLifetime } from '../di/container';
import { FaheemToolRegistry } from './tools/tool-registry';
import { FaheemToolDispatcher } from './tools/tool-dispatcher';
import { GeminiApiAdapter } from './pipeline/gemini-adapter';
import { FaheemSafetyLayer } from './safety/safety-layer';
import { FaheemResponsePipeline } from './pipeline/response-pipeline';
import { FaheemCostOptimizer } from './governance/cost-optimizer';
import { FaheemRateLimiter } from './governance/rate-limiter';
import { FaheemTelemetry } from './monitoring/faheem-telemetry';
import { FaheemHealthCheck } from './monitoring/faheem-health';
import { FaheemMemoryManager } from './memory/memory-manager';
import { FaheemSessionManager } from './session/session-manager';
import { FaheemConversationManager } from './session/conversation-manager';
import { FaheemOrchestrator } from './orchestrator/faheem-orchestrator';
import { IFaheemRepository, FaheemRepositoryImpl } from '../../domain/repositories/faheem.repository';
import {
  ProcessFaheemQueryUseCase,
  StartFaheemSessionUseCase,
  GetFaheemMetricsUseCase,
} from '../../domain/usecases/faheem.usecases';
import { FaheemService } from '../../domain/services/faheem.service';
import { logger } from '../logging/logger';

export function registerFaheemAiEngine(): void {
  logger.info('FaheemStartup', 'Registering Faheem AI Engine subsystems in DI Container...');

  // 1. Tooling & Pipeline Infrastructure
  container.register('FaheemToolRegistry', () => new FaheemToolRegistry(), ServiceLifetime.SINGLETON);
  container.register(
    'FaheemToolDispatcher',
    (c) => new FaheemToolDispatcher(c.resolve<FaheemToolRegistry>('FaheemToolRegistry')),
    ServiceLifetime.SINGLETON
  );
  container.register('GeminiApiAdapter', () => new GeminiApiAdapter(), ServiceLifetime.SINGLETON);
  container.register('FaheemSafetyLayer', () => new FaheemSafetyLayer(), ServiceLifetime.SINGLETON);

  container.register(
    'FaheemResponsePipeline',
    (c) =>
      new FaheemResponsePipeline(
        c.resolve<GeminiApiAdapter>('GeminiApiAdapter'),
        c.resolve<FaheemToolRegistry>('FaheemToolRegistry'),
        c.resolve<FaheemToolDispatcher>('FaheemToolDispatcher'),
        c.resolve<FaheemSafetyLayer>('FaheemSafetyLayer')
      ),
    ServiceLifetime.SINGLETON
  );

  // 2. Governance, Memory & Telemetry
  container.register('FaheemCostOptimizer', () => new FaheemCostOptimizer(), ServiceLifetime.SINGLETON);
  container.register('FaheemRateLimiter', () => new FaheemRateLimiter(60), ServiceLifetime.SINGLETON);
  container.register(
    'FaheemTelemetry',
    (c) => new FaheemTelemetry(c.resolve<FaheemCostOptimizer>('FaheemCostOptimizer')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'FaheemHealthCheck',
    (c) => new FaheemHealthCheck(c.resolve<FaheemToolRegistry>('FaheemToolRegistry')),
    ServiceLifetime.SINGLETON
  );

  container.register('FaheemMemoryManager', () => new FaheemMemoryManager(), ServiceLifetime.SINGLETON);
  container.register('FaheemSessionManager', () => new FaheemSessionManager(), ServiceLifetime.SINGLETON);
  container.register(
    'FaheemConversationManager',
    (c) => new FaheemConversationManager(c.resolve<FaheemMemoryManager>('FaheemMemoryManager')),
    ServiceLifetime.SINGLETON
  );

  // 3. Orchestrator
  container.register(
    'FaheemOrchestrator',
    (c) =>
      new FaheemOrchestrator(
        c.resolve<FaheemSessionManager>('FaheemSessionManager'),
        c.resolve<FaheemConversationManager>('FaheemConversationManager'),
        c.resolve<FaheemResponsePipeline>('FaheemResponsePipeline'),
        c.resolve<FaheemTelemetry>('FaheemTelemetry'),
        c.resolve<FaheemRateLimiter>('FaheemRateLimiter')
      ),
    ServiceLifetime.SINGLETON
  );

  // 4. Domain Layer Repositories, UseCases & Service
  container.register<IFaheemRepository>(
    'FaheemRepository',
    (c) => new FaheemRepositoryImpl(c.resolve<FaheemOrchestrator>('FaheemOrchestrator')),
    ServiceLifetime.SINGLETON
  );

  container.register(
    'ProcessFaheemQueryUseCase',
    (c) => new ProcessFaheemQueryUseCase(c.resolve<IFaheemRepository>('FaheemRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'StartFaheemSessionUseCase',
    (c) => new StartFaheemSessionUseCase(c.resolve<IFaheemRepository>('FaheemRepository')),
    ServiceLifetime.SINGLETON
  );
  container.register(
    'GetFaheemMetricsUseCase',
    (c) => new GetFaheemMetricsUseCase(c.resolve<IFaheemRepository>('FaheemRepository')),
    ServiceLifetime.SINGLETON
  );

  container.register(
    'FaheemService',
    (c) =>
      new FaheemService(
        c.resolve<ProcessFaheemQueryUseCase>('ProcessFaheemQueryUseCase'),
        c.resolve<StartFaheemSessionUseCase>('StartFaheemSessionUseCase'),
        c.resolve<GetFaheemMetricsUseCase>('GetFaheemMetricsUseCase')
      ),
    ServiceLifetime.SINGLETON
  );

  logger.info('FaheemStartup', 'Faheem AI Engine singletons registered successfully.');
}
